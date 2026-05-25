"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const db_1 = require("../../config/db");
const user_model_1 = __importDefault(require("../user/user.model"));
const sequelize_1 = require("sequelize");
const bcrypt = require("bcryptjs");
const registerUser = async (data) => {
    const transaction = await db_1.sequelize.transaction();
    try {
        if (!data || typeof data !== "object") {
            throw new Error("Invalid registration data");
        }
        const { name, email, password, phone, location } = data;
        if (!name || !email || !password || !phone || !location) {
            throw new Error("Name, email, password, phone and location are required");
        }
        const existingUser = await user_model_1.default.findOne({
            where: { email },
            transaction,
        });
        if (existingUser) {
            throw new Error("Email already exists");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await user_model_1.default.create({
            name,
            email,
            password: hashedPassword,
            phone,
            location,
        }, { transaction });
        await transaction.commit();
        return user;
    }
    catch (error) {
        await transaction.rollback();
        throw error;
    }
};
exports.registerUser = registerUser;
const loginUser = async (emailOrPhone, password) => {
    if (!emailOrPhone || !password) {
        throw new Error("Email/Phone and password are required");
    }
    const user = await user_model_1.default.findOne({
        where: {
            [sequelize_1.Op.or]: [
                { email: emailOrPhone },
                { phone: emailOrPhone }
            ]
        },
    });
    if (!user) {
        throw new Error("User not found");
    }
    const userPassword = user.get("password");
    const isMatch = await bcrypt.compare(password, userPassword);
    if (!isMatch) {
        throw new Error("Invalid credentials");
    }
    return user;
};
exports.loginUser = loginUser;
