import customerModel from "../models/customerModel.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";

const cookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000
};

export const registerCustomer = async (req, res) => {
    try {
        const { name, email, password, phoneNo } = req.body;

        if (!name || !email || !password || !phoneNo) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const emaiExists = await customerModel.findOne({ email });

        if (emaiExists) {
            return res.status(409).json({
                message: "Email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newCustomer = await customerModel.create({
            name,
            email,
            password: hashedPassword,
            phoneNo
        });

        const token = generateToken(newCustomer._id);

        res.cookie("token", token, cookieOptions);

        return res.status(201).json({
            message: "Registration successful",
            Customer: {
                _id: newCustomer._id,
                name: newCustomer.name,
                email: newCustomer.email,
                phoneNo: newCustomer.phoneNo
            }
        });

    } catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        });
    }
};

export const loginCustomer = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const customerExisits = await customerModel.findOne({ email });

        if (!customerExisits) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            customerExisits.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        const token = generateToken(customerExisits._id);

        res.cookie("token", token, cookieOptions);

        return res.status(200).json({
            message: "Login successful",
            Customer: {
                _id: customerExisits._id,
                name: customerExisits.name,
                email: customerExisits.email,
                phoneNo: customerExisits.phoneNo
            }
        });

    } catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        });
    }
};

export const getMe = (req, res) => {
    return res.status(200).json(req.user);
};

export const logoutCustomer = (req, res) => {
    res.clearCookie("token");

    return res.status(200).json({
        message: "Logged out successfully"
    });
};