"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const buckets = new Map();
const windowMs = 60 * 1000;
const maxRequests = 120;
exports.default = (0, fastify_plugin_1.default)(async (fastify) => {
    const cleanupTimer = setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of buckets.entries()) {
            if (entry.resetAt <= now) {
                buckets.delete(key);
            }
        }
    }, windowMs);
    cleanupTimer.unref();
    fastify.addHook("onRequest", async (request, reply) => {
        if (request.method === "OPTIONS")
            return;
        const key = `${request.ip}:${request.routeOptions.url || request.url}`;
        const now = Date.now();
        const current = buckets.get(key);
        if (!current || current.resetAt <= now) {
            buckets.set(key, { count: 1, resetAt: now + windowMs });
            return;
        }
        current.count += 1;
        if (current.count > maxRequests) {
            const retryAfter = Math.ceil((current.resetAt - now) / 1000);
            reply.header("Retry-After", retryAfter);
            return reply.status(429).send({
                message: "Too many requests. Please try again later."
            });
        }
    });
});
