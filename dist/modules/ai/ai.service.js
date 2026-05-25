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
exports.createVoiceChatResponse = void 0;
const env_1 = require("../../config/env");
const transactionService = __importStar(require("../transactions/transaction.service"));
const createVoiceChatResponse = async (userId, input) => {
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
            instructions: [
                "You are the Smart Notes voice assistant. Be concise, practical, and friendly.",
                "You can also create expense and payment records when the user asks.",
                "Use transaction type income for received payments and expense for spending.",
                "If the user asks to record an expense or payment and gives an amount, return only JSON with this shape:",
                "{\"reply\":\"short confirmation\",\"action\":{\"type\":\"create_transaction\",\"transaction\":{\"title\":\"short title\",\"amount\":123,\"type\":\"expense\",\"transaction_date\":\"YYYY-MM-DD\",\"note\":\"optional note\"}}}",
                "For vague finance requests or missing amount, ask one short follow-up in JSON as {\"reply\":\"question\"}.",
                "For non-finance requests, return JSON as {\"reply\":\"answer\"}.",
                "Do not include markdown."
            ].join(" "),
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
    const parsed = readJsonObject(text);
    const reply = parsed?.reply?.toString() || text;
    const action = parsed?.action;
    if (action?.type === "create_transaction" && action.transaction) {
        const transaction = await transactionService.createTransactionService(userId, action.transaction);
        return { reply, transaction, transactionCreated: true };
    }
    return { reply };
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
const readJsonObject = (text) => {
    try {
        return JSON.parse(text);
    }
    catch (_) {
        const match = text.match(/\{[\s\S]*\}/);
        if (!match)
            return null;
        try {
            return JSON.parse(match[0]);
        }
        catch (_) {
            return null;
        }
    }
};
