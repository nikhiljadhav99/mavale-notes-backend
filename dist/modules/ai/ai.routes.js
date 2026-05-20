"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = aiRoutes;
const ai_controller_1 = require("./ai.controller");
async function aiRoutes(fastify) {
    fastify.post("/ai/voice-chat", { preHandler: [fastify.authenticate] }, ai_controller_1.voiceChat);
}
