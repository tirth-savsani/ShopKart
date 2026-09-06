import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import customerRoutes from "./routes/customerRoutes.js";

dotenv.config();

const app=express();
app.use(express.json());
app.use(cookieParser());

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