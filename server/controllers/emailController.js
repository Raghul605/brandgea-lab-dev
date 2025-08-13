// server/controllers/emailController.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
});

const fmtMoney = (v, currency = "INR") => {
  const num = Number(v);
  return `${currency} ${num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const renderCostsTable = (costs = {}) => {
  const { currency = "INR", ...tiers } = costs || {};
  const rows = Object.entries(tiers)
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

export const sendManufacturingEmail = async (req, res) => {
  try {
    const { formData, chat_id } = req.body;
    const companyEmail = process.env.COMPANY_EMAIL || "raghulj.2001@gmail.com";

    // 1) Find user by email (or switch to protect + req.user.userId if you prefer)
    const user = await User.findOne({ email: formData.email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // 2) Get the relevant chat (explicit chat_id or the latest one)
    let chat = null;
    if (chat_id) chat = user.chat.id(chat_id);
    if (!chat) chat = user.chat[user.chat.length - 1];
    if (!chat) return res.status(400).json({ error: "No quote found for this user" });

    const promptText = chat?.prompt?.text || "(not available)";
    const updatedCosts = chat?.manufacturing_costs || {};

    // 3) Build emails
    const adminBody = wrapHtml(
      "New Manufacturing Request",
      `
      <p style="font:14px/1.6 system-ui;margin:0 0 12px 0;">A new manufacturing request was submitted.</p>
      <div style="margin:14px 0;padding:12px;border:1px solid #eee;border-radius:8px;background:#fafafa">
        <p style="margin:0 0 6px 0;"><strong>Contact</strong></p>
        <p style="margin:0;color:#374151">Name: ${formData.name}</p>
        <p style="margin:0;color:#374151">Email: ${formData.email}</p>
        <p style="margin:0;color:#374151">Mobile: ${formData.mobile}</p>
      </div>
      <p style="font:14px/1.6 system-ui;margin:16px 0 8px 0;"><strong>Product Brief</strong></p>
      <pre style="white-space:pre-wrap;background:#0b1020;color:#e5e7eb;padding:12px;border-radius:8px;margin:0 0 16px 0;font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace">${promptText}</pre>
      <p style="font:14px/1.6 system-ui;margin:16px 0 8px 0;"><strong>Adjusted Manufacturing Costs</strong></p>
      ${renderCostsTable(updatedCosts)}
    `,
      /* footer */ "" // NO "beat your quote" line for company
    );

    const userFooter = `
      <p style="color:#6b7280;font:14px/1.5 system-ui;margin-top:16px">
        If you have a better quote, reply with details and we’ll try to beat it.
      </p>
    `;

    const userBody = wrapHtml(
      "We received your manufacturing request",
      `
      <p style="font:14px/1.6 system-ui;margin:0 0 12px 0;">
        Thanks, ${formData.name}! We’ll reach out at <strong>${formData.mobile}</strong>.
      </p>
      <p style="font:14px/1.6 system-ui;margin:16px 0 8px 0;"><strong>Your Product Brief</strong></p>
      <pre style="white-space:pre-wrap;background:#0b1020;color:#e5e7eb;padding:12px;border-radius:8px;margin:0 0 16px 0;font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace">${promptText}</pre>
      <p style="font:14px/1.6 system-ui;margin:16px 0 8px 0;"><strong>Your Adjusted Manufacturing Costs</strong></p>
      ${renderCostsTable(updatedCosts)}
    `,
      userFooter // "beat your quote" ONLY for user
    );

    const adminMail = {
      from: `"Brandgea" <${process.env.GMAIL_USER}>`,
      to: companyEmail,
      subject: "New Manufacturing Request",
      html: adminBody,
      text:
        `New manufacturing request\n` +
        `Name: ${formData.name}\nEmail: ${formData.email}\nMobile: ${formData.mobile}\n\n` +
        `Brief:\n${promptText}\n\n` +
        `Costs:\n${JSON.stringify(updatedCosts, null, 2)}`,
    };

    const userMail = {
      from: `"Brandgea" <${process.env.GMAIL_USER}>`,
      to: formData.email,
      subject: "We received your manufacturing request",
      html: userBody,
      text:
        `Thanks ${formData.name}\n` +
        `We will reach you at ${formData.mobile}\n\n` +
        `Brief:\n${promptText}\n\n` +
        `Costs:\n${JSON.stringify(updatedCosts, null, 2)}\n\n` +
        `If you have a better quote, reply with details and we’ll try to beat it.`,
    };

    // 4) Send both
    await Promise.all([transporter.sendMail(adminMail), transporter.sendMail(userMail)]);
    return res.status(200).json({ message: "Manufacturing emails sent successfully" });
  } catch (error) {
    console.error("Manufacturing email error:", error);
    return res.status(500).json({ error: "Failed to send manufacturing emails" });
  }
};
