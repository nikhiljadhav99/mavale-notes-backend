import { Sequelize } from "sequelize";

const DATABASE_URL = process.env.DATABASE_URL || "";

export const sequelize = new Sequelize(DATABASE_URL, {
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});