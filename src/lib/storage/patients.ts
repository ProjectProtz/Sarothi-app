/**
 * Patient CRUD helpers.
 *
 * Usage (from any Task B/C/D/E/F component):
 *   import { getPatient, updatePatient } from '@/lib/storage/patients';
 */

import { db, type Patient } from './db';

/** Get a patient by ID. Returns undefined if not found. */
export async function getPatient(id: string): Promise<Patient | undefined> {
  return db.patients.get(id);
}

/** Get all patients (for multi-patient support in future). */
export async function getAllPatients(): Promise<Patient[]> {
  return db.patients.toArray();
}

/**
 * Get the current active patient.
 * For the prototype, there is a single patient; this returns the first one.
 * Task E (caregiver dashboard) can extend this for multi-patient linking.
 */
export async function getActivePatient(): Promise<Patient | undefined> {
  return db.patients.toCollection().first();
}

/** Create or replace a patient record. */
export async function putPatient(patient: Patient): Promise<void> {
  await db.patients.put(patient);
}

/** Update specific fields on an existing patient (e.g. preferred_language). */
export async function updatePatient(
  id: string,
  changes: Partial<Omit<Patient, 'id'>>
): Promise<void> {
  await db.patients.update(id, changes);
}

/** Delete a patient by ID. */
export async function deletePatient(id: string): Promise<void> {
  await db.patients.delete(id);
}
