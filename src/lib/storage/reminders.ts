/**
 * Reminder CRUD helpers. Task D (reminders module) will use these.
 *
 * Usage: import { addReminder, getPendingReminders } from '@/lib/storage/reminders';
 */

import { db, type Reminder } from './db';

/** Create a new reminder. */
export async function addReminder(reminder: Reminder): Promise<void> {
  await db.reminders.put(reminder);
}

/** Get all reminders for a patient. */
export async function getRemindersForPatient(patientId: string): Promise<Reminder[]> {
  return db.reminders
    .where('patient_id')
    .equals(patientId)
    .sortBy('scheduled_time');
}

/** Get upcoming pending reminders for a patient (scheduled_time > now). */
export async function getPendingReminders(patientId: string): Promise<Reminder[]> {
  const now = Date.now();
  return db.reminders
    .where('patient_id')
    .equals(patientId)
    .filter((r) => r.status === 'pending' && r.scheduled_time >= now)
    .sortBy('scheduled_time');
}

/** Update the status of a reminder (e.g. mark as 'done' or 'snoozed'). */
export async function updateReminderStatus(
  id: string,
  status: 'pending' | 'done' | 'snoozed' | 'missed'
): Promise<void> {
  await db.reminders.update(id, { status });
}

/** Update any fields on a reminder. */
export async function updateReminder(
  id: string,
  changes: Partial<Omit<Reminder, 'id'>>
): Promise<void> {
  await db.reminders.update(id, changes);
}

/** Delete a reminder by ID. */
export async function deleteReminder(id: string): Promise<void> {
  await db.reminders.delete(id);
}

/** Reset all of today's reminders back to 'pending' state (for demo/testing). */
export async function resetTodayReminders(patientId?: string): Promise<void> {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endOfToday = startOfToday + 24 * 60 * 60 * 1000;

  if (patientId) {
    await db.reminders
      .where('patient_id')
      .equals(patientId)
      .filter((r) => r.scheduled_time >= startOfToday && r.scheduled_time < endOfToday)
      .modify({ status: 'pending' });
  } else {
    await db.reminders
      .filter((r) => r.scheduled_time >= startOfToday && r.scheduled_time < endOfToday)
      .modify({ status: 'pending' });
  }
}
