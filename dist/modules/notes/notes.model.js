"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = require("../../config/db");
const Notes = db_1.sequelize.define("Note", {
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 180]
        }
    },
    content: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        defaultValue: ""
    },
    reminder_time: {
        type: sequelize_1.DataTypes.DATE
    },
    pinned: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    favorite: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    archived: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    deleted_at: {
        type: sequelize_1.DataTypes.DATE
    }
}, {
    timestamps: true,
    indexes: [
        { fields: ["createdAt"] },
        { fields: ["pinned"] },
        { fields: ["favorite"] },
        { fields: ["archived"] },
        { fields: ["deleted_at"] }
    ]
});
exports.default = Notes;
