import mongoose from "mongoose";
import customerModel from "../models/customerModel.js";
import Product from "../models/product.model.js";

// @desc    Add product to user's wishlist
// @route   POST /wishlist/:productId
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Check if the product exists in MongoDB
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Fetch latest user document to ensure wishlist is loaded
    const user = await customerModel.findById(req.user._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.wishlist) {
      user.wishlist = [];
    }

    // Prevent duplicates
    const alreadyWishlisted = user.wishlist.some(
      (id) => id.toString() === productId
    );

    if (alreadyWishlisted) {
      return res.status(409).json({
        success: false,
        message: "Product already in wishlist",
      });
    }

    // Add product ObjectId to wishlist
    user.wishlist.push(productId);
    await user.save();

    return res.status(201).json({
      success: true,
      message: "Product added to wishlist",
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while adding to wishlist",
      error: error.message,
    });
  }
};

// @desc    Get current user's populated wishlist
// @route   GET /wishlist
export const getWishlist = async (req, res) => {
  try {
    const user = await customerModel.findById(req.user._id).populate({
      path: "wishlist",
      select: "name price category image stock description",
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Filter out any null entries (if referenced products were deleted)
    const validWishlist = (user.wishlist || []).filter(
      (item) => item !== null && item !== undefined
    );

    return res.status(200).json({
      success: true,
      count: validWishlist.length,
      wishlist: validWishlist,
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching wishlist",
      error: error.message,
    });
  }
};

// @desc    Remove product from user's wishlist
// @route   DELETE /wishlist/:productId
export const removeFromWishlist = async (req, res) => {
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

    if (!user.wishlist) {
      user.wishlist = [];
    }

    const itemIndex = user.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not in wishlist",
      });
    }

    // Remove from array and save
    user.wishlist.splice(itemIndex, 1);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while removing from wishlist",
      error: error.message,
    });
  }
};

// @desc    Toggle product in wishlist (Bonus Challenge)
// @route   PATCH /wishlist/:productId/toggle
export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Check if the product exists in MongoDB
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const user = await customerModel.findById(req.user._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.wishlist) {
      user.wishlist = [];
    }

    const itemIndex = user.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    if (itemIndex > -1) {
      // Product is currently in wishlist -> Remove it
      user.wishlist.splice(itemIndex, 1);
      await user.save();
      return res.status(200).json({
        success: true,
        saved: false,
        message: "Product removed from wishlist",
      });
    } else {
      // Product is not in wishlist -> Add it
      user.wishlist.push(productId);
      await user.save();
      return res.status(200).json({
        success: true,
        saved: true,
        message: "Product added to wishlist",
      });
    }
  } catch (error) {
    console.error("Error toggling wishlist:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while toggling wishlist",
      error: error.message,
    });
  }
};
