import jwt from "jsonwebtoken";
import customerModel from "../models/customerModel.js";

const isAuthenticated = async (req, res, next) =>{
    try{
        const token=req.cookie.token;

    if(!token){
        return res.status(401).json({ message: "Login required" });
    }

    const decoded= jwt.verify(token,process.env.JWT_SECRET);

    const customerExsits = await customerModel.findByID(decodec.userId);

    if(!customerExsits){
         return res.status(401).json({ message: "Customer not found" });
    }

    req.customer = customerExsits;
    next();
    }catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

export default isAuthenticated;
    