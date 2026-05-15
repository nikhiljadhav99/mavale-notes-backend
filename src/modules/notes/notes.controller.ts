import { FastifyRequest, FastifyReply } from "fastify";
import * as noteService from "./notes.service";

export const createNote = async (req: FastifyRequest, reply: FastifyReply) => {
  const note = await noteService.createNoteService(req.body);
  return reply.send(note);
};

export const getNotes = async (req: FastifyRequest, reply: FastifyReply) => {
  const query = req.query as any;
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 6, 1), 50);
  const notes = await noteService.getNotesService({
    activeCategory: query.activeCategory || "",
    activeView: query.activeView || "",
    limit,
    page,
    searchTerm: query.searchTerm || ""
  });
  return reply.send(notes);
};

export const updateNote = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as any;
  const note = await noteService.updateNoteService(id, req.body);
  return reply.send(note);
};

export const deleteNote = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as any;
  await noteService.deleteNoteService(id);
  return reply.send({ message: "Note moved to trash" });
};

export const restoreNote = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as any;
  const note = await noteService.restoreNoteService(id);
  return reply.send(note);
};

export const permanentlyDeleteNote = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as any;
  await noteService.permanentlyDeleteNoteService(id);
  return reply.send({ message: "Note moved to trash" });
};
