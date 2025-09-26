import nodemailer from "nodemailer";

// Configure with ENV
const COMPANY_EMAIL = process.env.COMPANY_EMAIL; 

export default async function sendPaymentReceiptEmail({ payment, userEmail }) {
  const transporter = nodemailer.createTransport({
    // Example: Gmail SMTP, use your credentials or a transactional provider
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  // Construct receipt HTML
  const html = `
    <h2>Payment Receipt</h2>
    <p>Payment ID: ${payment.payment_id}</p>
    <p>Amount Paid: ₹${payment.amount}</p>
    <p>Currency: ${payment.currency}</p>
    <p>Status: ${payment.status}</p>
    <p>Date: ${new Date(payment.date * 1000).toLocaleString()}</p>
    <p>Invoice Number: ${payment.invoice_number}</p>
    <p>Reference Number: ${payment.reference_number}</p>
    <hr/>
    <p>Description: ${payment.description || ""}</p>
  `;

  // Send to user and company
  const recipients = [userEmail, COMPANY_EMAIL];

  await transporter.sendMail({
    from: `"Brandgea Payments" <${process.env.EMAIL_USER}>`,
    to: recipients.join(","),
    subject: "Your Payment Receipt",
    html,
  });
}
