import { FastifyInstance } from "fastify";
import { changePassword, getProfile, updateProfile } from "./user.controller";

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.get("/profile", { preHandler: [fastify.authenticate] }, getProfile);
  fastify.put("/profile", { preHandler: [fastify.authenticate] }, updateProfile);
  fastify.put("/profile/password", { preHandler: [fastify.authenticate] }, changePassword);
}
