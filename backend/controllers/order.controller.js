import crypto from "crypto";
import mongoose from "mongoose";
import Order from "../models/order.model.js";
import customerModel from "../models/customerModel.js";
import Product from "../models/product.model.js";
import razorpay from "../config/razorpay.js";

/**
 * @desc    Validate cart, calculate trusted total, snapshot items, create ShopKart order & Razorpay order
 * @route   POST /orders/create-payment-order
 * @access  Private
 */
export const createPaymentOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    // 1. Validate shipping address fields
    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.addressLine1 ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.pincode
    ) {
      return res.status(400).json({
        success: false,
        message: "All shipping address fields are required.",
      });
    }

    const trimmedAddress = {
      fullName: String(shippingAddress.fullName).trim(),
      phone: String(shippingAddress.phone).trim(),
      addressLine1: String(shippingAddress.addressLine1).trim(),
      city: String(shippingAddress.city).trim(),
      state: String(shippingAddress.state).trim(),
      pincode: String(shippingAddress.pincode).trim(),
    };

    // Pincode validation: 6 digits
    if (!/^\d{6}$/.test(trimmedAddress.pincode)) {
      return res.status(400).json({
        success: false,
        message: "Pincode must contain exactly 6 digits.",
      });
    }

    // Phone validation: at least 10 digits
    if (!/^\+?\d{10,13}$/.test(trimmedAddress.phone.replace(/[\s-]/g, ""))) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid 10-digit phone number.",
      });
    }

    // 2. Fetch authenticated customer and their cart
    const user = await customerModel.findById(req.user._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty. Please add items before checking out.",
      });
    }

    // 3. Load latest product documents and verify stock & calculate server total
    let calculatedTotal = 0;
    const orderItemsSnapshot = [];

    for (const item of user.cart) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `A product in your cart is no longer available in the store.`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}, in cart: ${item.quantity}.`,
        });
      }

      const itemTotal = Number(product.price) * Number(item.quantity);
      calculatedTotal += itemTotal;

      // Build historical order snapshot
      orderItemsSnapshot.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image,
      });
    }

    if (calculatedTotal <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order total amount.",
      });
    }

    // 4. Create pending ShopKart order
    const shopKartOrder = await Order.create({
      user: user._id,
      items: orderItemsSnapshot,
      shippingAddress: trimmedAddress,
      totalAmount: calculatedTotal,
      paymentStatus: "PENDING",
      status: "PENDING_PAYMENT",
    });

    // 5. Create Razorpay order (amount in paise = rupees * 100)
    let razorpayOrderId = null;
    let razorpayKeyId = process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder";

    try {
      const amountInPaise = Math.round(calculatedTotal * 100);
      const rzpOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: shopKartOrder._id.toString(),
      });

      razorpayOrderId = rzpOrder.id;
      shopKartOrder.razorpayOrderId = razorpayOrderId;
      await shopKartOrder.save();
    } catch (rzpErr) {
      console.error("Razorpay order creation error:", rzpErr);
      // If Razorpay credentials are test/dummy and order creation fails, return error
      return res.status(500).json({
        success: false,
        message: "Failed to initialize payment gateway order.",
        error: rzpErr.message,
      });
    }

    // 6. Return safe checkout payload (NEVER send RAZORPAY_KEY_SECRET)
    return res.status(200).json({
      success: true,
      shopKartOrderId: shopKartOrder._id,
      razorpayOrderId: razorpayOrderId,
      amount: Math.round(calculatedTotal * 100),
      currency: "INR",
      key: razorpayKeyId,
    });
  } catch (error) {
    console.error("Error creating payment order:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while creating payment order.",
      error: error.message,
    });
  }
};

/**
 * @desc    Verify Razorpay HMAC signature, mark order PAID/PLACED, and clear cart
 * @route   POST /orders/verify-payment
 * @access  Private
 */
export const verifyPayment = async (req, res) => {
  try {
    const {
      shopKartOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !shopKartOrderId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification parameters.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ShopKart order ID.",
      });
    }

    // Load order
    const order = await Order.findById(shopKartOrderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    // Ensure order belongs to authenticated user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to verify payment for this order.",
      });
    }

    // Security check: Use the trusted razorpayOrderId stored in our database
    const trustedOrderId = order.razorpayOrderId;
    if (!trustedOrderId || trustedOrderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Razorpay order ID mismatch with stored order.",
      });
    }

    // HMAC SHA256 Signature verification
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(500).json({
        success: false,
        message: "Server Razorpay secret is not configured.",
      });
    }

    const payload = `${trustedOrderId}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      // Signature invalid: keep order pending/failed, DO NOT clear cart
      order.paymentStatus = "FAILED";
      await order.save();
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature. Verification failed.",
      });
    }

    // Signature is VALID: update order to PAID and PLACED
    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // Deduct stock for ordered items
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear authenticated user's cart in database
    await customerModel.findByIdAndUpdate(req.user._id, {
      $set: { cart: [] },
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully. Order confirmed.",
      order,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while verifying payment.",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all orders for the authenticated user (sorted newest first)
 * @route   GET /orders
 * @access  Private
 */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching orders.",
      error: error.message,
    });
  }
};

/**
 * @desc    Get single order by ID (with ownership check)
 * @route   GET /orders/:id
 * @access  Private
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format.",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    // Enforce ownership: user can only see their own order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access forbidden: you do not own this order.",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching order.",
      error: error.message,
    });
  }
};

/**
 * @desc    Bonus: Update order status (development / administrative simulator)
 * @route   PATCH /orders/:id/status
 * @access  Private
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`,
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}.`,
      order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating status.",
      error: error.message,
    });
  }
};
