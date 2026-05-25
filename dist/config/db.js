"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const DATABASE_URL = process.env.DATABASE_URL || "";
exports.sequelize = new sequelize_1.Sequelize(DATABASE_URL, {
    dialect: "postgres",
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});
