import mongoose from "mongoose";
import customerModel from "../models/customerModel.js";
import Product from "../models/product.model.js";

// @desc    Add product to cart or increment quantity if already present
// @route   POST /cart/:productId
export const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Verify product exists in MongoDB
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check stock availability
    if (product.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: "Product is out of stock",
      });
    }

    const user = await customerModel.findById(req.user._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.cart) {
      user.cart = [];
    }

    // Check if product is already in user's cart
    const existingItem = user.cart.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + 1;
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: "Requested quantity exceeds available stock",
        });
      }
      existingItem.quantity = newQuantity;
    } else {
      if (1 > product.stock) {
        return res.status(400).json({
          success: false,
          message: "Requested quantity exceeds available stock",
        });
      }
      user.cart.push({ product: productId, quantity: 1 });
    }

    await user.save();

    await user.populate({
      path: "cart.product",
      select: "name price image stock category description",
    });

    const validCart = (user.cart || []).filter(
      (item) => item.product !== null && item.product !== undefined
    );

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: validCart,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while adding to cart",
      error: error.message,
    });
  }
};

// @desc    Get current user's populated cart
// @route   GET /cart
export const getCart = async (req, res) => {
  try {
    const user = await customerModel.findById(req.user._id).populate({
      path: "cart.product",
      select: "name price image stock category description",
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const validCart = (user.cart || []).filter(
      (item) => item.product !== null && item.product !== undefined
    );

    return res.status(200).json({
      success: true,
      cart: validCart,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching cart",
      error: error.message,
    });
  }
};

// @desc    Update product quantity in cart
// @route   PATCH /cart/:productId
export const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const numQuantity = Number(quantity);
    if (
      quantity === undefined ||
      quantity === null ||
      isNaN(numQuantity) ||
      !Number.isInteger(numQuantity) ||
      numQuantity < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be an integer of at least 1",
      });
    }

    // Verify product exists in MongoDB
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Validate against product stock
    if (numQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity exceeds available stock",
      });
    }

    const user = await customerModel.findById(req.user._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.cart) {
      user.cart = [];
    }

    const cartItem = user.cart.find(
      (item) => item.product.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Product not in cart",
      });
    }

    cartItem.quantity = numQuantity;
    await user.save();

    await user.populate({
      path: "cart.product",
      select: "name price image stock category description",
    });

    const validCart = (user.cart || []).filter(
      (item) => item.product !== null && item.product !== undefined
    );

    return res.status(200).json({
      success: true,
      message: "Quantity updated",
      cart: validCart,
    });
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating cart quantity",
      error: error.message,
    });
  }
};

// @desc    Remove product from user's cart
// @route   DELETE /cart/:productId
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const user = await customerModel.findById(req.user._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.cart) {
      user.cart = [];
    }

    const itemIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not in cart",
      });
    }

    user.cart.splice(itemIndex, 1);
    await user.save();

    await user.populate({
      path: "cart.product",
      select: "name price image stock category description",
    });

    const validCart = (user.cart || []).filter(
      (item) => item.product !== null && item.product !== undefined
    );

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart: validCart,
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while removing from cart",
      error: error.message,
    });
  }
};
