import cron from "node-cron";
import { Op } from "sequelize";
import Note from "../modules/notes/notes.model";
import { sendNoteEmail } from "../modules/email/email.service";
import { env } from "../config/env";

cron.schedule("* * * * *", async () => {
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

  const notes = await Note.findAll({
    where: {
      reminder_time: {
        [Op.between]: [oneMinuteAgo, now]
      }
    }
  });

  const recipient = env.REMINDER_EMAIL || env.MAIL_USER;
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
      await sendNoteEmail(
        recipient,
        "Reminder",
        `${note.get("title")} - ${note.get("content")}`
      );
      console.log(`Reminder email sent for note ${note.get("id")}`);
    } catch (error) {
      console.error(`Failed to send reminder email for note ${note.get("id")}:`, error);
    }
  }
});