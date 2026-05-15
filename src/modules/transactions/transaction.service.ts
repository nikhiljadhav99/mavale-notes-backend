import { Op, WhereOptions } from "sequelize";
import Transaction from "./transaction.model";

type TransactionFilters = {
  category?: string;
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

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.from_date || filters.to_date) {
    where.work_date = {};
    if (filters.from_date) {
      where.work_date[Op.gte] = filters.from_date;
    }
    if (filters.to_date) {
      where.work_date[Op.lte] = filters.to_date;
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

const normalizeWorkEntryData = (data: any) => {
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

export const createTransactionService = async (userId: string, data: any) => {
  const { user_id, ...transactionData } = data;
  return Transaction.create({ ...normalizeWorkEntryData(transactionData), user_id: userId });
};

export const getTransactionsService = async (filters: TransactionFilters) => {
  return Transaction.findAll({
    where: buildWhere(filters),
    order: [["work_date", "DESC"], ["createdAt", "DESC"]]
  });
};

export const getTransactionSummaryService = async (userId: string) => {
  const activeTransactionWhere = {
    deleted_at: null,
    user_id: userId
  };
  const [totalSalary, totalAdvance, totalPaid, totalRemaining] = await Promise.all([
    Transaction.sum("daily_salary_rate", { where: activeTransactionWhere }),
    Transaction.sum("advance_amount", { where: activeTransactionWhere }),
    Transaction.sum("paid_amount", { where: activeTransactionWhere }),
    Transaction.sum("remaining_amount", { where: activeTransactionWhere })
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

export const updateTransactionService = async (userId: string, id: string, data: any) => {
  const { user_id, ...transactionData } = data;
  const [updatedCount] = await Transaction.update(
    normalizeWorkEntryData(transactionData),
    { where: { deleted_at: null, id, user_id: userId } }
  );

  if (!updatedCount) {
    return null;
  }

  return Transaction.findOne({ where: { deleted_at: null, id, user_id: userId } });
};

export const deleteTransactionService = async (userId: string, id: string) => {
  const [deletedCount] = await Transaction.update(
    { deleted_at: new Date() },
    { where: { deleted_at: null, id, user_id: userId } }
  );

  return deletedCount;
};
