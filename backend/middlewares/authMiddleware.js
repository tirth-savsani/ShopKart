import jwt from "jsonwebtoken";
import customerModel from "../models/customerModel.js";

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "Login required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const customerExists = await customerModel
            .findById(decoded.userId)
            .select("-password");

        if (!customerExists) {
            return res.status(401).json({ message: "Customer not found" });
        }

        req.user = customerExists;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

export default isAuthenticated;
