import { Op, WhereOptions } from "sequelize";
import Notes from "./notes.model";

export const createNoteService = async (data: any) => {
  return await Notes.create(data);
};

type GetNotesOptions = {
  activeCategory?: string;
  activeView?: string;
  limit: number;
  page: number;
  searchTerm?: string;
};

const buildNotesWhere = ({ activeCategory, activeView, searchTerm }: GetNotesOptions): WhereOptions => {
  const where: any = {};

  if (activeView === "trash") {
    where.deleted_at = { [Op.not]: null };
  } else {
    where.deleted_at = null;
  }

  if (activeView === "favorite") {
    where.favorite = true;
  }

  if (activeView === "archive") {
    where.archived = true;
  } else if (activeView !== "trash") {
    where.archived = false;
  }

  if (activeView === "tags") {
    where.tags = { [Op.ne]: [] };
  }

  if (activeCategory) {
    where.category = activeCategory;
  }

  if (searchTerm) {
    where[Op.or as any] = [
      { title: { [Op.iLike]: `%${searchTerm}%` } },
      { content: { [Op.iLike]: `%${searchTerm}%` } },
      { category: { [Op.iLike]: `%${searchTerm}%` } }
    ];
  }

  return where;
};

export const getNotesService = async (options: GetNotesOptions) => {
  const offset = (options.page - 1) * options.limit;
  const where = buildNotesWhere(options);
  const result = await Notes.findAndCountAll({
    where,
    limit: options.limit,
    offset,
    order: [["pinned", "DESC"], ["favorite", "DESC"], ["createdAt", "DESC"]]
  });

  const now = new Date();
  const activeNotesWhere = {
    archived: false,
    deleted_at: null
  };
  const [totalNotes, pendingReminders, pinnedNotes] = await Promise.all([
    Notes.count({ where: activeNotesWhere }),
    Notes.count({
      where: {
        ...activeNotesWhere,
        reminder_time: { [Op.gte]: now }
      }
    }),
    Notes.count({ where: { ...activeNotesWhere, pinned: true } })
  ]);

  return {
    data: result.rows,
    pagination: {
      page: options.page,
      limit: options.limit,
      total: result.count,
      totalPages: Math.max(1, Math.ceil(result.count / options.limit))
    },
    stats: {
      totalNotes,
      pendingReminders,
      pinnedNotes
    }
  };
};

export const updateNoteService = async (id: string, data: any) => {
  await Notes.update(data, { where: { id } });
  return Notes.findByPk(id);
};

export const deleteNoteService = async (id: string) => {
  await Notes.update({ deleted_at: new Date() }, { where: { id } });
  return Notes.findByPk(id);
};

export const restoreNoteService = async (id: string) => {
  await Notes.update({ deleted_at: null }, { where: { id } });
  return Notes.findByPk(id);
};

export const permanentlyDeleteNoteService = async (id: string) => {
  await Notes.update({ deleted_at: new Date() }, { where: { id } });
  return Notes.findByPk(id);
};
