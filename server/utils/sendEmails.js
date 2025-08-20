import nodemailer from "nodemailer";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Helpers – unchanged from your original
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
    .sort((a, b) => Number(a[0]) - Number(b))
    .map(
      ([qty, price]) => `
      <tr>
        <td style="padding:10px 12px;border:1px solid #eee;">${qty} pcs</td>
        <td style="padding:10px 12px;border:1px solid #eee;">${fmtMoney(
          price,
          currency
        )}</td>
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

const renderTechPackHtml = (tp, includeComplexity = true) => {
  if (!tp || typeof tp !== "object") return "";
  return `
    <div style="margin:24px 0 8px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;border:1px solid #eee;border-radius:8px;overflow:hidden;margin-bottom:16px">
        <thead>
          <tr style="background:#f7f7f7;">
            <th style="text-align:left;padding:10px 12px;border:1px solid #eee;">Field</th>
            <th style="text-align:left;padding:10px 12px;border:1px solid #eee;">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style="padding:10px 12px;border:1px solid #eee;">Garment Type</td><td style="padding:10px 12px;border:1px solid #eee;">${
            tp.garment_type
          }</td></tr>
          <tr><td style="padding:10px 12px;border:1px solid #eee;">Material</td><td style="padding:10px 12px;border:1px solid #eee;">${
            tp.material
          }</td></tr>
          <tr><td style="padding:10px 12px;border:1px solid #eee;">GSM</td><td style="padding:10px 12px;border:1px solid #eee;">${
            tp.gsm
          }</td></tr>
          <tr><td style="padding:10px 12px;border:1px solid #eee;">Colors</td><td style="padding:10px 12px;border:1px solid #eee;">${
            tp.color ? tp.color.join(", ") : ""
          }</td></tr>
          <tr><td style="padding:10px 12px;border:1px solid #eee;">Design Details</td>
            <td style="padding:10px 12px;border:1px solid #eee;">
              ${(tp.Design || [])
                .map((d) => `${d.placement} (${d.decoration_type})`)
                .join("<br/>")}
            </td>
          </tr>
          <tr><td style="padding:10px 12px;border:1px solid #eee;">Tech/Decoration</td><td style="padding:10px 12px;border:1px solid #eee;">${
            tp.tech
          }</td></tr>
          <tr><td style="padding:10px 12px;border:1px solid #eee;">Wash Treatments</td><td style="padding:10px 12px;border:1px solid #eee;">${
            tp.wash_treatments && tp.wash_treatments.length
              ? tp.wash_treatments.join(", ")
              : "None"
          }</td></tr>
          ${
            includeComplexity
              ? `<tr><td style="padding:10px 12px;border:1px solid #eee;">Complexity Class</td><td style="padding:10px 12px;border:1px solid #eee;">${tp.complexity_class}</td></tr>`
              : ""
          }
          <tr><td style="padding:10px 12px;border:1px solid #eee;">Additional Comments</td><td style="padding:10px 12px;border:1px solid #eee;">${
            tp.additional_comments || ""
          }</td></tr>
        </tbody>
      </table>
    </div>
  `;
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
 * Send manufacturing cost emails to client and company, with tech pack formatted in body and images as attachments.
 * @param {String} user_id - MongoDB ObjectId of client
 * @param {Object} originalCosts - Original manufacturing costs from GPT
 * @param {Object} updatedCosts - Adjusted manufacturing costs
 * @param {String} prompt - User's product prompt
 * @param {Object} techPack - Tech pack data (object)
 * @param {Array} images - Array of image paths or Buffers (use file paths or {buffer, originalname})
 */
export default async function sendEmails(
  user_id,
  originalCosts,
  updatedCosts,
  prompt,
  techPack,
  images = [],
  profitMargin,
  country
) {
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

    // Compose client email body (tech pack formatted as readable HTML)
    const clientBody = wrapHtml(
      "Your Product Manufacturing Cost Details",
      `
    <p style="font:14px/1.6 system-ui;margin:0 0 12px 0;">Hello ${
      user.name
    },</p>
    <p style="font:14px/1.6 system-ui;margin:0 0 8px 0;">Here are your manufacturing costs for your request.</p>

    <p style="font:14px/1.6 system-ui;margin:16px 0 8px 0;"><strong>Your Product Brief</strong></p>
    <pre style="white-space:pre-wrap;background:#0b1020;color:#e5e7eb;padding:12px;border-radius:8px;margin:0 0 16px 0;font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace">${prompt}</pre>

    <p style="font:14px/1.6 system-ui;margin:16px 0 8px 0;"><strong>Tech Pack Details</strong></p>
    ${renderTechPackHtml(techPack, false)} <!-- false hides complexity_class -->

    <p style="font:14px/1.6 system-ui;margin:16px 0 8px 0;"><strong>Manufacturing Cost</strong></p> <!-- updated heading -->
    ${renderCostsTable(updatedCosts)}
  `,
      clientFooter
    );

    // Compose company email body
    const companyBody = wrapHtml(
      "New Client Product Inquiry — Manufacturing Cost Details",
      `
    <p style="font:14px/1.6 system-ui;margin:0 0 12px 0;">Hello Team,</p>
    <p style="font:14px/1.6 system-ui;margin:0 0 8px 0;">
      A client (<strong>${
        user.name
      }</strong>, Email: <a href="mailto:${clientEmail}">${clientEmail}</a>) has submitted a new product inquiry.
    </p>

    <p style="font:14px/1.6 system-ui;margin:16px 0 8px 0;"><strong>Product Brief</strong></p>
    <pre style="white-space:pre-wrap;background:#0b1020;color:#e5e7eb;padding:12px;border-radius:8px;margin:0 0 16px 0;font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace">${prompt}</pre>

    <p style="font:14px/1.6 system-ui;margin:16px 0 8px 0;"><strong>Tech Pack Details</strong></p>
    ${renderTechPackHtml(
      techPack,
      true
    )} <!-- true includes complexity_class -->

<p style="font:14px/1.6 system-ui;margin:16px 0 8px 0;">
  <strong>Profit Margin:</strong> ${((profitMargin - 1) * 100).toFixed(
    1
  )}% <br/>
  <strong>Country:</strong> ${country}
</p>

    <p style="font:14px/1.6 system-ui;margin:16px 0 8px 0;"><strong>Original Manufacturing Costs (from GPT)</strong></p>
    ${renderCostsTable(originalCosts)}

    <p style="font:14px/1.6 system-ui;margin:16px 0 8px 0;">
      <strong>Manufacturing Cost with Profit</strong>
    </p>
    ${renderCostsTable(updatedCosts)}

    <p style="color:#6b7280;font:13px/1.5 system-ui;margin-top:14px;">
      For follow-up, contact the client at <a href="mailto:${clientEmail}">${clientEmail}</a>.
    </p>
  `
    );

    // 3) Prepare plain-text fallbacks
    const clientText =
      `Hello ${user.name},\n\n` +
      `Your Product Brief:\n${prompt}\n\n` +
      `Tech Pack Details:\n${JSON.stringify(techPack, null, 2)}\n\n` +
      `Manufacturing Costs:\n${JSON.stringify(updatedCosts, null, 2)}\n\n` +
      `If you have a better quote, reply with details and we’ll try to beat it.\n\n` +
      `— Brandgea Team`;

    const companyText =
      `Hello Team,\n\n` +
      `Client: ${user.name} (${clientEmail})\n\n` +
      `Product Brief:\n${prompt}\n\n` +
      `Tech Pack Details:\n${JSON.stringify(techPack, null, 2)}\n\n` +
      `Original Manufacturing Costs (from GPT):\n${JSON.stringify(
        originalCosts,
        null,
        2
      )}\n\n` +
      `For follow-up, contact the client at ${clientEmail}.`;

    // 4) Prepare attachments (images as direct file attachments)
    let attachments = [];
    for (let img of images) {
      if (typeof img === "string") {
        // File path: guess type from extension
        const ext = img.split(".").pop().toLowerCase();
        const type =
          ext === "jpg" || ext === "jpeg"
            ? "image/jpeg"
            : ext === "png"
            ? "image/png"
            : "application/octet-stream"; // fallback
        attachments.push({
          filename: img.split("/").pop(),
          path: img,
          contentType: type,
        });
      } else if (img && img.buffer && img.originalname) {
        const ext = img.originalname.split(".").pop().toLowerCase();
        const type =
          ext === "jpg" || ext === "jpeg"
            ? "image/jpeg"
            : ext === "png"
            ? "image/png"
            : "application/octet-stream";
        attachments.push({
          filename: img.originalname,
          content: img.buffer,
          contentType: type,
        });
      }
    }

    await Promise.all([
      transporter.sendMail({
        from: `"Brandgea" <${process.env.GMAIL_USER}>`,
        to: clientEmail,
        subject: "Your Product Manufacturing Cost Details",
        html: clientBody,
        text: clientText,
        attachments,
      }),
      transporter.sendMail({
        from: `"Brandgea" <${process.env.GMAIL_USER}>`,
        to: companyEmail,
        subject: "New Client Product Inquiry - Manufacturing Cost Details",
        html: companyBody,
        text: companyText,
        attachments,
      }),
    ]);
  } catch (err) {
    console.error("Error sending emails:", err);
  }
}
