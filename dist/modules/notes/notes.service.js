"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.permanentlyDeleteNoteService = exports.restoreNoteService = exports.deleteNoteService = exports.updateNoteService = exports.getNotesService = exports.createNoteService = void 0;
const sequelize_1 = require("sequelize");
const notes_model_1 = __importDefault(require("./notes.model"));
const createNoteService = async (data) => {
    return await notes_model_1.default.create(data);
};
exports.createNoteService = createNoteService;
const buildNotesWhere = ({ activeCategory, activeView, searchTerm }) => {
    const where = {};
    if (activeView === "trash") {
        where.deleted_at = { [sequelize_1.Op.not]: null };
    }
    else {
        where.deleted_at = null;
    }
    if (activeView === "favorite") {
        where.favorite = true;
    }
    if (activeView === "archive") {
        where.archived = true;
    }
    else if (activeView !== "trash") {
        where.archived = false;
    }
    if (activeView === "tags") {
        where.tags = { [sequelize_1.Op.ne]: [] };
    }
    if (activeCategory) {
        where.category = activeCategory;
    }
    if (searchTerm) {
        where[sequelize_1.Op.or] = [
            { title: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } },
            { content: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } },
            { category: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } }
        ];
    }
    return where;
};
const getNotesService = async (options) => {
    const offset = (options.page - 1) * options.limit;
    const where = buildNotesWhere(options);
    const result = await notes_model_1.default.findAndCountAll({
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
        notes_model_1.default.count({ where: activeNotesWhere }),
        notes_model_1.default.count({
            where: {
                ...activeNotesWhere,
                reminder_time: { [sequelize_1.Op.gte]: now }
            }
        }),
        notes_model_1.default.count({ where: { ...activeNotesWhere, pinned: true } })
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
exports.getNotesService = getNotesService;
const updateNoteService = async (id, data) => {
    await notes_model_1.default.update(data, { where: { id } });
    return notes_model_1.default.findByPk(id);
};
exports.updateNoteService = updateNoteService;
const deleteNoteService = async (id) => {
    await notes_model_1.default.update({ deleted_at: new Date() }, { where: { id } });
    return notes_model_1.default.findByPk(id);
};
exports.deleteNoteService = deleteNoteService;
const restoreNoteService = async (id) => {
    await notes_model_1.default.update({ deleted_at: null }, { where: { id } });
    return notes_model_1.default.findByPk(id);
};
exports.restoreNoteService = restoreNoteService;
const permanentlyDeleteNoteService = async (id) => {
    await notes_model_1.default.update({ deleted_at: new Date() }, { where: { id } });
    return notes_model_1.default.findByPk(id);
};
exports.permanentlyDeleteNoteService = permanentlyDeleteNoteService;
