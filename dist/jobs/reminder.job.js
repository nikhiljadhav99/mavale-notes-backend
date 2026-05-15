"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const sequelize_1 = require("sequelize");
const notes_model_1 = __importDefault(require("../modules/notes/notes.model"));
const email_service_1 = require("../modules/email/email.service");
const env_1 = require("../config/env");
node_cron_1.default.schedule("* * * * *", async () => {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    const notes = await notes_model_1.default.findAll({
        where: {
            reminder_time: {
                [sequelize_1.Op.between]: [oneMinuteAgo, now]
            }
        }
    });
    const recipient = env_1.env.REMINDER_EMAIL || env_1.env.MAIL_USER;
    if (!recipient) {
        console.warn("Reminder job skipped because no reminder recipient is configured.");
        return;
    }
    if (!notes.length) {
        console.log("Reminder job found no notes to send.");
        return;
    }
    for (const note of notes) {
        try {
            await (0, email_service_1.sendNoteEmail)(recipient, "Reminder", `${note.get("title")} - ${note.get("content")}`);
            console.log(`Reminder email sent for note ${note.get("id")}`);
        }
        catch (error) {
            console.error(`Failed to send reminder email for note ${note.get("id")}:`, error);
        }
    }
});
