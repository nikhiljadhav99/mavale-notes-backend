import { env } from "../../config/env";
import * as transactionService from "../transactions/transaction.service";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type VoiceChatInput = {
  message?: string;
  history?: ChatMessage[];
};

type AiAction = {
  type?: string;
  transaction?: {
    title?: string;
    amount?: number;
    type?: "income" | "expense";
    transaction_date?: string;
    note?: string;
  };
};

export const createVoiceChatResponse = async (userId: string, input: VoiceChatInput) => {
  if (!env.OPENAI_API_KEY) {
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
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL,
      instructions:
        [
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
  const action = parsed?.action as AiAction | undefined;

  if (action?.type === "create_transaction" && action.transaction) {
    const transaction = await transactionService.createTransactionService(
      userId,
      action.transaction
    );
    return { reply, transaction, transactionCreated: true };
  }

  return { reply };
};

const readOutputText = (data: any) => {
  const output = Array.isArray(data?.output) ? data.output : [];

  return output
    .flatMap((item: any) => (Array.isArray(item?.content) ? item.content : []))
    .filter((content: any) => content?.type === "output_text" && content?.text)
    .map((content: any) => content.text)
    .join("\n")
    .trim();
};

const readJsonObject = (text: string) => {
  try {
    return JSON.parse(text);
  } catch (_) {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch (_) {
      return null;
    }
  }
};
