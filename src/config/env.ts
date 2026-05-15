import * as dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT || "5000",

  DB_NAME: process.env.DB_NAME || "smart_notes",
  DB_USER: process.env.DB_USER || "postgres",
  DB_PASS: process.env.DB_PASS || "1234",
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: Number(process.env.DB_PORT) || 5432,

  JWT_SECRET: process.env.JWT_SECRET || "smart_notes_secret",

  MAIL_USER: process.env.MAIL_USER || "",
  MAIL_PASS: process.env.MAIL_PASS || "",
  REMINDER_EMAIL: process.env.REMINDER_EMAIL || process.env.MAIL_USER || ""
};