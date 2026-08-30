/**
 * Alert CRUD helpers. Task E (caregiver dashboard) will use these.
 * Alerts are rule-triggered notifications — NOT clinical diagnoses.
 *
 * Usage: import { addAlert, getUnacknowledgedAlerts } from '@/lib/storage/alerts';
 */

import { db, type Alert } from './db';

/** Create a new alert (called by the rule engine — Task E). */
export async function addAlert(alert: Alert): Promise<void> {
  await db.alerts.put(alert);
}

/** Get all alerts for a patient, newest first. */
export async function getAlertsForPatient(patientId: string): Promise<Alert[]> {
  return db.alerts
    .where('patient_id')
    .equals(patientId)
    .reverse()
    .sortBy('timestamp');
}

/** Get all unacknowledged alerts for a patient (shown as banner on dashboard). */
export async function getUnacknowledgedAlerts(patientId: string): Promise<Alert[]> {
  return db.alerts
    .where('patient_id')
    .equals(patientId)
    .filter((a) => !a.acknowledged)
    .toArray();
}

/** Acknowledge an alert (caregiver tapped "Dismiss"). */
export async function acknowledgeAlert(id: string): Promise<void> {
  await db.alerts.update(id, { acknowledged: true });
}

/** Delete an alert by ID. */
export async function deleteAlert(id: string): Promise<void> {
  await db.alerts.delete(id);
}
