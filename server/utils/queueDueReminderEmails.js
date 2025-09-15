import { MailLogger,QueuedEmail,ReminderInterval } from "../models/email.log.remainder.model.js";
import { sendQueuedEmails } from './sendQueuedEmails.js';  // Adjust relative path correctly

const logger = console; 

function getDurationMs(value, unit) {
  switch (unit) {
    case 'S': return value * 1000;
    case 'M': return value * 60 * 1000;
    case 'HR': return value * 60 * 60 * 1000;
    default: throw new Error('Invalid interval unit');
  }
}

async function queueDueReminderEmails() {
  try {
    const now = Date.now();
    const intervals = await ReminderInterval.find({ active: true }).lean();

    let maxWindowMs = 0;
    for (const interval of intervals) {
      const intervalMs = getDurationMs(interval.intervalValue, interval.intervalUnit);
      const leewayMs = interval.leewayHours * 60 * 60 * 1000;
      const windowMs = intervalMs + leewayMs;
      if (windowMs > maxWindowMs) maxWindowMs = windowMs;
    }

    const logs = await MailLogger.find({}).sort({ createdAt: -1 }).lean();

    for (const log of logs) {
      if (log.stopFurtherEmails) {
        logger.info(`Skipping user ${log.userId} – opted out`);
        continue;
      }

      const created = new Date(log.createdAt).getTime();
      let allIntervalsPassed = true;

      for (const interval of intervals) {
        try {
          const intervalMs = getDurationMs(interval.intervalValue, interval.intervalUnit);
          const leewayMs = interval.leewayHours * 60 * 60 * 1000;

          const dueStart = created + intervalMs;
          const dueEnd = dueStart + leewayMs;

          const alreadySent = log.reminderSent && log.reminderSent[interval.label];

          if (!alreadySent && now >= dueStart && now <= dueEnd) {
            await QueuedEmail.create({
              userId: log.userId,
              reminderLabel: interval.label,
              mailLoggerId: log._id,
              relatedChatId: log.relatedChatId,
            });

            await MailLogger.updateOne(
              { _id: log._id },
              { [`reminderSent.${interval.label}`]: true }
            );

            logger.info(`Queued reminder [${interval.label}] for user ${log.userId} at chat ${log.relatedChatId}`);
            allIntervalsPassed = false;
          } else if (!alreadySent && now < dueEnd) {
            allIntervalsPassed = false;
          } else {
            logger.info(`Reminder [${interval.label}] already sent for user ${log.userId} or out of window`);
          }
        } catch (err) {
          logger.error(`Error processing log ${log._id} for interval ${interval.label} — ${err.message}`);
        }
      }

      if (allIntervalsPassed && (now - created > maxWindowMs)) {
        logger.info(`All intervals passed and log ${log._id} is older than max interval window; stopping processing.`);
        break;
      }
    }

    // After queueing all due reminder emails, send them
    await sendQueuedEmails();

  } catch (err) {
    logger.error('Failed to queue due reminder emails:', err);
  }
}

export { queueDueReminderEmails };