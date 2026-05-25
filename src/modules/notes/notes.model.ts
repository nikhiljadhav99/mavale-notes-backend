import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db";

const Notes = sequelize.define("Note", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 180]
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: ""
  },
  reminder_time: {
    type: DataTypes.DATE
  },
  pinned: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  favorite: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  archived: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  deleted_at: {
    type: DataTypes.DATE
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

export default Notes;
