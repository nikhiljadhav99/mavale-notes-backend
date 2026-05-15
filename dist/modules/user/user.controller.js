"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateProfile = exports.getProfile = void 0;
const user_model_1 = __importDefault(require("./user.model"));
const bcrypt = require("bcryptjs");
const getProfile = async (req, reply) => {
    const user = await user_model_1.default.findByPk(req.user.id);
    if (!user) {
        return reply.status(404).send({ message: "User not found" });
    }
    return reply.send(user);
};
exports.getProfile = getProfile;
const updateProfile = async (req, reply) => {
    const user = await user_model_1.default.findByPk(req.user.id);
    if (!user) {
        return reply.status(404).send({ message: "User not found" });
    }
    const { name, email, phone, location } = req.body;
    if (!name || !email || !phone || !location) {
        return reply.status(400).send({ message: "All profile fields are required" });
    }
    const emailOwner = await user_model_1.default.findOne({
        where: { email }
    });
    if (emailOwner && emailOwner.get("id") !== user.get("id")) {
        return reply.status(400).send({ message: "Email already in use" });
    }
    await user.update({ name, email, phone, location });
    return reply.send(user);
};
exports.updateProfile = updateProfile;
const changePassword = async (req, reply) => {
    const user = await user_model_1.default.findByPk(req.user.id);
    if (!user) {
        return reply.status(404).send({ message: "User not found" });
    }
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return reply.status(400).send({ message: "Current password and new password are required" });
    }
    if (newPassword.length < 6) {
        return reply.status(400).send({ message: "New password must be at least 6 characters" });
    }
    const currentHash = user.get("password");
    const passwordMatches = await bcrypt.compare(currentPassword, currentHash);
    if (!passwordMatches) {
        return reply.status(400).send({ message: "Current password is incorrect" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });
    return reply.send({ message: "Password updated successfully" });
};
exports.changePassword = changePassword;
