import { FastifyReply, FastifyRequest } from "fastify";
import * as aiService from "./ai.service";

export const voiceChat = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const userId = (req.user as any).id as string;
    const result = await aiService.createVoiceChatResponse(userId, req.body as any);
    return reply.send(result);
  } catch (error: any) {
    return reply.status(400).send({
      message: error?.message || "AI voice chat failed",
    });
  }
};
