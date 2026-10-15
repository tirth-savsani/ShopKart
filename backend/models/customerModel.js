import mongoose from "mongoose";

const customerSchema=new mongoose.Schema({
    name:{
        type:"String",
        required:true,
        trim:true
    },

    email:{
        type:"String",
        required:true,
        unique:true
    },

    password:{
        type:"String",
        required:true
    },

    phoneNo:{
        type:"String",
        required:true
    },

    wishlist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        }
    ],

    cart: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            quantity: {
                type: Number,
                default: 1,
                min: [1, "Quantity cannot be less than 1"]
            }
        }
    ],

    createdAt:{
        type:Date,
        default:Date.now
    }
});

const customerModel = mongoose.model("customer",customerSchema);

export default customerModel;