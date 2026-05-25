"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTransactionService = exports.updateTransactionService = exports.getTransactionSummaryService = exports.getTransactionsService = exports.createTransactionService = exports.normalizeTransactionData = void 0;
const sequelize_1 = require("sequelize");
const transaction_model_1 = __importDefault(require("./transaction.model"));
const buildWhere = (filters) => {
    const where = {
        deleted_at: null,
        user_id: filters.userId
    };
    if (filters.type) {
        where.type = filters.type;
    }
    if (filters.from_date || filters.to_date) {
        where.transaction_date = {};
        if (filters.from_date) {
            where.transaction_date[sequelize_1.Op.gte] = filters.from_date;
        }
        if (filters.to_date) {
            where.transaction_date[sequelize_1.Op.lte] = filters.to_date;
        }
    }
    if (filters.search) {
        where[sequelize_1.Op.or] = [
            { title: { [sequelize_1.Op.iLike]: `%${filters.search}%` } },
            { farmer_name: { [sequelize_1.Op.iLike]: `%${filters.search}%` } },
            { work_type: { [sequelize_1.Op.iLike]: `%${filters.search}%` } },
            { note: { [sequelize_1.Op.iLike]: `%${filters.search}%` } },
            { description: { [sequelize_1.Op.iLike]: `%${filters.search}%` } }
        ];
    }
    return where;
};
const toAmount = (value) => Number(value || 0);
const today = () => new Date().toISOString().slice(0, 10);
const hasWorkEntryFields = (data) => {
    return [
        "farmer_name",
        "work_date",
        "work_type",
        "daily_salary_rate",
        "advance_amount"
    ].some((field) => data[field] !== undefined && data[field] !== "");
};
const normalizeWorkEntryData = (data) => {
    const farmerName = data.farmer_name || data.title || "";
    const workType = data.work_type || "";
    const workDate = data.work_date || data.transaction_date || today();
    const dailySalaryRate = toAmount(data.daily_salary_rate ?? data.amount);
    const advanceAmount = toAmount(data.advance_amount);
    const paidAmount = toAmount(data.paid_amount);
    const remainingAmount = data.remaining_amount === undefined
        ? Math.max(dailySalaryRate - advanceAmount - paidAmount, 0)
        : toAmount(data.remaining_amount);
    const note = data.note || data.description || "";
    return {
        ...data,
        title: farmerName,
        amount: dailySalaryRate,
        type: "expense",
        category: "",
        description: note,
        transaction_date: workDate,
        farmer_name: farmerName,
        work_date: workDate,
        work_type: workType,
        daily_salary_rate: dailySalaryRate,
        advance_amount: advanceAmount,
        paid_amount: paidAmount,
        remaining_amount: remainingAmount,
        note
    };
};
const normalizeTransactionData = (data) => {
    if (hasWorkEntryFields(data)) {
        return normalizeWorkEntryData(data);
    }
    const amount = toAmount(data.amount ?? data.daily_salary_rate);
    const type = data.type === "income" ? "income" : "expense";
    const date = data.transaction_date || data.work_date || today();
    const title = data.title || data.farmer_name || "Transaction";
    const note = data.note || data.description || "";
    const paidAmount = data.paid_amount === undefined ? (type === "income" ? amount : 0) : toAmount(data.paid_amount);
    const remainingAmount = data.remaining_amount === undefined ? 0 : toAmount(data.remaining_amount);
    return {
        ...data,
        title,
        amount,
        type,
        category: "",
        description: note,
        transaction_date: date,
        farmer_name: "",
        work_date: date,
        work_type: data.work_type || "",
        daily_salary_rate: amount,
        advance_amount: 0,
        paid_amount: paidAmount,
        remaining_amount: remainingAmount,
        note
    };
};
exports.normalizeTransactionData = normalizeTransactionData;
const publicTransactionAttributes = {
    exclude: ["category"]
};
const removePrivateTransactionFields = (transaction) => {
    const json = transaction?.toJSON ? transaction.toJSON() : transaction;
    if (json && typeof json === "object") {
        delete json.category;
    }
    return json;
};
const createTransactionService = async (userId, data) => {
    const { user_id, ...transactionData } = data;
    const transaction = await transaction_model_1.default.create({
        ...(0, exports.normalizeTransactionData)(transactionData),
        user_id: userId
    });
    return removePrivateTransactionFields(transaction);
};
exports.createTransactionService = createTransactionService;
const getTransactionsService = async (filters) => {
    return transaction_model_1.default.findAll({
        where: buildWhere(filters),
        attributes: publicTransactionAttributes,
        order: [["transaction_date", "DESC"], ["createdAt", "DESC"]]
    });
};
exports.getTransactionsService = getTransactionsService;
const getTransactionSummaryService = async (userId) => {
    const activeTransactionWhere = {
        deleted_at: null,
        user_id: userId
    };
    const [totalExpense, totalReceived, totalPending] = await Promise.all([
        transaction_model_1.default.sum("amount", {
            where: { ...activeTransactionWhere, type: "expense" }
        }),
        transaction_model_1.default.sum("amount", {
            where: { ...activeTransactionWhere, type: "income" }
        }),
        transaction_model_1.default.sum("remaining_amount", {
            where: activeTransactionWhere
        })
    ]);
    const expense = Number(totalExpense || 0);
    const received = Number(totalReceived || 0);
    const pending = Number(totalPending || 0);
    return {
        total_income: received,
        total_expense: expense,
        balance: received - expense,
        total_received: received,
        total_pending: pending,
        total_paid: received,
        total_remaining: pending
    };
};
exports.getTransactionSummaryService = getTransactionSummaryService;
const updateTransactionService = async (userId, id, data) => {
    const { user_id, ...transactionData } = data;
    const [updatedCount] = await transaction_model_1.default.update((0, exports.normalizeTransactionData)(transactionData), { where: { deleted_at: null, id, user_id: userId } });
    if (!updatedCount) {
        return null;
    }
    return transaction_model_1.default.findOne({
        where: { deleted_at: null, id, user_id: userId },
        attributes: publicTransactionAttributes
    });
};
exports.updateTransactionService = updateTransactionService;
const deleteTransactionService = async (userId, id) => {
    const [deletedCount] = await transaction_model_1.default.update({ deleted_at: new Date() }, { where: { deleted_at: null, id, user_id: userId } });
    return deletedCount;
};
exports.deleteTransactionService = deleteTransactionService;
