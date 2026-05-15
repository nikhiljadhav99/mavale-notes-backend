import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import { env } from "../config/env";

export default fp(async (fastify) => {
  fastify.register(fastifyJwt, {
    secret: env.JWT_SECRET
  });

  fastify.decorate("authenticate", async (req: any, reply: any) => {
    try {
      await req.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
});