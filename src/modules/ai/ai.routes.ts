import { FastifyInstance } from "fastify";
import { voiceChat } from "./ai.controller";

export default async function aiRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/ai/voice-chat",
    { preHandler: [fastify.authenticate] },
    voiceChat
  );
}
