import mongoose from "mongoose";
import Product from "../models/product.model.js";

// @desc    Create a new product
// @route   POST /products
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    // Check for missing required fields
    if (
      name === undefined ||
      name === null ||
      String(name).trim() === "" ||
      description === undefined ||
      description === null ||
      String(description).trim() === "" ||
      category === undefined ||
      category === null ||
      String(category).trim() === "" ||
      image === undefined ||
      image === null ||
      String(image).trim() === "" ||
      price === undefined ||
      price === null ||
      price === "" ||
      stock === undefined ||
      stock === null ||
      stock === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: name, description, price, category, image, and stock are mandatory",
      });
    }

    const numPrice = Number(price);
    const numStock = Number(stock);

    // Validate price
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid price: Price must be a number greater than 0",
      });
    }

    // Validate stock
    if (isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
      return res.status(400).json({
        success: false,
        message: "Invalid stock: Stock must be a non-negative integer",
      });
    }

    const newProduct = await Product.create({
      name: String(name).trim(),
      description: String(description).trim(),
      price: numPrice,
      category: String(category).trim(),
      image: String(image).trim(),
      stock: numStock,
    });

    return res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error while creating product",
      error: error.message,
    });
  }
};

// @desc    Get all products with search, category filtering & sorting
// @route   GET /products
export const getProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    const filter = {};

    // Search by product name (case-insensitive)
    if (search && search.trim() !== "") {
      filter.name = { $regex: search.trim(), $options: "i" };
    }

    // Filter by category (case-insensitive exact match)
    if (category && category.trim() !== "" && category !== "All Categories" && category !== "All") {
      filter.category = { $regex: `^${category.trim()}$`, $options: "i" };
    }

    // Bonus Challenge: sorting by price
    let sortOptions = { createdAt: -1 };
    if (sort === "price_asc") {
      sortOptions = { price: 1 };
    } else if (sort === "price_desc") {
      sortOptions = { price: -1 };
    }

    const products = await Product.find(filter).sort(sortOptions);

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching products",
      error: error.message,
    });
  }
};

// @desc    Get single product by ID
// @route   GET /products/:id
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching product",
      error: error.message,
    });
  }
};
