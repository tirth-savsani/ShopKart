import express from "express";
import { registerCustomer,loginCustomer,logoutCustomer,getMe } from "../controllers/customerController.js";
import isAuthenticated from "../middlewares/authMiddleware.js";

const customerRoutes=express.Router();

customerRoutes.post("/register",registerCustomer);
customerRoutes.post("/login",loginCustomer);
customerRoutes.post("/logout",logoutCustomer);
customerRoutes.get("/me",isAuthenticated,getMe);

export default customerRoutes;