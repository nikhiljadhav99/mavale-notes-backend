"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
require("./jobs/reminder.job");
const start = async () => {
    try {
        await db_1.sequelize.authenticate();
        console.log("✅ DB connected");
        // ⚠️ Avoid alter in production (can break DB)
        await db_1.sequelize.sync();
        const PORT = Number(process.env.PORT) || 5000;
        await app_1.default.listen({
            port: PORT,
            host: "0.0.0.0",
        });
        console.log(`🚀 Server running on port ${PORT}`);
    }
    catch (err) {
        console.error("❌ Server failed to start:", err);
        process.exit(1); // important for Render restart
    }
};
start();
