/**
 * Sakhi — Dexie.js IndexedDB schema
 *
 * Data model per PRD.md Section 9.3. All types here are the single source
 * of truth for the database shape. Tasks B/C/D/E/F must import from this
 * file rather than defining their own types.
 *
 * IMPORTANT: This is a cognitive engagement tool, NOT a diagnostic device.
 * Do not add fields that imply clinical assessment (e.g. "diagnosis", "score_clinical").
 * Use "engagement" and "accuracy" framing for all metrics.
 */

import Dexie, { type EntityTable } from 'dexie';

// --- Entity types ------------------------------------------------------------

/**
 * Patient — the person engaging with the app.
 * Note: "preferred_language" is a locale code (e.g. 'en', 'as').
 * Note: "theme_preference" is for future cultural theme skins (P2).
 */
export interface Patient {
  id: string;
  name: string;
  preferred_language: string;
  theme_preference: string;
  created_at: number; // Unix ms timestamp
}

/**
 * Caregiver — linked to a patient; monitors engagement via the dashboard.
 * Note: "contact_preference" is 'sms' | 'app' | 'none' — channel for alerts.
 */
export interface Caregiver {
  id: string;
  name: string;
  linked_patient_id: string;
  contact_preference: string;
  created_at: number;
}

/**
 * Session — one completed game session.
 * Note: "accuracy" is 0–1 float representing engagement quality (not a clinical score).
 * Note: "synced" is false until cloud sync completes (FR-19 offline-first).
 */
export interface Session {
  id: string;
  patient_id: string;
  game_type: string; // 'memory_match' | 'routine_recall' | 'attention_focus'
  timestamp: number; // Unix ms
  accuracy: number; // 0.0–1.0 — engagement accuracy indicator, not a clinical finding
  difficulty_level: number; // 1–5 integer; auto-adjusted by adaptive engine (FR-5)
  duration_ms: number; // Session length in milliseconds
  synced: boolean; // false = queued for cloud upload
}

/**
 * Reminder — a scheduled medicine, hydration, or activity prompt (FR-9).
 * Note: "status" is 'pending' | 'done' | 'snoozed' | 'missed'
 */
export interface Reminder {
  id: string;
  patient_id: string;
  type: string; // 'medicine' | 'hydration' | 'activity' | 'appointment'
  label: string; // human-readable description (stored as locale-neutral label key or plain text)
  scheduled_time: number; // Unix ms
  status: string;
  created_at: number;
}

/**
 * Alert — a rule-triggered caregiver notification (FR-14).
 * Note: "rule_triggered" is a string key identifying which rule fired,
 * e.g. 'no_activity_48h' or 'accuracy_drop_20pct'.
 */
export interface Alert {
  id: string;
  patient_id: string;
  rule_triggered: string;
  timestamp: number;
  acknowledged: boolean;
  detail: string; // Plain-language description for the caregiver
}

// --- Dexie database class ----------------------------------------------------

class SakhiDatabase extends Dexie {
  patients!: EntityTable<Patient, 'id'>;
  caregivers!: EntityTable<Caregiver, 'id'>;
  sessions!: EntityTable<Session, 'id'>;
  reminders!: EntityTable<Reminder, 'id'>;
  alerts!: EntityTable<Alert, 'id'>;

  constructor() {
    super('sakhi');

    this.version(1).stores({
      // Primary key first, then indexed fields. Non-indexed fields don't appear here.
      patients: 'id, preferred_language',
      caregivers: 'id, linked_patient_id',
      sessions: 'id, patient_id, game_type, timestamp, synced',
      reminders: 'id, patient_id, type, scheduled_time, status',
      alerts: 'id, patient_id, rule_triggered, timestamp, acknowledged',
    });
  }
}

/** Singleton Dexie instance — import this from storage helpers, not directly in components. */
export const db = new SakhiDatabase();
