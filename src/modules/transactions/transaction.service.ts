import { Op, WhereOptions } from "sequelize";
import Transaction from "./transaction.model";

type TransactionFilters = {
  from_date?: string;
  search?: string;
  to_date?: string;
  type?: string;
  userId: string;
};

const buildWhere = (filters: TransactionFilters): WhereOptions => {
  const where: any = {
    deleted_at: null,
    user_id: filters.userId
  };

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.from_date || filters.to_date) {
    where.transaction_date = {};
    if (filters.from_date) {
      where.transaction_date[Op.gte] = filters.from_date;
    }
    if (filters.to_date) {
      where.transaction_date[Op.lte] = filters.to_date;
    }
  }

  if (filters.search) {
    where[Op.or as any] = [
      { title: { [Op.iLike]: `%${filters.search}%` } },
      { farmer_name: { [Op.iLike]: `%${filters.search}%` } },
      { work_type: { [Op.iLike]: `%${filters.search}%` } },
      { note: { [Op.iLike]: `%${filters.search}%` } },
      { description: { [Op.iLike]: `%${filters.search}%` } }
    ];
  }

  return where;
};

const toAmount = (value: any) => Number(value || 0);

const today = () => new Date().toISOString().slice(0, 10);

const hasWorkEntryFields = (data: any) => {
  return [
    "farmer_name",
    "work_date",
    "work_type",
    "daily_salary_rate",
    "advance_amount"
  ].some((field) => data[field] !== undefined && data[field] !== "");
};

const normalizeWorkEntryData = (data: any) => {
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

export const normalizeTransactionData = (data: any) => {
  if (hasWorkEntryFields(data)) {
    return normalizeWorkEntryData(data);
  }

  const amount = toAmount(data.amount ?? data.daily_salary_rate);
  const type = data.type === "income" ? "income" : "expense";
  const date = data.transaction_date || data.work_date || today();
  const title = data.title || data.farmer_name || "Transaction";
  const note = data.note || data.description || "";
  const paidAmount =
    data.paid_amount === undefined ? (type === "income" ? amount : 0) : toAmount(data.paid_amount);
  const remainingAmount =
    data.remaining_amount === undefined ? 0 : toAmount(data.remaining_amount);

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

const publicTransactionAttributes = {
  exclude: ["category"]
};

const removePrivateTransactionFields = (transaction: any) => {
  const json = transaction?.toJSON ? transaction.toJSON() : transaction;
  if (json && typeof json === "object") {
    delete json.category;
  }
  return json;
};

export const createTransactionService = async (userId: string, data: any) => {
  const { user_id, ...transactionData } = data;
  const transaction = await Transaction.create({
    ...normalizeTransactionData(transactionData),
    user_id: userId
  });
  return removePrivateTransactionFields(transaction);
};

export const getTransactionsService = async (filters: TransactionFilters) => {
  return Transaction.findAll({
    where: buildWhere(filters),
    attributes: publicTransactionAttributes,
    order: [["transaction_date", "DESC"], ["createdAt", "DESC"]]
  });
};

export const getTransactionSummaryService = async (userId: string) => {
  const activeTransactionWhere = {
    deleted_at: null,
    user_id: userId
  };
  const [totalExpense, totalReceived, totalPending] = await Promise.all([
    Transaction.sum("amount", {
      where: { ...activeTransactionWhere, type: "expense" }
    }),
    Transaction.sum("amount", {
      where: { ...activeTransactionWhere, type: "income" }
    }),
    Transaction.sum("remaining_amount", {
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

export const updateTransactionService = async (userId: string, id: string, data: any) => {
  const { user_id, ...transactionData } = data;
  const [updatedCount] = await Transaction.update(
    normalizeTransactionData(transactionData),
    { where: { deleted_at: null, id, user_id: userId } }
  );

  if (!updatedCount) {
    return null;
  }

  return Transaction.findOne({
    where: { deleted_at: null, id, user_id: userId },
    attributes: publicTransactionAttributes
  });
};

export const deleteTransactionService = async (userId: string, id: string) => {
  const [deletedCount] = await Transaction.update(
    { deleted_at: new Date() },
    { where: { deleted_at: null, id, user_id: userId } }
  );

  return deletedCount;
};
