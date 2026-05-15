"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNoteEmail = void 0;
const mail_1 = require("../../config/mail");
const env_1 = require("../../config/env");
const sendNoteEmail = async (to, subject, text) => {
    await mail_1.transporter.sendMail({
        from: `"Smart Notes" <${env_1.env.MAIL_USER}>`,
        to,
        subject,
        text
    });
};
exports.sendNoteEmail = sendNoteEmail;
