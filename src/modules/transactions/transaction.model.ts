import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db";

const Transaction = sequelize.define("Transaction", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 180]
    }
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [["income", "expense"]]
    }
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: ""
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: ""
  },
  transaction_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  farmer_name: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: ""
  },
  work_date: {
    type: DataTypes.DATEONLY
  },
  work_type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: ""
  },
  daily_salary_rate: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  advance_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  paid_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  remaining_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: ""
  },
  deleted_at: {
    type: DataTypes.DATE
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ["user_id"] },
    { fields: ["type"] },
    { fields: ["transaction_date"] },
    { fields: ["farmer_name"] },
    { fields: ["work_date"] },
    { fields: ["deleted_at"] },
    { fields: ["createdAt"] }
  ]
});

export default Transaction;
