import { FastifyInstance } from "fastify";
import * as controller from "./notes.controller";

export default async function notesRoutes(fastify: FastifyInstance) {
  fastify.post("/notes", controller.createNote);
  fastify.get("/notes", controller.getNotes);
  fastify.put("/notes/:id", controller.updateNote);
  fastify.put("/notes/:id/restore", controller.restoreNote);
  fastify.delete("/notes/:id", controller.deleteNote);
  fastify.delete("/notes/:id/permanent", controller.permanentlyDeleteNote);
}
