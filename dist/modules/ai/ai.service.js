"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVoiceChatResponse = void 0;
const env_1 = require("../../config/env");
const createVoiceChatResponse = async (input) => {
    if (!env_1.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is not configured");
    }
    const message = input.message?.trim();
    if (!message) {
        throw new Error("Message is required");
    }
    const history = Array.isArray(input.history) ? input.history.slice(-8) : [];
    const conversation = history
        .filter((item) => item.content?.trim())
        .map((item) => ({
        role: item.role === "assistant" ? "assistant" : "user",
        content: item.content.trim(),
    }));
    const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${env_1.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: env_1.env.OPENAI_MODEL,
            instructions: "You are the Smart Notes voice assistant. Be concise, practical, and friendly. Help with notes, reminders, summaries, and productivity. Keep spoken answers short unless the user asks for detail.",
            input: [...conversation, { role: "user", content: message }],
            max_output_tokens: 500,
        }),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data?.error?.message || "AI response failed");
    }
    const text = data.output_text || readOutputText(data);
    if (!text) {
        throw new Error("AI response was empty");
    }
    return { reply: text };
};
exports.createVoiceChatResponse = createVoiceChatResponse;
const readOutputText = (data) => {
    const output = Array.isArray(data?.output) ? data.output : [];
    return output
        .flatMap((item) => (Array.isArray(item?.content) ? item.content : []))
        .filter((content) => content?.type === "output_text" && content?.text)
        .map((content) => content.text)
        .join("\n")
        .trim();
};
