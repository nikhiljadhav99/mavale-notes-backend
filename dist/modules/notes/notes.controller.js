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
exports.permanentlyDeleteNote = exports.restoreNote = exports.deleteNote = exports.updateNote = exports.getNotes = exports.createNote = void 0;
const noteService = __importStar(require("./notes.service"));
const createNote = async (req, reply) => {
    const note = await noteService.createNoteService(req.body);
    return reply.send(note);
};
exports.createNote = createNote;
const getNotes = async (req, reply) => {
    const query = req.query;
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 6, 1), 50);
    const notes = await noteService.getNotesService({
        activeView: query.activeView || "",
        limit,
        page,
        searchTerm: query.searchTerm || ""
    });
    return reply.send(notes);
};
exports.getNotes = getNotes;
const updateNote = async (req, reply) => {
    const { id } = req.params;
    const note = await noteService.updateNoteService(id, req.body);
    return reply.send(note);
};
exports.updateNote = updateNote;
const deleteNote = async (req, reply) => {
    const { id } = req.params;
    await noteService.deleteNoteService(id);
    return reply.send({ message: "Note moved to trash" });
};
exports.deleteNote = deleteNote;
const restoreNote = async (req, reply) => {
    const { id } = req.params;
    const note = await noteService.restoreNoteService(id);
    return reply.send(note);
};
exports.restoreNote = restoreNote;
const permanentlyDeleteNote = async (req, reply) => {
    const { id } = req.params;
    await noteService.permanentlyDeleteNoteService(id);
    return reply.send({ message: "Note moved to trash" });
};
exports.permanentlyDeleteNote = permanentlyDeleteNote;
