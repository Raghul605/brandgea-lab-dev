import getMailerTransporter from "./nodeMailerTransporter.js"; // Adjust path
import LeadManagement from "../models/LeadToVendorManagementModel.js";
import VendorDetails from "../models/vendorDetailsModel.js";

const transporter = getMailerTransporter();

export default async function LeadMailingFunc(leadDocId, paymentId) {
  try {
    // 1. Find LeadManagement by Lead_doc_id (1 query)
    const lead = await LeadManagement.findById(leadDocId).lean();
    if (!lead) {
      console.error(`❌ Lead not found: ${leadDocId}`);
      return false;
    }

    const { LeadID, CustomerName, CustomerEmail, CustomerMobile, leadTitle, Requirement } = lead;

    // 2. Find specific vendor quote by paymentId (scan MAX 5 items!)
    const succeededQuote = lead.vendor_quotes.find(
      vq => vq.paymentId === paymentId && vq.Status === 'succeeded'
    );
    
    if (!succeededQuote) {
      console.log(`⏭️ No succeeded quote for paymentId ${paymentId} in Lead ${LeadID}`);
      return false;
    }

    const { VendorEmail, amountQuoted } = succeededQuote;

    // 3. Find VendorDetails by VendorEmail
    const vendor = await VendorDetails.findOne({ VendorEmail }).lean();
    if (!vendor) {
      console.error(`❌ Vendor not found: ${VendorEmail}`);
      return false;
    }

    const { VendorName, VendorPhone, doc_link } = vendor;

    // 4. Customer Email Template (Vendor gets details)
    const customerHtml = wrapHtml(
      `✅ Vendor Confirmed for Lead ${LeadID}`,
      `
        <p>Hi <strong>${CustomerName}</strong>,</p>
        <p>Your Lead <strong>${LeadID}</strong> for <strong>"${leadTitle}"</strong> has a confirmed vendor quote!</p>
        
        <h3>📋 Vendor Details</h3>
        <table style="border-collapse:collapse;width:100%;margin:16px 0;">
          <tr><td style="padding:8px 12px;border:1px solid #eee;"><strong>Name:</strong></td><td style="padding:8px 12px;border:1px solid #eee;">${VendorName}</td></tr>
          <tr><td style="padding:8px 12px;border:1px solid #eee;"><strong>Email:</strong></td><td style="padding:8px 12px;border:1px solid #eee;"><a href="mailto:${VendorEmail}">${VendorEmail}</a></td></tr>
          <tr><td style="padding:8px 12px;border:1px solid #eee;"><strong>Phone:</strong></td><td style="padding:8px 12px;border:1px solid #eee;">${VendorPhone}</td></tr>
          ${doc_link ? `<tr><td style="padding:8px 12px;border:1px solid #eee;"><strong>Documents:</strong></td><td style="padding:8px 12px;border:1px solid #eee;"><a href="${doc_link}" target="_blank">View Docs</a></td></tr>` : ''}
        </table>
        
        <h3>💰 Quote Details</h3>
        <p><strong>Amount Quoted:</strong> <strong>₹${amountQuoted.toLocaleString('en-IN')}</strong></p>
        <p><strong>Payment ID:</strong> ${paymentId}</p>
        
        <h3>📝 Your Requirements</h3>
        <div style="background:#f7f7f7;padding:16px;border-radius:8px;font-size:14px;max-height:200px;overflow-y:auto;">
          <pre>${JSON.stringify(Requirement, null, 2).slice(0, 400)}...</pre>
        </div>
        
        <p><strong>✅ Next:</strong> Contact your vendor directly to finalize order details!</p>
        <p>Need help? <a href="https://wa.me/8148939892">WhatsApp +91 81489 39892</a></p>
      `
    );

    // 5. Vendor Email Template (Customer gets details)
    const vendorHtml = wrapHtml(
      `🎉 New Confirmed Lead ${LeadID}`,
      `
        <p>Hi <strong>${VendorName}</strong>,</p>
        <p>Your quote for Lead <strong>${LeadID}</strong> (<strong>"${leadTitle}"</strong>) has been <strong>ACCEPTED</strong>!</p>
        
        <h3>👥 Customer Details</h3>
        <table style="border-collapse:collapse;width:100%;margin:16px 0;">
          <tr><td style="padding:8px 12px;border:1px solid #eee;"><strong>Name:</strong></td><td style="padding:8px 12px;border:1px solid #eee;">${CustomerName}</td></tr>
          <tr><td style="padding:8px 12px;border:1px solid #eee;"><strong>Email:</strong></td><td style="padding:8px 12px;border:1px solid #eee;"><a href="mailto:${CustomerEmail}">${CustomerEmail}</a></td></tr>
          <tr><td style="padding:8px 12px;border:1px solid #eee;"><strong>Mobile:</strong></td><td style="padding:8px 12px;border:1px solid #eee;">${CustomerMobile}</td></tr>
        </table>
        
        <h3>📝 Requirements</h3>
        <div style="background:#f7f7f7;padding:16px;border-radius:8px;font-size:14px;max-height:200px;overflow-y:auto;">
          <pre>${JSON.stringify(Requirement, null, 2).slice(0, 400)}...</pre>
        </div>
        
        <h3>💰 Your Quote</h3>
        <p><strong>Amount Quoted:</strong> <strong>₹${amountQuoted.toLocaleString('en-IN')}</strong></p>
        <p><strong>Payment ID:</strong> ${paymentId}</p>
        
        <p><strong>✅ Action:</strong> Contact customer ASAP to finalize order & delivery!</p>
      `
    );

    // 6. Send emails using shared transporter
    const [customerResult, vendorResult] = await Promise.allSettled([
      transporter.sendMail({
        from: `"Brandgea" <${process.env.GMAIL_USER}>`,
        to: CustomerEmail,
        subject: `✅ Vendor confirmed for your Lead ${LeadID}`,
        html: customerHtml,
      }),
      transporter.sendMail({
        from: `"Brandgea" <${process.env.GMAIL_USER}>`,
        to: VendorEmail,
        subject: `🎉 Lead ${LeadID} confirmed - Customer details inside`,
        html: vendorHtml,
      })
    ]);

    // 7. Update flags in ALL matching vendor_quotes + lead
    await LeadManagement.findByIdAndUpdate(leadDocId, {
      $set: {
        "vendor_quotes.$[vq].sentCustomerDetailsToVendor": true,
        "vendor_quotes.$[vq].sentCustomerDetailsToVendorAt": new Date(),
        "vendor_quotes.$[vq].sentVendorDetailsToCustomer": true,
        "vendor_quotes.$[vq].sentVendorDetailsToCustomerAt": new Date(),
        updatedAt: new Date()
      },
      arrayFilters: [{ "vq.paymentId": paymentId }]
    });

    console.log(`✅ LeadMailingFunc SUCCESS | Lead: ${LeadID} | Vendor: ${VendorEmail} | Customer: ${CustomerEmail}`);
    return true;

  } catch (error) {
    console.error(`❌ LeadMailingFunc FAILED ${leadDocId}/${paymentId}:`, error);
    return false;
  }
}

// Simple HTML wrapper (if you don't have it)
function wrapHtml(title, body) {
  return `
    <!doctype html>
    <html>
    <head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
    <body style="margin:0;padding:24px;background:#f3f4f6;font-family:system-ui,Segoe UI,Roboto,Arial;">
      <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
        <div style="padding:24px;background:#16a34a;color:white;text-align:center;">
          <h1 style="margin:0;font:600 20px/1.2 system-ui;">${title}</h1>
        </div>
        <div style="padding:24px;color:#111827;font:15px/1.6 system-ui;">
          ${body}
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
          <p style="color:#6b7280;font-size:13px;margin:0;">— Brandgea Team | +91 81489 39892</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
