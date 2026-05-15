import { transporter } from "../../config/mail";
import { env } from "../../config/env";

export const sendNoteEmail = async (to: string, subject: string, text: string) => {
  await transporter.sendMail({
    from: `"Smart Notes" <${env.MAIL_USER}>`,
    to,
    subject,
    text
  });
};