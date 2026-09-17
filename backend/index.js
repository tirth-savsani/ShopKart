import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import customerRoutes from "./routes/customerRoutes.js";

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

const port=process.env.port||3000;
app.listen(port, () => {
    console.log(`Server Started at ${port}`);
});