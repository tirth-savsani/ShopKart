import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import customerRoutes from "./routes/customerRoutes.js";
import productRoutes from "./routes/product.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";

dotenv.config();

const app=express();
app.use(express.json());
app.use(cookieParser());
const allowedOrigins = [
    "http://localhost:5173"
];

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));

mongoose.connect(process.env.dbUrl).then(()=>{
    console.log("db connected");
}).catch((err)=>{
    console.log(err);
})

app.use("/customers",customerRoutes);
app.use("/products", productRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);

const port=process.env.port||3000;
app.listen(port, () => {
    console.log(`Server Started at ${port}`);
});

export default app;