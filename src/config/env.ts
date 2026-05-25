import * as dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: process.env.PORT || "5000",

  DB_HOST: process.env.DB_HOST || "",
  DB_PORT: process.env.DB_PORT || "5432",
  DB_NAME: process.env.DB_NAME || "",
  DB_USER: process.env.DB_USER || "",
  DB_PASS: process.env.DB_PASS || "",

  JWT_SECRET: process.env.JWT_SECRET || "smart_notes_secret",

  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  OPENAI_MODEL: process.env.OPENAI_MODEL || "gpt-4.1-mini",

  MAIL_USER: process.env.MAIL_USER || "",
  MAIL_PASS: process.env.MAIL_PASS || "",
  REMINDER_EMAIL: process.env.REMINDER_EMAIL || process.env.MAIL_USER || ""
};