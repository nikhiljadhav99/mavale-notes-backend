"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTransaction = exports.updateTransaction = exports.getTransactionSummary = exports.getTransactions = exports.createTransaction = void 0;
const transactionService = __importStar(require("./transaction.service"));
const getUserId = (req) => req.user.id;
const createTransaction = async (req, reply) => {
    const transaction = await transactionService.createTransactionService(getUserId(req), req.body);
    return reply.send(transaction);
};
exports.createTransaction = createTransaction;
const getTransactions = async (req, reply) => {
    const query = req.query;
    const transactions = await transactionService.getTransactionsService({
        from_date: query.from_date || "",
        search: query.search || "",
        to_date: query.to_date || "",
        type: query.type || "",
        userId: getUserId(req)
    });
    return reply.send(transactions);
};
exports.getTransactions = getTransactions;
const getTransactionSummary = async (req, reply) => {
    const summary = await transactionService.getTransactionSummaryService(getUserId(req));
    return reply.send(summary);
};
exports.getTransactionSummary = getTransactionSummary;
const updateTransaction = async (req, reply) => {
    const { id } = req.params;
    const transaction = await transactionService.updateTransactionService(getUserId(req), id, req.body);
    if (!transaction) {
        return reply.code(404).send({ message: "Transaction not found" });
    }
    return reply.send(transaction);
};
exports.updateTransaction = updateTransaction;
const deleteTransaction = async (req, reply) => {
    const { id } = req.params;
    const deletedCount = await transactionService.deleteTransactionService(getUserId(req), id);
    if (!deletedCount) {
        return reply.code(404).send({ message: "Transaction not found" });
    }
    return reply.send({ message: "Transaction deleted" });
};
exports.deleteTransaction = deleteTransaction;
