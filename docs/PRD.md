# Sakhi — AI-Based Cognitive Gaming & Memory Assistance Platform
**Prototype Build Plan — Smart India Hackathon 2026 — Problem Statement 26003**

| Field | Detail |
|---|---|
| Problem Statement ID | 26003 |
| Theme | MedTech / BioTech / HealthTech |
| Target Event | Smart India Hackathon (SIH) 2026 |
| Immediate Goal | Working prototype for internal college assessment / SIH shortlisting round |
| Build Tooling | Google Antigravity (agent-first IDE) + Gemini / Claude APIs |
| Document Status | Draft v0.1 |

---

## 1. Executive Summary

This is a prototype-scoped build (1–2 weeks, student team) of a full SIH problem statement asking for a comprehensive, multilingual, offline-capable elderly-care ecosystem for dementia patients in India's North Eastern Region (NER). The prototype must be demo-ready and architected so deferred features can be added later without a rebuild.

Working name: **Sakhi** ("friend/companion" in several NER-adjacent languages) — replace freely.

**Hard constraint:** This is a cognitive engagement and caregiver-support tool, **not a diagnostic or clinical device**. Never claim it diagnoses dementia, in code, UI copy, or pitch material.

---

## 2. Reference Problem Statement (SIH 2026 — PS 26003)

**Title:** AI-Based Cognitive Gaming and Memory Assistance Platform for Elderly Dementia Patients in North Eastern Region (NER)

**Core ask:** Interactive, adaptive, multilingual, offline-capable cognitive games + reminders + caregiver dashboard for elderly dementia patients in NER, addressing low-connectivity rural geography and linguistic/cultural diversity.

---

## 3. Background & Problem Context

- NER has a rising elderly dementia/memory-loss population and very limited access to specialist neurological/cognitive care due to geography and infrastructure.
- Patients face memory decline, confusion, anxiety, social isolation. Caregivers struggle with continuous monitoring.
- No affordable, culturally-inclusive, NER-language-first digital therapeutic option currently exists.
- **AI angle:** (1) multilingual speech (STT/TTS) for low-resource Indic languages is now usable off-the-shelf; (2) LLM-based scoring of structured cognitive tasks (memory recall, picture description) with plain-language explanations — the same idea used in recent research applying LLMs to automated picture-description dementia screening — is borrowed here as the engine behind adaptive difficulty and progress tracking, **not** as a diagnostic tool.

---

## 4. Goals & Success Criteria

**Full vision:**
1. Improve cognitive engagement via daily adaptive games.
2. Reduce caregiver burden via reminders, dashboards, alerts.
3. Work for NER's linguistic diversity and low connectivity.
4. Be usable unassisted by an elderly, non-technical person.

**Prototype goals (this build cycle):**
- End-to-end adaptive game loop with voice guidance, playable on phone/tablet, demoable in <5 min.
- Caregiver dashboard: session history, scores, one live alert.
- At least one non-English regional language path (UI + voice), demonstrably working.
- A real (even if simplified) offline story — not just a claim.

**Demo success metrics:**
| Metric | Target |
|---|---|
| End-to-end demo runs without crash | 3/3 dry runs |
| Time to complete one game session | < 3 minutes |
| Languages working (UI + voice) | ≥ 2 (English + 1 regional) |
| Caregiver dashboard reflects session | < 10 sec latency |

---

## 5. Prototype Scope (MVP) — Priority Map

| Requirement (from PS 26003) | Prototype treatment | Priority |
|---|---|---|
| Adaptive gaming & memory training modules | 3 game types, real adaptive-difficulty logic | **P0** |
| Voice-enabled multilingual interface | TTS/STT for 2 languages | **P0** |
| Cognitive performance tracking & analytics dashboard | Charts: sessions, accuracy trend, streak | **P0** |
| Caregiver monitoring & alert system | 1 caregiver view + 1 rule-based alert | **P0** |
| Reminders (medicine, hydration, activity, appointments) | Local notification mock, 2 types | P1 |
| Offline synchronisation | Local-first storage + manual "sync now" | P1 |
| Secure patient data management | Basic auth + encryption design; not hardened | P1 |
| Culturally familiar NER themes/visuals | 1 theme skin for 1 game | P2 |
| Full NER language coverage (all languages) | Out of scope; architecture supports adding locales | P3 / post-hackathon |
| Clinical-grade diagnosis | **Explicitly out of scope** | Out of scope |

**Out of scope for this build:** clinical validation/hospital partnership, full NER language set, production-grade security/compliance hardening, native app-store deployment (PWA is sufficient).

---

## 6. Target Users & Personas

- **Patient — Ratan Bora, 71**, retired teacher, early-to-moderate memory concerns, speaks Assamese, comfortable with phone calls not apps. Needs: large text, voice guidance, no login friction, familiar imagery, short sessions.
- **Caregiver — Mousumi, 42**, Ratan's daughter, works full time, lives nearby. Needs: quick daily glance at engagement + reminder compliance + alert if something's off.
- **Health worker (road-map, not built now)** — ASHA/community volunteer monitoring multiple patients; data model shouldn't preclude this later.

---

## 7. Functional Requirements

### 7.1 Patient-facing app
| ID | Requirement |
|---|---|
| FR-1 | Home screen: 3 large icons — Play, Reminders, My Progress |
| FR-2 | Game 1 — Memory Match (pattern/object recognition, card-flip pairs, culturally familiar images) |
| FR-3 | Game 2 — Daily Routine Recall (sequence-ordering: wake, eat, medicine, walk) |
| FR-4 | Game 3 — Attention/Focus task (spot-the-difference / odd-one-out, loosely timed) |
| FR-5 | Adaptive difficulty engine — adjusts grid size/time/distractors on rolling accuracy |
| FR-6 | Voice guidance auto-reads instructions on every screen (selected language) |
| FR-7 | Voice input (STT) for yes/no and item naming |
| FR-8 | Language selector (≥2 languages), persisted, affects UI text + TTS |
| FR-9 | Reminder screen — next medicine/hydration reminder + big "Done" button |
| FR-10 | Session summary — emoji-based feedback, not numeric score, to the patient |

### 7.2 Caregiver-facing app
| ID | Requirement |
|---|---|
| FR-11 | Caregiver login, linked to one patient (demo: hardcoded link) |
| FR-12 | Activity feed — sessions, time, accuracy trend (last 7 days) |
| FR-13 | Reminder compliance view — Taken/Missed log |
| FR-14 | Alert banner — rule-based, e.g. "No activity for 2 days" or sharp accuracy drop |
| FR-15 | (Stretch) Export/share a summary — PDF or text |

### 7.3 AI / adaptive logic
| ID | Requirement |
|---|---|
| FR-16 | Adaptive difficulty — deterministic rules first (accuracy thresholds); model-assisted tuning is stretch |
| FR-17 | LLM-based scoring for the open-ended recall task: score + short natural-language rationale, inspired by structured LLM cognitive-assessment approaches |
| FR-18 | Multilingual TTS/STT pipeline (Gemini API or similar) |
| FR-19 | Local-first data write, background sync when connectivity returns |

---

## 8. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Usability | ≥18pt-equivalent text, high contrast, tap targets ≥48px, ≤2 taps to start a game |
| Accessibility | Full voice narration path — completable without reading |
| Performance | Game screens interactive within 2s on mid-range Android |
| Offline | Core game loop works with zero connectivity; sync is opportunistic |
| Localisation | All UI strings externalised — no hardcoded text |
| Privacy | No patient data leaves device without explicit sync; cloud storage encrypted at rest (design-level) |
| Reliability | Must survive airplane mode mid-session |

---

## 9. Proposed Architecture

**Shape:**
- Client: responsive installable PWA (avoids app-store friction).
- Local data layer: IndexedDB — single source of truth on-device.
- Sync layer: lightweight background job, pushes queued events when online.
- Backend: small API (sessions, reminders, caregiver linking, alerts) + managed DB.
- AI services: (a) STT/TTS for regional languages, (b) LLM call for scoring the open-ended recall task + generating caregiver-facing plain-language note.

**Suggested stack:**
| Layer | Choice | Why |
|---|---|---|
| Frontend | React + Vite, installable PWA | Fast iteration, works well with Antigravity's browser-testing loop |
| State/Offline | IndexedDB via Dexie.js | Reliable offline-first pattern |
| Backend/DB | Firebase (Auth + Firestore + Cloud Functions) or Supabase | Zero-infra, real-time sync out of the box |
| Speech STT/TTS | Gemini API speech, Web Speech API fallback | Multilingual without training custom models |
| Adaptive scoring | LLM API call (structured prompt → score + rationale) | Mirrors picture-description-scoring research approach |
| Build environment | Google Antigravity (Editor View + Manager Surface) | Agent delegates scaffolding, wiring, browser verification |
| Hosting | Firebase Hosting / Vercel | One-command deploy for demo day |

**Data model (minimum viable):**
- Patient: id, name, preferred language, theme preference
- Caregiver: id, linked patient id, contact preference
- Session: id, patient id, game type, timestamp, accuracy, difficulty level, synced flag
- Reminder: id, patient id, type, scheduled time, status
- Alert: id, patient id, rule triggered, timestamp, acknowledged flag

---

## 10. Agent Task Breakdown (for Antigravity Manager Surface)

These map directly to FR IDs above and are designed to run **in parallel** as separate agent tasks (A–D concurrent; E–F integrate after):

- **Task A** — Scaffold PWA shell, routing, language selector, IndexedDB wrapper (FR-1, FR-8, NFR-Localisation, NFR-Offline)
- **Task B** — Build the three games + adaptive-difficulty rule engine (FR-2–FR-5, FR-16)
- **Task C** — Wire TTS/STT for two languages + voice-guided navigation (FR-6, FR-7, FR-18)
- **Task D** — Reminders module with mock local notifications (FR-9)
- **Task E** — Caregiver dashboard, activity feed, one rule-based alert (FR-11–FR-14)
- **Task F** — Backend sync (Firebase/Supabase) + LLM scoring call for recall task (FR-17, FR-19)

For each task, give the agent: the relevant FR IDs, the data model (Section 9), and an explicit instruction to verify by opening the app in the browser and clicking through the flow before reporting back. Review every plan and diff before merging.

---

## 11. Key Screens / User Flow

**Patient:** Home (Play / Reminders / My Progress) → select game → voice-narrated instructions → play (difficulty auto-adjusts) → emoji summary → back to Home. Reminder path: Home → Reminders → big "I took it" / "Remind me later".

**Caregiver:** Login → Dashboard (activity trend + last session + reminder compliance) → Alerts banner if triggered → tap into a session for detail. Single screen for demo, no deep navigation.

---

## 12. Data Privacy & Security (Prototype-Level)

- No real patient data in the demo — fictional/team-member seed data only.
- Authenticated cloud sync requests; no open/public database rules in the demo build.
- Roadmap note: production version needs DPDP Act 2023 alignment for health-adjacent personal data — not solved in prototype.
- AI-generated scores are "engagement/progress indicators," never framed as clinical findings.

---

## 13. Prototype Build Timeline

| Phase | Duration | Deliverable |
|---|---|---|
| Day 1 | Setup | Antigravity project scaffolded, PRD loaded as spec, backend project created |
| Day 2–3 | Core loop | One game fully playable with adaptive difficulty |
| Day 4–5 | Multilingual + voice | TTS/STT working for 2 languages |
| Day 6–7 | Remaining games + reminders | All 3 games playable, reminders working |
| Day 8–9 | Caregiver dashboard + sync | Dashboard live, sync + alert working |
| Day 10 | Polish + rehearsal | Accessibility pass, offline test, demo rehearsed 3x |

---

## 14. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Multilingual voice quality inconsistent for low-resource NER languages | Demo with 1–2 well-supported languages; document roadmap for rest |
| Offline sync breaks under time pressure | Build local-first storage first; cloud sync is enhancement, not dependency |
| Team over-scopes | Strict adherence to P0 list (Section 5); cut P1/P2 first if behind |
| Judges read AI scoring as diagnostic | Explicit framing: "engagement platform, not a diagnostic device" |
| Agent-generated code has unreviewed bugs | Mandatory human review of every Antigravity task before merge |

---

## 15. Team & Roles

| Role | Owns |
|---|---|
| Team Lead / PM | Scope, demo script, this PRD |
| Frontend / Game logic | Task A, B |
| Voice / Multilingual | Task C |
| Backend / Sync | Task F |
| Dashboard / Caregiver UX | Task E |
| Design / Accessibility | Visual polish, elderly-usability pass |
