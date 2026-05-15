import { sequelize } from "../../config/db";
import User from "../user/user.model";
const bcrypt = require("bcryptjs");

export const registerUser = async (data: any) => {
  const transaction = await sequelize.transaction();

  try {
    if (!data || typeof data !== "object") {
      throw new Error("Invalid registration data");
    }

    const { name, email, password, phone, location } = data;

    if (!name || !email || !password || !phone || !location) {
      throw new Error("Name, email, password, phone and location are required");
    }

    const existingUser = await User.findOne({
      where: { email },
      transaction,
    });

    if (existingUser) {
      throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create(
      {
        name,
        email,
        password: hashedPassword,
        phone,
        location,
      },
      { transaction }
    );

    await transaction.commit();

    return user;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({
    where: { email },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const userPassword = user.get("password") as string;

  const isMatch = await bcrypt.compare(password, userPassword);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  return user;
};