"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const env_1 = require("./env");
if (!env_1.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
}
exports.sequelize = new sequelize_1.Sequelize(env_1.env.DATABASE_URL, {
    dialect: "postgres",
    logging: false
});
