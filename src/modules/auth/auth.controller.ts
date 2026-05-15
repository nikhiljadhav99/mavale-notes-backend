import { FastifyRequest, FastifyReply } from "fastify";
import * as authService from "./auth.service";

export const register = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = await authService.registerUser(req.body);
    return reply.send(user);
  } catch (error: any) {
    return reply.status(400).send({ message: error?.message || "Registration failed" });
  }
};

export const login = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { email, password } = req.body as any;

    const user = await authService.loginUser(email, password);

    const token = req.server.jwt.sign({
      id: user.get("id"),
      email: user.get("email")
    });

    return reply.send({ token, user });
  } catch (error: any) {
    return reply.status(400).send({ message: error?.message || "Login failed" });
  }
};