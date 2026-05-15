import { FastifyInstance } from "fastify";
import * as controller from "./transaction.controller";

export default async function transactionRoutes(fastify: FastifyInstance) {
  fastify.post("/transactions", { preHandler: [fastify.authenticate] }, controller.createTransaction);
  fastify.get("/transactions", { preHandler: [fastify.authenticate] }, controller.getTransactions);
  fastify.get("/transactions/summary", { preHandler: [fastify.authenticate] }, controller.getTransactionSummary);
  fastify.put("/transactions/:id", { preHandler: [fastify.authenticate] }, controller.updateTransaction);
  fastify.delete("/transactions/:id", { preHandler: [fastify.authenticate] }, controller.deleteTransaction);
}
