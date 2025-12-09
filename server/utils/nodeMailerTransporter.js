// utils/mailer.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

let transporter;

export default  function getMailerTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
  }
  return transporter;
}
