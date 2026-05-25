import { FastifyReply, FastifyRequest } from "fastify";
import * as transactionService from "./transaction.service";

const getUserId = (req: FastifyRequest) => (req.user as any).id as string;

export const createTransaction = async (req: FastifyRequest, reply: FastifyReply) => {
  const transaction = await transactionService.createTransactionService(getUserId(req), req.body);
  return reply.send(transaction);
};

export const getTransactions = async (req: FastifyRequest, reply: FastifyReply) => {
  const query = req.query as any;
  const transactions = await transactionService.getTransactionsService({
    from_date: query.from_date || "",
    search: query.search || "",
    to_date: query.to_date || "",
    type: query.type || "",
    userId: getUserId(req)
  });
  return reply.send(transactions);
};

export const getTransactionSummary = async (req: FastifyRequest, reply: FastifyReply) => {
  const summary = await transactionService.getTransactionSummaryService(getUserId(req));
  return reply.send(summary);
};

export const updateTransaction = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as any;
  const transaction = await transactionService.updateTransactionService(getUserId(req), id, req.body);

  if (!transaction) {
    return reply.code(404).send({ message: "Transaction not found" });
  }

  return reply.send(transaction);
};

export const deleteTransaction = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as any;
  const deletedCount = await transactionService.deleteTransactionService(getUserId(req), id);

  if (!deletedCount) {
    return reply.code(404).send({ message: "Transaction not found" });
  }

  return reply.send({ message: "Transaction deleted" });
};
