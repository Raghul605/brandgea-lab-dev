import nodemailer from "nodemailer";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER, // Gmail address
    pass: process.env.GMAIL_PASS, // App-specific password
  },
});

// Helpers
const fmtMoney = (v, currency = "INR") => {
  const num = Number(v);
  return `${currency} ${num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const renderCostsTable = (costs = {}) => {
  if (!costs || typeof costs !== "object") return "";
  const { currency = "INR", ...tiers } = costs;

  const rows = Object.entries(tiers)
    .filter(([k]) => k !== "currency")
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(
      ([qty, price]) => `
      <tr>
        <td style="padding:10px 12px;border:1px solid #eee;">${qty} pcs</td>
        <td style="padding:10px 12px;border:1px solid #eee;">${fmtMoney(price, currency)}</td>
        <td style="padding:10px 12px;border:1px solid #eee;font-weight:600;">
          ${fmtMoney(Number(price) * Number(qty), currency)}
        </td>
      </tr>`
    )
    .join("");

  return `
  <table role="presentation" cellspacing="0" cellpadding="0" style="border-collapse:collapse;width:100%;border:1px solid #eee;border-radius:8px;overflow:hidden">
    <thead>
      <tr style="background:#f7f7f7;">
        <th style="text-align:left;padding:10px 12px;border:1px solid #eee;">Quantity</th>
        <th style="text-align:left;padding:10px 12px;border:1px solid #eee;">Unit Price</th>
        <th style="text-align:left;padding:10px 12px;border:1px solid #eee;">Total</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
};

const wrapHtml = (title, body, footer = "") => `
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;">
  <div style="max-width:640px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
    <div style="padding:20px 24px;border-bottom:1px solid #e5e7eb">
      <h1 style="margin:0;font:600 18px/1.3 system-ui,Segoe UI,Roboto,Helvetica,Arial">${title}</h1>
    </div>
    <div style="padding:24px;">
      ${body}
      ${footer}
      <p style="color:#111827;font:600 14px/1.5 system-ui;margin-top:12px">— Brandgea Team</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Send manufacturing cost emails to client and company.
 * @param {String} user_id - MongoDB ObjectId of client
 * @param {Object} originalCosts - Original manufacturing costs from GPT
 * @param {Object} updatedCosts - Adjusted manufacturing costs
 * @param {String} prompt - User's product prompt
 */
export default async function sendEmails(user_id, originalCosts, updatedCosts, prompt) {
  try {
    // 1) Find user for email/name
    const user = await User.findById(user_id);
    if (!user) {
      console.error(`User with id ${user_id} not found, cannot send emails.`);
      return;
    }

    const clientEmail = user.email;
    const companyEmail = process.env.COMPANY_EMAIL;

    // 2) Build HTML bodies
    const clientFooter = `
      <p style="color:#6b7280;font:14px/1.5 system-ui;margin-top:16px">
        If you have a better quote, reply with details and we’ll try to beat it.
      </p>
    `;

    const clientBody = wrapHtml(
      "Your Product Manufacturing Cost Details",
      `
      <p style="font:14px/1.6 system-ui;margin:0 0 12px 0;">Hello ${user.name},</p>
      <p style="font:14px/1.6 system-ui;margin:0 0 8px 0;">Here are your manufacturing costs for your request.</p>

      <p style="font:14px/1.6 system-ui;margin:16px 0 8px 0;"><strong>Your Product Brief</strong></p>
      <pre style="white-space:pre-wrap;background:#0b1020;color:#e5e7eb;padding:12px;border-radius:8px;margin:0 0 16px 0;font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace">${prompt}</pre>

      <p style="font:14px/1.6 system-ui;margin:16px 0 8px 0;"><strong>Adjusted Manufacturing Costs</strong></p>
      ${renderCostsTable(updatedCosts)}
    `,
      clientFooter // only user gets the “beat your quote” line
    );

    const companyBody = wrapHtml(
      "New Client Product Inquiry — Manufacturing Cost Details",
      `
      <p style="font:14px/1.6 system-ui;margin:0 0 12px 0;">Hello Team,</p>
      <p style="font:14px/1.6 system-ui;margin:0 0 8px 0;">
        A client (<strong>${user.name}</strong>, Email: <a href="mailto:${clientEmail}">${clientEmail}</a>) has submitted a new product inquiry.
      </p>

      <p style="font:14px/1.6 system-ui;margin:16px 0 8px 0;"><strong>Product Brief</strong></p>
      <pre style="white-space:pre-wrap;background:#0b1020;color:#e5e7eb;padding:12px;border-radius:8px;margin:0 0 16px 0;font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace">${prompt}</pre>

      <p style="font:14px/1.6 system-ui;margin:16px 0 8px 0;"><strong>Original Manufacturing Costs (from GPT)</strong></p>
      ${renderCostsTable(originalCosts)}

      <p style="color:#6b7280;font:13px/1.5 system-ui;margin-top:14px;">
        For follow-up, contact the client at <a href="mailto:${clientEmail}">${clientEmail}</a>.
      </p>
    `,
      "" // NO user-facing promo line for company
    );

    // 3) Also provide plain-text fallbacks
    const clientText =
      `Hello ${user.name},\n\n` +
      `Your Product Brief:\n${prompt}\n\n` +
      `Adjusted Manufacturing Costs:\n${JSON.stringify(updatedCosts, null, 2)}\n\n` +
      `If you have a better quote, reply with details and we’ll try to beat it.\n\n` +
      `— Brandgea Team`;

    const companyText =
      `Hello Team,\n\n` +
      `Client: ${user.name} (${clientEmail})\n\n` +
      `Product Brief:\n${prompt}\n\n` +
      `Original Manufacturing Costs (from GPT):\n${JSON.stringify(originalCosts, null, 2)}\n\n` +
      `For follow-up, contact the client at ${clientEmail}.`;

    // 4) Send both
    await Promise.all([
      transporter.sendMail({
        from: `"Brandgea" <${process.env.GMAIL_USER}>`,
        to: clientEmail,
        subject: "Your Product Manufacturing Cost Details",
        html: clientBody,
        text: clientText,
      }),
      transporter.sendMail({
        from: `"Brandgea" <${process.env.GMAIL_USER}>`,
        to: companyEmail,
        subject: "New Client Product Inquiry - Manufacturing Cost Details",
        html: companyBody,
        text: companyText,
      }),
    ]);
  } catch (err) {
    console.error("Error sending emails:", err);
  }
}
