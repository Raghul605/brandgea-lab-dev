// import nodemailer from "nodemailer";
// import User from "../models/User.js";
// import { QueuedEmail } from "../models/email.log.remainder.model.js";

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.GMAIL_USER,
//     pass: process.env.GMAIL_PASS,
//   },
// });

// // UI template
// const wrapHtml = (
//   title,
//   body,
//   ctaLabel = "Chat on WhatsApp",
//   ctaLink = "https://wa.me/8148939892"
// ) => `
// <!doctype html>
// <html>
// <head>
//   <meta charset="utf-8" />
//   <meta name="viewport" content="width=device-width,initial-scale=1" />
//   <title>${title}</title>
// </head>
// <body style="margin:0;padding:0;background:#f3f4f6;font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial;">
//   <div style="max-width:640px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
//     <div style="padding:20px 24px;border-bottom:1px solid #e5e7eb;background:#f9fafb;">
//       <h1 style="margin:0;font:600 18px/1.3 system-ui,Segoe UI,Roboto,Helvetica,Arial;color:#111827;">
//         ${title}
//       </h1>
//     </div>
//     <div style="padding:24px;color:#111827;font:15px/1.6 system-ui,Segoe UI,Roboto,Helvetica,Arial;">
//       ${body}
//       <div style="text-align:center;margin-top:24px;">
//         <a href="${ctaLink}" style="background:#16a34a;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;display:inline-block;">
//           ${ctaLabel}
//         </a>
//       </div>
//       <p style="color:#6b7280;font-size:13px;margin-top:28px;">— Brandgea Team<br/>+91 81489 39892</p>
//     </div>
//   </div>
// </body>
// </html>
// `;

// // Email templates keyed by reminderLabel for testing intervals 1min, 2min, 4min:
// // const emailTemplates = {
// //   "1min": {
// //     subject: (heading) => `Your ${heading} idea — can we call?`,
// //     body: (firstName, heading) => `
// //       Hi ${firstName},
// //       Thanks for trying Brandgea’s AI Quote for ${heading}. We handle it end-to-end—materials, trims, printing, compliance, sampling, delivery—so you don’t have to juggle vendors.
// //       Share your phone/WhatsApp and best time to reach you. We’ll do a quick 5-min call and take it from there.
// //       Reply with your number or message in WhatsApp (button link wa.me/8148939892)
// //       Best,
// //       Brandgea
// //       +91-8148939892
// //     `,
// //   },
// //   "24hr": {
// //     subject: (heading) => `We can start production steps — a quick call?`,
// //     body: (firstName, heading) => `
// //       Hi ${firstName},
// //       We can move your ${heading} from quote to action—sourcing, sampling, and delivery handled by our team. No vendor chase, no back-and-forth.
// //       Send your phone/WhatsApp + best time, and we’ll do a 5-min handover.
// //       Or ping us @ WhatsApp (button link wa.me/8148939892)
// //       Best,
// //       Brandgea
// //       +91-8148939892
// //     `,
// //   },
// //   "48hr": {
// //     subject: () => `Still up for this? We can take it end-to-end.`,
// //     body: (firstName, heading) => `
// //       Hi ${firstName},
// //       Quick check-in on your ${heading}. If you’d like us to proceed, share your phone/WhatsApp and a good time to call. We’ll handle everything end-to-end.
// //       If you’re not ready, we can pause your quote and pick it up later—just say the word.
// //       WhatsApp (button link wa.me/8148939892)
// //       Thanks,
// //       Brandgea
// //       +91-8148939892
// //     `,
// //   },
// // };

// const emailTemplates = {
//   "1min": {
//     subject: (heading) => `Your ${heading} idea — can we call?`,
//     body: (firstName, heading) => `
//       <p>Hi ${firstName},</p>
//       <p>Thanks for trying <strong>Brandgea’s AI Quote</strong> for your <strong>${heading}</strong>.  
//       We handle everything end-to-end — materials, trims, printing, sampling, and delivery — so you never juggle vendors again.</p>
//       <p>Share your phone / WhatsApp and a good time to reach you — we’ll hop on a quick 5-minute call and take it forward.</p>
//     `,
//   },
//   "24hr": {
//     subject: (heading) =>
//       `We can start your ${heading} — quick 5-min handover?`,
//     body: (firstName, heading) => `
//       <p>Hi ${firstName},</p>
//       <p>We’re ready to move your <strong>${heading}</strong> from quote → production: sourcing, sampling, and delivery handled end-to-end by our team.</p>
//       <p>Just send your phone / WhatsApp number and your preferred time — we’ll take care of the rest.</p>
//     `,
//   },
//   "48hr": {
//     subject: () => `Still up for this? We can take it end-to-end.`,
//     body: (firstName, heading) => `
//       <p>Hi ${firstName},</p>
//       <p>Checking in on your <strong>${heading}</strong>.  
//       If you’d like us to proceed, share your phone / WhatsApp and a good time to call.  
//       We’ll handle everything end-to-end.</p>
//       <p>If you’re not ready yet, no worries — we can pause your quote and pick it up later.</p>
//     `,
//   },
// };

// async function sendQueuedEmails() {
//   try {
//     while (true) {
//       // Find the oldest queued email that is not permanently failed
//       const queuedEmail = await QueuedEmail.findOne({
//         failedToSend: false,
//       }).sort({ createdAt: 1 });
//       if (!queuedEmail) {
//         console.log("No queued emails to send. Exiting sender function.");
//         break;
//       }

//       // Get user info
//       const user = await User.findById(queuedEmail.userId);
//       if (!user) {
//         console.error(
//           `User not found for queued email ${queuedEmail._id}, deleting queue item.`
//         );
//         await QueuedEmail.deleteOne({ _id: queuedEmail._id });
//         continue;
//       }

//       // Find chat by chat_id inside user's chat array
//       const chat = user.chat.find(
//         (c) => c._id.toString() === queuedEmail.relatedChatId.toString()
//       );

//       const heading = chat?.heading || "product";

//       const firstName = user.name || "there";
//       const reminderLabel = queuedEmail.reminderLabel;

//       const template = emailTemplates[reminderLabel];
//       if (!template) {
//         console.error(
//           `No email template found for reminder label ${reminderLabel}`
//         );
//         await QueuedEmail.deleteOne({ _id: queuedEmail._id });
//         continue;
//       }

//       const subject = template.subject(heading);
//       const htmlBody = wrapHtml(
//         "Let's talk — Brandgea",
//         template.body(firstName, heading)
//       );
//       const textBody = `Hi ${firstName},\n\n${template
//         .body(firstName, heading)
//         .replace(/<[^>]+>/g, "")
//         .trim()}\n\n— Brandgea Team\n+91 81489 39892`;

//               const mailOptions = {
//         from: `"Brandgea" <${process.env.GMAIL_USER}>`,
//         to: user.email,
//         subject,
//         html: htmlBody,
//         text: textBody,
//       };

//       // const mailOptions = {
//       //   from: `"Brandgea" <${process.env.GMAIL_USER}>`,
//       //   to: user.email,
//       //   subject:
//       //     typeof template.subject === "function"
//       //       ? template.subject(heading)
//       //       : template.subject,
//       //   text:
//       //     typeof template.body === "function"
//       //       ? template.body(firstName, heading)
//       //       : template.body,
//       // };

//       try {
//         await transporter.sendMail(mailOptions);
//         console.log(
//           `Sent ${reminderLabel} email to user ${user._id} (${user.email})`
//         );
//         await QueuedEmail.deleteOne({ _id: queuedEmail._id });
//       } catch (err) {
//         console.error(
//           `Failed to send email ${queuedEmail._id}: ${err.message}`
//         );

//         queuedEmail.retryCount += 1;
//         if (queuedEmail.retryCount >= queuedEmail.maxRetries) {
//           queuedEmail.failedToSend = true;
//           console.error(
//             `Email ${queuedEmail._id} marked as permanently failed after ${queuedEmail.retryCount} retries.`
//           );
//         }
//         await queuedEmail.save();
//       }
//     }
//   } catch (err) {
//     console.error("Error in sending queued emails:", err);
//   }
// }

// export { sendQueuedEmails };


import getMailerTransporter  from "./nodeMailerTransporter.js";
import User from "../models/User.js";
import { QueuedEmail } from "../models/email.log.remainder.model.js";

const transporter = getMailerTransporter();

// UI template
const wrapHtml = (
  title,
  body,
  ctaLabel = "Chat on WhatsApp",
  ctaLink = "https://wa.me/8148939892"
) => `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial;">
  <div style="max-width:640px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
    <div style="padding:20px 24px;border-bottom:1px solid #e5e7eb;background:#f9fafb;">
      <h1 style="margin:0;font:600 18px/1.3 system-ui,Segoe UI,Roboto,Helvetica,Arial;color:#111827;">
        ${title}
      </h1>
    </div>
    <div style="padding:24px;color:#111827;font:15px/1.6 system-ui,Segoe UI,Roboto,Helvetica,Arial;">
      ${body}
      <div style="text-align:center;margin-top:24px;">
        <a href="${ctaLink}" style="background:#16a34a;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;display:inline-block;">
          ${ctaLabel}
        </a>
      </div>
      <p style="color:#6b7280;font-size:13px;margin-top:28px;">— Brandgea Team<br/>+91 81489 39892</p>
    </div>
  </div>
</body>
</html>
`;

// Email templates keyed by reminderLabel for testing intervals 1min, 2min, 4min:
// const emailTemplates = {
//   "1min": {
//     subject: (heading) => `Your ${heading} idea — can we call?`,
//     body: (firstName, heading) => `
//       Hi ${firstName},
//       Thanks for trying Brandgea’s AI Quote for ${heading}. We handle it end-to-end—materials, trims, printing, compliance, sampling, delivery—so you don’t have to juggle vendors.
//       Share your phone/WhatsApp and best time to reach you. We’ll do a quick 5-min call and take it from there.
//       Reply with your number or message in WhatsApp (button link wa.me/8148939892)
//       Best,
//       Brandgea
//       +91-8148939892
//     `,
//   },
//   "24hr": {
//     subject: (heading) => `We can start production steps — a quick call?`,
//     body: (firstName, heading) => `
//       Hi ${firstName},
//       We can move your ${heading} from quote to action—sourcing, sampling, and delivery handled by our team. No vendor chase, no back-and-forth.
//       Send your phone/WhatsApp + best time, and we’ll do a 5-min handover.
//       Or ping us @ WhatsApp (button link wa.me/8148939892)
//       Best,
//       Brandgea
//       +91-8148939892
//     `,
//   },
//   "48hr": {
//     subject: () => `Still up for this? We can take it end-to-end.`,
//     body: (firstName, heading) => `
//       Hi ${firstName},
//       Quick check-in on your ${heading}. If you’d like us to proceed, share your phone/WhatsApp and a good time to call. We’ll handle everything end-to-end.
//       If you’re not ready, we can pause your quote and pick it up later—just say the word.
//       WhatsApp (button link wa.me/8148939892)
//       Thanks,
//       Brandgea
//       +91-8148939892
//     `,
//   },
// };

const emailTemplates = {
  "1min": {
    subject: (heading) => `Your ${heading} idea — can we call?`,
    body: (firstName, heading) => `
      <p>Hi ${firstName},</p>
      <p>Thanks for trying <strong>Brandgea’s AI Quote</strong> for your <strong>${heading}</strong>.  
      We handle everything end-to-end — materials, trims, printing, sampling, and delivery — so you never juggle vendors again.</p>
      <p>Share your phone / WhatsApp and a good time to reach you — we’ll hop on a quick 5-minute call and take it forward.</p>
    `,
  },
  "24hr": {
    subject: (heading) =>
      `We can start your ${heading} — quick 5-min handover?`,
    body: (firstName, heading) => `
      <p>Hi ${firstName},</p>
      <p>We’re ready to move your <strong>${heading}</strong> from quote → production: sourcing, sampling, and delivery handled end-to-end by our team.</p>
      <p>Just send your phone / WhatsApp number and your preferred time — we’ll take care of the rest.</p>
    `,
  },
  "48hr": {
    subject: () => `Still up for this? We can take it end-to-end.`,
    body: (firstName, heading) => `
      <p>Hi ${firstName},</p>
      <p>Checking in on your <strong>${heading}</strong>.  
      If you’d like us to proceed, share your phone / WhatsApp and a good time to call.  
      We’ll handle everything end-to-end.</p>
      <p>If you’re not ready yet, no worries — we can pause your quote and pick it up later.</p>
    `,
  },
};

async function sendQueuedEmails() {
  try {
    while (true) {
      // Find the oldest queued email that is not permanently failed
      const queuedEmail = await QueuedEmail.findOne({
        failedToSend: false,
      }).sort({ createdAt: 1 });
      if (!queuedEmail) {
        console.log("No queued emails to send. Exiting sender function.");
        break;
      }

      // Get user info
      const user = await User.findById(queuedEmail.userId);
      if (!user) {
        console.error(
          `User not found for queued email ${queuedEmail._id}, deleting queue item.`
        );
        await QueuedEmail.deleteOne({ _id: queuedEmail._id });
        continue;
      }

      // Find chat by chat_id inside user's chat array
      const chat = user.chat.find(
        (c) => c._id.toString() === queuedEmail.relatedChatId.toString()
      );

      const heading = chat?.heading || "product";

      const firstName = user.name || "there";
      const reminderLabel = queuedEmail.reminderLabel;

      const template = emailTemplates[reminderLabel];
      if (!template) {
        console.error(
          `No email template found for reminder label ${reminderLabel}`
        );
        await QueuedEmail.deleteOne({ _id: queuedEmail._id });
        continue;
      }

      const subject = template.subject(heading);
      const htmlBody = wrapHtml(
        "Let's talk — Brandgea",
        template.body(firstName, heading)
      );
      const textBody = `Hi ${firstName},\n\n${template
        .body(firstName, heading)
        .replace(/<[^>]+>/g, "")
        .trim()}\n\n— Brandgea Team\n+91 81489 39892`;

      const mailOptions = {
        from: `"Brandgea" <${process.env.GMAIL_USER}>`,
        to: user.email,
        subject,
        html: htmlBody,
        text: textBody,
      };

      // const mailOptions = {
      //   from: `"Brandgea" <${process.env.GMAIL_USER}>`,
      //   to: user.email,
      //   subject:
      //     typeof template.subject === "function"
      //       ? template.subject(heading)
      //       : template.subject,
      //   text:
      //     typeof template.body === "function"
      //       ? template.body(firstName, heading)
      //       : template.body,
      // };

      try {
        await transporter.sendMail(mailOptions);
        console.log(
          `Sent ${reminderLabel} email to user ${user._id} (${user.email})`
        );
        await QueuedEmail.deleteOne({ _id: queuedEmail._id });
      } catch (err) {
        console.error(
          `Failed to send email ${queuedEmail._id}: ${err.message}`
        );

        queuedEmail.retryCount += 1;
        if (queuedEmail.retryCount >= queuedEmail.maxRetries) {
          queuedEmail.failedToSend = true;
          console.error(
            `Email ${queuedEmail._id} marked as permanently failed after ${queuedEmail.retryCount} retries.`
          );
        }
        await queuedEmail.save();
      }
    }
  } catch (err) {
    console.error("Error in sending queued emails:", err);
  }
}

export { sendQueuedEmails };
