import {ReminderInterval} from "../models/email.log.remainder.model.js";

/**
 * Create a new reminder interval with flexible time units
 * Expected JSON body:
 * {
 *   label: "interval1",
 *   intervalValue: 1,
 *   intervalUnit: "HR",        // one of ['S', 'M', 'HR']
 *   leewayHours: 5,            // optional, defaults to 5
 *   active: true,              // optional, defaults to true
 *   templateId: "template1"    // optional
 * }
 */
async function createReminderInterval(req, res) {
  try {
    const {
      label,
      intervalValue,
      intervalUnit,
      leewayHours = 5,
      active = true,
      templateId = null,
    } = req.body;

    if (!label || !intervalValue || !intervalUnit) {
      return res.status(400).json({
        error: 'label, intervalValue, and intervalUnit are required',
      });
    }

    if (!['S', 'M', 'HR'].includes(intervalUnit)) {
      return res.status(400).json({
        error: 'intervalUnit must be one of S (seconds), M (minutes), HR (hours)',
      });
    }

    // Check uniqueness of label
    const existing = await ReminderInterval.findOne({ label });
    if (existing) {
      return res.status(409).json({
        error: 'A reminder interval with this label already exists',
      });
    }

    const newInterval = new ReminderInterval({
      label,
      intervalValue,
      intervalUnit,
      leewayHours,
      active,
      templateId,
    });

    await newInterval.save();

    return res.status(201).json({
      message: 'Reminder interval created',
      interval: newInterval,
    });
  } catch (err) {
    console.error('Error creating reminder interval:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export { createReminderInterval };
