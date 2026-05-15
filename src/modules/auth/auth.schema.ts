import { FastifySchema } from "fastify";

export const loginSchema: FastifySchema = {
  body: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string" },
      password: { type: "string" }
    }
  }
};

export const registerSchema: FastifySchema = {
  body: {
    type: "object",
    required: ["name", "email", "password"],
    properties: {
      name: { type: "string" },
      email: { type: "string" },
      password: { type: "string" },
      phone: { type: "string" },        
      location: { type: "string" } 
    }
  }
};