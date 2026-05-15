"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTransactionService = exports.updateTransactionService = exports.getTransactionSummaryService = exports.getTransactionsService = exports.createTransactionService = void 0;
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
    if (filters.category) {
        where.category = filters.category;
    }
    if (filters.from_date || filters.to_date) {
        where.work_date = {};
        if (filters.from_date) {
            where.work_date[sequelize_1.Op.gte] = filters.from_date;
        }
        if (filters.to_date) {
            where.work_date[sequelize_1.Op.lte] = filters.to_date;
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
const normalizeWorkEntryData = (data) => {
    const farmerName = data.farmer_name || data.title || "";
    const workType = data.work_type || "";
    const workDate = data.work_date || data.transaction_date || new Date().toISOString().slice(0, 10);
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
        category: "Daily Work",
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
const createTransactionService = async (userId, data) => {
    const { user_id, ...transactionData } = data;
    return transaction_model_1.default.create({ ...normalizeWorkEntryData(transactionData), user_id: userId });
};
exports.createTransactionService = createTransactionService;
const getTransactionsService = async (filters) => {
    return transaction_model_1.default.findAll({
        where: buildWhere(filters),
        order: [["work_date", "DESC"], ["createdAt", "DESC"]]
    });
};
exports.getTransactionsService = getTransactionsService;
const getTransactionSummaryService = async (userId) => {
    const activeTransactionWhere = {
        deleted_at: null,
        user_id: userId
    };
    const [totalSalary, totalAdvance, totalPaid, totalRemaining] = await Promise.all([
        transaction_model_1.default.sum("daily_salary_rate", { where: activeTransactionWhere }),
        transaction_model_1.default.sum("advance_amount", { where: activeTransactionWhere }),
        transaction_model_1.default.sum("paid_amount", { where: activeTransactionWhere }),
        transaction_model_1.default.sum("remaining_amount", { where: activeTransactionWhere })
    ]);
    const salary = Number(totalSalary || 0);
    const advance = Number(totalAdvance || 0);
    const paid = Number(totalPaid || 0);
    const remaining = Number(totalRemaining || 0);
    return {
        total_income: salary,
        total_expense: paid,
        balance: remaining,
        total_advance: advance,
        total_salary: salary,
        total_paid: paid,
        total_remaining: remaining
    };
};
exports.getTransactionSummaryService = getTransactionSummaryService;
const updateTransactionService = async (userId, id, data) => {
    const { user_id, ...transactionData } = data;
    const [updatedCount] = await transaction_model_1.default.update(normalizeWorkEntryData(transactionData), { where: { deleted_at: null, id, user_id: userId } });
    if (!updatedCount) {
        return null;
    }
    return transaction_model_1.default.findOne({ where: { deleted_at: null, id, user_id: userId } });
};
exports.updateTransactionService = updateTransactionService;
const deleteTransactionService = async (userId, id) => {
    const [deletedCount] = await transaction_model_1.default.update({ deleted_at: new Date() }, { where: { deleted_at: null, id, user_id: userId } });
    return deletedCount;
};
exports.deleteTransactionService = deleteTransactionService;
