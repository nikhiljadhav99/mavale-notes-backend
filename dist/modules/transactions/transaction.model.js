"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = require("../../config/db");
const Transaction = db_1.sequelize.define("Transaction", {
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4
    },
    user_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 180]
        }
    },
    amount: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    type: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [["income", "expense"]]
        }
    },
    category: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        defaultValue: ""
    },
    transaction_date: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false
    },
    farmer_name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: ""
    },
    work_date: {
        type: sequelize_1.DataTypes.DATEONLY
    },
    work_type: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: ""
    },
    daily_salary_rate: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    advance_amount: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    paid_amount: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    remaining_amount: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
    },
    note: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        defaultValue: ""
    },
    deleted_at: {
        type: sequelize_1.DataTypes.DATE
    }
}, {
    timestamps: true,
    indexes: [
        { fields: ["user_id"] },
        { fields: ["type"] },
        { fields: ["category"] },
        { fields: ["transaction_date"] },
        { fields: ["farmer_name"] },
        { fields: ["work_date"] },
        { fields: ["deleted_at"] },
        { fields: ["createdAt"] }
    ]
});
exports.default = Transaction;
