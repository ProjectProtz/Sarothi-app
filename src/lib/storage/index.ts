/**
 * Barrel export for the storage module.
 *
 * HOW TO USE (from Tasks B/C/D/E/F):
 *   import { addSession, getSessionsForPatient } from '@/lib/storage';
 *   import type { Session, Patient } from '@/lib/storage';
 */

// Types
export type { Patient, Caregiver, Session, Reminder, Alert } from './db';

// Patient
export {
  getPatient,
  getAllPatients,
  getActivePatient,
  putPatient,
  updatePatient,
  deletePatient,
} from './patients';

// Caregiver
export {
  getCaregiver,
  getCaregiverForPatient,
  getAllCaregivers,
  putCaregiver,
  updateCaregiver,
  deleteCaregiver,
} from './caregivers';

// Session
export {
  addSession,
  getSessionsForPatient,
  getRecentSessionsForPatient,
  getUnsyncedSessions,
  markSessionSynced,
  getSession,
  deleteSession,
} from './sessions';

// Reminder
export {
  addReminder,
  getRemindersForPatient,
  getPendingReminders,
  updateReminderStatus,
  updateReminder,
  deleteReminder,
} from './reminders';

// Alert
export {
  addAlert,
  getAlertsForPatient,
  getUnacknowledgedAlerts,
  acknowledgeAlert,
  deleteAlert,
} from './alerts';

// Seed
export { seedDatabase } from './seed';
