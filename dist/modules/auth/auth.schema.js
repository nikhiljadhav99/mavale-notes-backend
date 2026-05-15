"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchema = exports.loginSchema = void 0;
exports.loginSchema = {
    body: {
        type: "object",
        required: ["email", "password"],
        properties: {
            email: { type: "string" },
            password: { type: "string" }
        }
    }
};
exports.registerSchema = {
    body: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
            name: { type: "string" },
            email: { type: "string" },
            password: { type: "string" },
            phone: { type: "string" },
            location: { type: "string" }
        }
    }
};
