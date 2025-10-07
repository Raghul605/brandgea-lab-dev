import nodemailer from "nodemailer";

const COMPANY_EMAIL = process.env.COMPANY_EMAIL; // company notifications inbox

export default async function sendPaymentEmails({
  userEmail,
  userName,
  userMobile,
  docId,
    techPack,
  manufacturingCosts
}) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER, 
      pass: process.env.GMAIL_PASS,
    },
  });

  // User/Client Email Content
  const userHtml = `
    <h2>Your Brandgea Manufacturing Service has started!</h2>
    <p>Hi ${userName || "Customer"},</p>
    <p>Thank you for opting for Brandgea Manufacturing Service.</p>
    <p>Our Relationship Manager (RM) has received your requirement and will be connecting with you shortly to:</p>
    <ul>
      <li>Understand your requirement in more detail</li>
      <li>Collect any additional inputs</li>
      <li>Begin the process of identifying the Top 5 manufacturers best suited for your needs</li>
    </ul>
    <h3>What’s next?</h3>
    <p>Within 24 hours, you’ll receive a detailed report with:</p>
    <ul>
      <li>Quotes from 5 trusted manufacturers</li>
      <li>Manufacturer profiles with key details</li>
      <li>Next-step guidance to help you move forward</li>
    </ul>
    <p>We’re excited to help you bring your product vision to life!</p>
    <p>
      If you have any urgent queries in the meantime, feel free to reply to this email or WhatsApp to ( 8148939892 ) — our team is here to support you.
    </p>
    <br/>
    <p>Warm regards,<br/>Team Brandgea</p>
  `;

    // Tech Pack HTML formatting
  let techPackHtml = "<em>No tech pack provided</em>";
  if (techPack && typeof techPack === "object") {
    techPackHtml = "<ul>" + 
      Object.entries(techPack).map(([key, value]) => {
        if (Array.isArray(value)) {
          value = value.join(", ");
        }
        return `<li><strong>${key}:</strong> ${value}</li>`;
      }).join("") + 
      "</ul>";
  }

    // Manufacturing costs HTML formatting
  let manufacturingCostsHtml = "<em>No estimate value provided</em>";
  if (manufacturingCosts && typeof manufacturingCosts === "object") {
    const { currency, ...rest } = manufacturingCosts;
    const rows = Object.entries(rest)
      .filter(([k, v]) => !isNaN(Number(k)))
      .map(([quantity, cost]) => 
        `<tr><td>${quantity}</td><td>${cost} ${currency || ""}</td></tr>`
      ).join("");
    manufacturingCostsHtml = `
      <table border="1" cellpadding="4" cellspacing="0">
        <thead>
          <tr>
            <th>Quantity</th>
            <th>Estimated Cost (${currency || ""})</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  }

  // Company Notification Content
  const companyHtml = `
    <h2>New RM Service Request</h2>
    <p>Hi Team,</p>
    <p>A new customer has opted for the Brandgea RM Service. Please review and connect with them within the next 24 hours.</p>
    <h3>Customer Details:</h3>
    <ul>
      <li>Name: ${userName || "Customer"}</li>
      <li>Email: ${userEmail}</li>
      <li>Phone: ${userMobile}</li>
      <li>Requirement ID: ${docId}</li>
      <li>
        <strong>Product Requirement:</strong>
        ${techPackHtml}
      </li>
      <li>
        <strong>Estimate Value:</strong>
        ${manufacturingCostsHtml}
      </li>
    </ul>
    <p>Thanks,<br/>Brandgea System Notification</p>
  `;

  // Send to user/customer
  await transporter.sendMail({
    from: `"Brandgea Payments" <${process.env.GMAIL_USER}>`,
    to: userEmail,
    subject: "Your Brandgea Manufacturing Service has started!",
    html: userHtml,
  });

  // Send to company inbox
  await transporter.sendMail({
    from: `"Brandgea Payments" <${process.env.GMAIL_USER}>`,
    to: COMPANY_EMAIL,
    subject: "New RM Service Request",
    html: companyHtml,
  });
}
