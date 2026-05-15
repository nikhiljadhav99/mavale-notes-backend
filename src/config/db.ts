import { Sequelize } from "sequelize";
import { env } from "./env";

if (!env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

export const sequelize = new Sequelize(env.DATABASE_URL, {
  dialect: "postgres",
  logging: false
});