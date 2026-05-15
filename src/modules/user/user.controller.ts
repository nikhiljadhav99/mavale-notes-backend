import { FastifyRequest, FastifyReply } from "fastify";
import User from "./user.model";
const bcrypt = require("bcryptjs");

export const getProfile = async (req: FastifyRequest, reply: FastifyReply) => {
  const user = await User.findByPk((req.user as any).id);
  if (!user) {
    return reply.status(404).send({ message: "User not found" });
  }

  return reply.send(user);
};

export const updateProfile = async (req: FastifyRequest, reply: FastifyReply) => {
  const user = await User.findByPk((req.user as any).id);
  if (!user) {
    return reply.status(404).send({ message: "User not found" });
  }

  const { name, email, phone, location } = req.body as any;

  if (!name || !email || !phone || !location) {
    return reply.status(400).send({ message: "All profile fields are required" });
  }

  const emailOwner = await User.findOne({
    where: { email }
  });

  if (emailOwner && emailOwner.get("id") !== user.get("id")) {
    return reply.status(400).send({ message: "Email already in use" });
  }

  await user.update({ name, email, phone, location });
  return reply.send(user);
};

export const changePassword = async (req: FastifyRequest, reply: FastifyReply) => {
  const user = await User.findByPk((req.user as any).id);
  if (!user) {
    return reply.status(404).send({ message: "User not found" });
  }

  const { currentPassword, newPassword } = req.body as any;

  if (!currentPassword || !newPassword) {
    return reply.status(400).send({ message: "Current password and new password are required" });
  }

  if (newPassword.length < 6) {
    return reply.status(400).send({ message: "New password must be at least 6 characters" });
  }

  const currentHash = user.get("password") as string;
  const passwordMatches = await bcrypt.compare(currentPassword, currentHash);

  if (!passwordMatches) {
    return reply.status(400).send({ message: "Current password is incorrect" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await user.update({ password: hashedPassword });

  return reply.send({ message: "Password updated successfully" });
};
