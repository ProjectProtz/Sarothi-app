/**
 * Caregiver CRUD helpers.
 *
 * Usage: import { getCaregiverForPatient } from '@/lib/storage/caregivers';
 */

import { db, type Caregiver } from './db';

/** Get a caregiver by their own ID. */
export async function getCaregiver(id: string): Promise<Caregiver | undefined> {
  return db.caregivers.get(id);
}

/** Get the caregiver linked to a given patient ID. */
export async function getCaregiverForPatient(
  patientId: string
): Promise<Caregiver | undefined> {
  return db.caregivers.where('linked_patient_id').equals(patientId).first();
}

/** Get all caregivers. */
export async function getAllCaregivers(): Promise<Caregiver[]> {
  return db.caregivers.toArray();
}

/** Create or replace a caregiver record. */
export async function putCaregiver(caregiver: Caregiver): Promise<void> {
  await db.caregivers.put(caregiver);
}

/** Update specific fields on an existing caregiver (e.g. contact_preference). */
export async function updateCaregiver(
  id: string,
  changes: Partial<Omit<Caregiver, 'id'>>
): Promise<void> {
  await db.caregivers.update(id, changes);
}

/** Delete a caregiver by ID. */
export async function deleteCaregiver(id: string): Promise<void> {
  await db.caregivers.delete(id);
}
