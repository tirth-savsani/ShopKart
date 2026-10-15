import express from "express";
import isAuthenticated from "../middlewares/authMiddleware.js";
import {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
} from "../controllers/cart.controller.js";

const cartRoutes = express.Router();

// All cart endpoints require authentication
cartRoutes.use(isAuthenticated);

cartRoutes.post("/:productId", addToCart);
cartRoutes.get("/", getCart);
cartRoutes.patch("/:productId", updateCartQuantity);
cartRoutes.delete("/:productId", removeFromCart);

export default cartRoutes;
