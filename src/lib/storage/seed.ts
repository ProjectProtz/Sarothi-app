/**
 * Database seeding — fictional demo data only.
 *
 * Per AGENTS.md: NO real patient data. All records here are clearly fictional,
 * inspired by the PRD Section 6 personas. This seed runs once on first app load.
 *
 * Personas:
 *   - Ratan Bora, 71 — fictional retired teacher, speaks Assamese
 *   - Mousumi — fictional caregiver, Ratan's daughter
 */

import { db } from './db';
import type { Patient, Caregiver } from './db';

const SEED_VERSION_KEY = 'sakhi_seed_v1';

/** Fictional patient record — Ratan Bora (PRD Section 6 persona). */
const SEED_PATIENT: Patient = {
  id: 'patient_ratan_bora_demo',
  name: 'Ratan Bora',
  preferred_language: 'as', // Assamese — per persona
  theme_preference: 'default',
  created_at: new Date('2026-01-10T08:00:00Z').getTime(),
};

/** Fictional caregiver record — Mousumi (PRD Section 6 persona). */
const SEED_CAREGIVER: Caregiver = {
  id: 'caregiver_mousumi_demo',
  name: 'Mousumi Bora',
  linked_patient_id: 'patient_ratan_bora_demo',
  contact_preference: 'app',
  created_at: new Date('2026-01-10T08:05:00Z').getTime(),
};

/**
 * Seed the database with fictional demo records.
 * Safe to call on every app start — only inserts if records don't exist.
 * Uses a version flag to avoid re-seeding after data has been modified.
 */
export async function seedDatabase(): Promise<void> {
  const alreadySeeded = localStorage.getItem(SEED_VERSION_KEY);
  if (alreadySeeded) return;

  try {
    await db.transaction('rw', db.patients, db.caregivers, async () => {
      // putIfNotExists pattern — don't overwrite user changes
      const existingPatient = await db.patients.get(SEED_PATIENT.id);
      if (!existingPatient) {
        await db.patients.put(SEED_PATIENT);
      }

      const existingCaregiver = await db.caregivers.get(SEED_CAREGIVER.id);
      if (!existingCaregiver) {
        await db.caregivers.put(SEED_CAREGIVER);
      }
    });

    localStorage.setItem(SEED_VERSION_KEY, 'done');
    console.info('[Sakhi] Database seeded with fictional demo records.');
  } catch (err) {
    // Non-fatal — app works without seed data, just log the error
    console.warn('[Sakhi] Seed failed (non-fatal):', err);
  }
}
