"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = userRoutes;
const user_controller_1 = require("./user.controller");
async function userRoutes(fastify) {
    fastify.get("/profile", { preHandler: [fastify.authenticate] }, user_controller_1.getProfile);
    fastify.put("/profile", { preHandler: [fastify.authenticate] }, user_controller_1.updateProfile);
    fastify.put("/profile/password", { preHandler: [fastify.authenticate] }, user_controller_1.changePassword);
}
