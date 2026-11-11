# Advanced IT Operations Feature Suite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and integrate 7 enterprise IT operations subsystems (Email/Phishing Inspector, EDR Fleet Console, Outbreak Engine, Group Policy Console, Backup/DR Manager, VoIP Softphone, Hardware Workbench) into the IT Ops Simulator desktop environment.

**Architecture:** Each feature is built as an independent simulation engine in `src/simulation/` with corresponding TypeScript types in `src/types/`, then surfaced through interactive UI applications in `src/components/apps/` managed by the OS window manager in `App.tsx`. All actions integrate into `networkEngine`, Helpdesk tickets, audio cues, and career progression.

**Tech Stack:** React 19, TypeScript 5.8, Tailwind CSS v4, Lucide React icons, Web Audio API synth, Playwright E2E testing framework.

**Spec:** `docs/superpowers/specs/2026-11-11-advanced-it-ops-features-design.md`

## Global Constraints
- All simulation state runs deterministic browser-side TypeScript without external backend calls.
- Strict TypeScript type safety without `any` overrides.
- Window stacking, minimize/restore, and unmount on close conventions must be preserved across all new window frames.
- Existing 9 Playwright tests must remain green throughout all tasks.

## Review Focus
1. **Email Header Inspection**: SPF/DKIM verification must evaluate originating IP matching reverse DNS; invalid SPF must report `spf=fail` and neutral DKIM.
2. **EDR Host Network Isolation**: Isolating a host must set `nic.isUp: false` for client-to-client subnets while preserving admin management connection.
3. **Ransomware Spreading Interval**: Outbreak simulation timer must cleanly clear on incident resolution to prevent background interval leaks.
4. **GPO Application Inheritance**: Linking a GPO to an OU must immediately propagate policy constraints (e.g. drive mappings, USB restrictions) to child member hosts.
5. **Hardware Workbench POST State**: BIOS POST code must dynamically re-evaluate upon every component swap and only show `00` when CPU, RAM, storage, and PSU pass all voltage/integrity checks.

---

### Task 1: Type Definitions for Advanced IT Subsystems

**Files:**
- Create: `src/types/mail.ts`
- Create: `src/types/security.ts`
- Create: `src/types/gpo.ts`
- Create: `src/types/backup.ts`
- Create: `src/types/phone.ts`
- Create: `src/types/hardware.ts`
- Modify: `src/types/game.ts`

**Interfaces:**
- Consumes: `DesktopWindow`, `WindowId`, `CareerStats`, `NetworkHost` from `src/types/game.ts` and `src/types/network.ts`
- Produces: `EmailMessage`, `EdrDetection`, `GpoObject`, `BackupSnapshot`, `PhoneCall`, `HardwareWorkbenchState`

- [ ] **Step 1: Write type definitions in `src/types/mail.ts`**
  Define `EmailMessage`, `EmailHeader`, `EmailAttachment`, `MailFolder`.

- [ ] **Step 2: Write type definitions in `src/types/security.ts`**
  Define `EdrDetection`, `HostIsolationStatus`, `ThreatRule`, `FleetSecurityStats`.

- [ ] **Step 3: Write type definitions in `src/types/gpo.ts`**
  Define `GpoObject`, `GpoSetting`, `LinkedOu`.

- [ ] **Step 4: Write type definitions in `src/types/backup.ts`**
  Define `BackupJob`, `BackupSnapshot`, `RestoreTarget`.

- [ ] **Step 5: Write type definitions in `src/types/phone.ts`**
  Define `PhoneCall`, `DialogueNode`, `DialogueChoice`.

- [ ] **Step 6: Write type definitions in `src/types/hardware.ts`**
  Define `HardwareWorkbenchState`, `MotherboardComponent`, `PostCode`, `PsuRails`.

- [ ] **Step 7: Update `src/types/game.ts` with new Window IDs**
  Add `'email-client' | 'edr-console' | 'group-policy' | 'backup-manager' | 'voip-phone' | 'hardware-bench'` to `WindowId`.

- [ ] **Step 8: Run typecheck**
  Run: `npm run build`
  Expected: PASS

---

### Task 2: Email & Phishing Simulation Engine (`mailEngine.ts`)

**Files:**
- Create: `src/simulation/mailEngine.ts`
- Test: `e2e/mail-engine.spec.ts`

**Interfaces:**
- Consumes: `EmailMessage`, `EmailHeader` from `src/types/mail.ts`
- Produces: `MailEngine` class with `getEmails()`, `getEmail(id)`, `quarantineEmail(id)`, `blockSenderDomain(domain)`, `verifyHeaders(id)`

- [ ] **Step 1: Write the Playwright / unit test in `e2e/mail-engine.spec.ts`**
  Test initial emails loading, raw header parsing, quarantining malicious message, and domain blocking.

- [ ] **Step 2: Run test to verify it fails**
  Run: `npx playwright test e2e/mail-engine.spec.ts`
  Expected: FAIL (Cannot find module `mailEngine`)

- [ ] **Step 3: Implement `MailEngine` in `src/simulation/mailEngine.ts`**
  Implement seed emails (phishing invoice, legitimate executive memo, IT security advisory), SPF/DKIM verification logic, and quarantine state.

- [ ] **Step 4: Run test to verify it passes**
  Run: `npx playwright test e2e/mail-engine.spec.ts`
  Expected: PASS

---

### Task 3: EDR Telemetry & Live Outbreak Engine (`securityEngine.ts` & `outbreakEngine.ts`)

**Files:**
- Create: `src/simulation/securityEngine.ts`
- Create: `src/simulation/outbreakEngine.ts`
- Test: `e2e/security-engine.spec.ts`

**Interfaces:**
- Consumes: `NetworkEngine` from `src/simulation/networkEngine.ts`, `EdrDetection` from `src/types/security.ts`
- Produces: `SecurityEngine` with `isolateHost(id)`, `unisolateHost(id)`, `terminateThreat(threatId)`, `scanFleet()`, and `OutbreakEngine` with `triggerOutbreak()`, `stopOutbreak()`, `getEncryptedShares()`

- [ ] **Step 1: Write test in `e2e/security-engine.spec.ts`**
  Test detecting threat, isolating host from network, verifying host isolation status, and terminating malicious process.

- [ ] **Step 2: Run test to verify it fails**
  Run: `npx playwright test e2e/security-engine.spec.ts`
  Expected: FAIL

- [ ] **Step 3: Implement `SecurityEngine` and `OutbreakEngine`**
  Implement host network isolation (disconnects host NIC while keeping admin route), threat list management, and outbreak propagation loop.

- [ ] **Step 4: Run test to verify it passes**
  Run: `npx playwright test e2e/security-engine.spec.ts`
  Expected: PASS

---

### Task 4: Group Policy Engine (`gpoEngine.ts`) & Backup/DR Engine (`backupEngine.ts`)

**Files:**
- Create: `src/simulation/gpoEngine.ts`
- Create: `src/simulation/backupEngine.ts`
- Test: `e2e/gpo-backup-engine.spec.ts`

**Interfaces:**
- Consumes: `NetworkEngine`, `GpoObject`, `BackupSnapshot`
- Produces: `GpoEngine` with `linkGpoToOu()`, `toggleGpoSetting()`, `getEffectivePolicyForHost()`, and `BackupEngine` with `takeSnapshot()`, `restoreShare()`, `restoreDatabase()`

- [ ] **Step 1: Write test in `e2e/gpo-backup-engine.spec.ts`**
  Test linking USB restriction GPO to Finance OU, verifying effective policy on `PC-FIN-04`, taking snapshot of `FS-SRV-01`, and restoring simulated share.

- [ ] **Step 2: Run test to verify it fails**
  Run: `npx playwright test e2e/gpo-backup-engine.spec.ts`
  Expected: FAIL

- [ ] **Step 3: Implement `GpoEngine` and `BackupEngine`**
  Implement policy inheritance across domain and OUs, snapshot repository management, and data rollback.

- [ ] **Step 4: Run test to verify it passes**
  Run: `npx playwright test e2e/gpo-backup-engine.spec.ts`
  Expected: PASS

---

### Task 5: VoIP Softphone Engine (`phoneEngine.ts`) & Hardware Workbench Engine (`hardwareEngine.ts`)

**Files:**
- Create: `src/simulation/phoneEngine.ts`
- Create: `src/simulation/hardwareEngine.ts`
- Test: `e2e/phone-hardware-engine.spec.ts`

**Interfaces:**
- Consumes: `PhoneCall`, `HardwareWorkbenchState`
- Produces: `PhoneEngine` with `triggerIncomingCall()`, `answerCall()`, `selectDialogueChoice()`, and `HardwareEngine` with `diagnosePostCode()`, `swapRam()`, `replacePsu()`, `reapplyThermalPaste()`, `powerOnBenchRig()`

- [ ] **Step 1: Write test in `e2e/phone-hardware-engine.spec.ts`**
  Test answering call, picking diagnostic question branch to reveal ticket note, and diagnosing faulty RAM (POST 55) -> swapping RAM stick -> successful POST `00`.

- [ ] **Step 2: Run test to verify it fails**
  Run: `npx playwright test e2e/phone-hardware-engine.spec.ts`
  Expected: FAIL

- [ ] **Step 3: Implement `PhoneEngine` and `HardwareEngine`**
  Implement interactive dialogue trees, synth ringer trigger, voltage rail metrics, and BIOS POST evaluation algorithm.

- [ ] **Step 4: Run test to verify it passes**
  Run: `npx playwright test e2e/phone-hardware-engine.spec.ts`
  Expected: PASS

---

### Task 6: UI Applications Implementation

**Files:**
- Create: `src/components/apps/EmailClientApp.tsx`
- Create: `src/components/apps/EdrConsoleApp.tsx`
- Create: `src/components/apps/GroupPolicyApp.tsx`
- Create: `src/components/apps/BackupManagerApp.tsx`
- Create: `src/components/apps/VoipPhoneApp.tsx`
- Create: `src/components/apps/HardwareWorkbenchApp.tsx`

**Interfaces:**
- Consumes: All 6 simulation engines
- Produces: React components conforming to Desktop window container layout

- [ ] **Step 1: Implement `EmailClientApp.tsx`**
  Inbox list, raw headers modal, phishing report analysis, quarantine buttons.

- [ ] **Step 2: Implement `EdrConsoleApp.tsx`**
  Fleet security overview, detection event feed, host isolation toggle, process termination.

- [ ] **Step 3: Implement `GroupPolicyApp.tsx`**
  GPMC tree view, OU linking, policy setting toggles (USB storage, drive maps, password rules).

- [ ] **Step 4: Implement `BackupManagerApp.tsx`**
  Server snapshot manager, recovery points history, restore progress bar.

- [ ] **Step 5: Implement `VoipPhoneApp.tsx`**
  Dialer keypad, active call screen, employee profile photo/details, dialogue options with audio chimes.

- [ ] **Step 6: Implement `HardwareWorkbenchApp.tsx`**
  Motherboard schematic, clickable RAM/CPU/PSU/SSD slots, POST LED display, parts inventory shelf, power toggle.

- [ ] **Step 7: Verify compilation**
  Run: `npm run build`
  Expected: PASS

---

### Task 7: Desktop Environment Integration & Puzzle / Clue Overhaul

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/desktop/Taskbar.tsx`
- Modify: `src/components/desktop/StartMenu.tsx`
- Modify: `src/simulation/ticketEngine.ts`
- Modify: `src/components/apps/TicketingApp.tsx`
- Modify: `src/components/apps/HelpDocsApp.tsx`

**Interfaces:**
- Consumes: All new apps, simulation engines, and phone dialogue clue triggers
- Produces: Registered desktop windows with coordinates, icons, start menu pins, taskbar icons, new corresponding incident tickets, and anti-spoiler puzzle hint system

- [ ] **Step 1: Register new windows in `INITIAL_WINDOWS` in `src/App.tsx`**
  Add `'email-client'`, `'edr-console'`, `'group-policy'`, `'backup-manager'`, `'voip-phone'`, `'hardware-bench'` with layout coordinates.

- [ ] **Step 2: Wire components inside `<WindowFrame>` switch in `src/App.tsx`**
  Instantiate all 6 apps with simulation engine props and refresh callbacks.

- [ ] **Step 3: Add new app icons to `Taskbar.tsx` and `StartMenu.tsx`**
  Add Email, EDR, GPMC, Backup, Softphone, and Hardware Bench shortcuts.

- [ ] **Step 4: Overhaul `TicketingApp.tsx` & `HelpDocsApp.tsx` for Puzzle-first Gameplay**
  Remove auto-displayed direct solution spoilers. Add collapsible "Request Senior Sysadmin Clue (-25 XP)" button and dynamic "Discovered Phone Clues" section. Refactor Handbook into an authoritative technical reference rather than a walkthrough.

- [ ] **Step 5: Add new realistic support tickets to `src/simulation/ticketEngine.ts`**
  Add tickets for phishing attack, malware beacon, USB policy enforcement, database corruption recovery, hardware POST failure, and phone consultation. Rewrite existing hints to be subtle diagnostic nudges.

- [ ] **Step 6: Verify build**
  Run: `npm run build`
  Expected: PASS

---

### Task 8: Full End-to-End Suite Verification & Deployment

**Files:**
- Modify: `e2e/game.spec.ts`

- [ ] **Step 1: Add comprehensive E2E tests for all 7 features in `e2e/game.spec.ts`**
  1. Email Client header inspection & phishing quarantine.
  2. EDR host isolation and threat kill.
  3. Group Policy GPO link to OU.
  4. Backup Manager snapshot and restore.
  5. VoIP softphone answer and clue extraction.
  6. Hardware Workbench RAM replacement and POST pass.

- [ ] **Step 2: Run full Playwright test suite**
  Run: `npx playwright test`
  Expected: All tests PASS.

- [ ] **Step 3: Deploy to Cloudflare Pages**
  Run: `npx wrangler pages deploy dist --project-name=it-ops-simulator`
  Expected: Deploy succeeds with live URL verification.
