/**
 * Session CRUD helpers.
 *
 * Sessions represent completed game engagements. Task B writes sessions;
 * Task E reads them for the caregiver dashboard.
 *
 * Usage: import { addSession, getSessionsForPatient } from '@/lib/storage/sessions';
 */

import { db, type Session } from './db';

/** Add a new session record after a game completes. */
export async function addSession(session: Session): Promise<void> {
  await db.sessions.put(session);
}

/** Get all sessions for a patient, newest first. */
export async function getSessionsForPatient(
  patientId: string,
  limit = 50
): Promise<Session[]> {
  return db.sessions
    .where('patient_id')
    .equals(patientId)
    .reverse()
    .limit(limit)
    .sortBy('timestamp');
}

/** Get sessions for a patient in the last N days (for dashboard trend). */
export async function getRecentSessionsForPatient(
  patientId: string,
  days = 7
): Promise<Session[]> {
  const since = Date.now() - days * 24 * 60 * 60 * 1000;
  return db.sessions
    .where('[patient_id+timestamp]')
    .between([patientId, since], [patientId, Infinity])
    .toArray()
    .catch(() =>
      // Fallback if compound index not set up yet
      db.sessions
        .where('patient_id')
        .equals(patientId)
        .filter((s) => s.timestamp >= since)
        .toArray()
    );
}

/** Get all sessions not yet synced to the cloud (for FR-19 background sync). */
export async function getUnsyncedSessions(): Promise<Session[]> {
  return db.sessions.where('synced').equals(0).toArray(); // Dexie stores booleans as 0/1
}

/** Mark a session as synced (called by Task F after successful upload). */
export async function markSessionSynced(id: string): Promise<void> {
  await db.sessions.update(id, { synced: true });
}

/** Get a single session by ID. */
export async function getSession(id: string): Promise<Session | undefined> {
  return db.sessions.get(id);
}

/** Delete a session by ID. */
export async function deleteSession(id: string): Promise<void> {
  await db.sessions.delete(id);
}
