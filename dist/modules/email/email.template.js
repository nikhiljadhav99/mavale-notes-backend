"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noteTemplate = void 0;
const noteTemplate = (title, content) => {
    return `
    Title: ${title}
    Content: ${content}
  `;
};
exports.noteTemplate = noteTemplate;
