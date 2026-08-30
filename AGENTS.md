# AGENTS.md — Standing Instructions for Sakhi Project

This file is read by every agent spawned in this workspace before it starts work.
Full spec: see `docs/PRD.md`.

## What we're building
A prototype of an AI-based cognitive gaming and memory-assistance platform for elderly
dementia patients (SIH 2026, Problem Statement 26003). Timeline: ~10 days to a demoable build.

## Non-negotiables
- This is an **engagement and caregiver-support tool, not a diagnostic device**. Never write
  UI copy, comments, or docs that imply the app diagnoses or clinically assesses dementia.
  Frame all AI-generated scores as "engagement/progress indicators."
- No real patient data anywhere in the repo — seed data only, clearly fictional.
- Every user-facing string must be externalised (i18n-ready) — no hardcoded UI text, even
  in early scaffolding. We need ≥2 languages working for the demo.
- Elderly-accessibility floor: text sized for readability, tap targets ≥48px, high contrast,
  every screen has a voice-narrated equivalent of its instructions.
- The core game loop must work with zero network connectivity. Cloud sync is an enhancement,
  never a hard dependency for gameplay.

## Tech stack (do not deviate without asking)
- Frontend: React + Vite, built as an installable PWA
- Offline storage: IndexedDB via Dexie.js
- Backend: Firebase (Auth + Firestore + Cloud Functions) — or Supabase if the team prefers
- Speech: Gemini API speech capabilities, Web Speech API as fallback
- Adaptive scoring: LLM API call with a structured prompt returning a score + short rationale

## Priority order if time runs short
P0 (must work for the demo): 3 adaptive games, 2-language voice interface, caregiver
dashboard with real-time activity feed, one working rule-based alert.
P1 (build if time allows): reminders module, offline sync, basic auth hardening.
P2/P3: cultural theme skins, additional languages — do not start these before P0 is solid.

## Verification requirement
Before reporting a task as done, actually open the app in the browser and click through the
relevant flow end to end. A task is not complete until it's been exercised, not just compiled.

## Task breakdown reference
See PRD.md Section 10 for the six parallelizable task definitions (A–F) and their FR IDs.
