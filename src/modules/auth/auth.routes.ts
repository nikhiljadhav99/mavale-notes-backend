import { FastifyInstance } from "fastify";
import * as controller from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.schema";

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post("/auth/register", { schema: registerSchema }, controller.register);
  fastify.post("/auth/login", { schema: loginSchema }, controller.login);
}