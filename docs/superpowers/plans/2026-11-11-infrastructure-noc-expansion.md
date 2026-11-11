# Enterprise Infrastructure & NOC Expansion Suite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and integrate 6 NOC & Enterprise Infrastructure subsystems (Physical Server Rack & Patch Room, SIEM Log Correlation Console, Change Management & CAB Console, DHCP Scope & DNS Zone Manager, PowerShell/Bash Automation Studio, and Procedural Shift Events + End-of-Shift Report Card) into IT Ops Simulator.

**Architecture:** Each subsystem has strict TypeScript interfaces in `src/types/`, a stateful deterministic simulation engine in `src/simulation/`, and an interactive desktop window app in `src/components/apps/` (plus `ShiftReportModal.tsx` in `src/components/desktop/`). All 6 subsystems wire into `src/App.tsx`, `src/simulation/ticketEngine.ts` (tickets `INC-1066` through `INC-1071`), `Taskbar.tsx`, `StartMenu.tsx`, and `HelpDocsApp.tsx`.

**Tech Stack:** React 19, TypeScript 5.8, Tailwind CSS v4, Lucide React icons, Web Audio API synth, Playwright E2E test runner.

**Spec:** `docs/superpowers/specs/2026-11-11-infrastructure-noc-expansion-design.md`

## Global Constraints
- All simulation state runs in deterministic browser-side TypeScript with zero external network dependencies.
- Strict TypeScript compilation (`tsc -b && vite build`) with zero `any` types or unused variable errors.
- Stable DOM ordering in `App.tsx` (do not sort `Object.values(windows)` in JSX) and `data-window-control` propagation guards in `WindowFrame.tsx` must remain intact.
- Ticket descriptions and handbook entries must remain puzzle-first with zero direct walkthrough spoilers.
- All 60 existing Playwright tests must continue to pass alongside new tests.

## Review Focus
1. **Patch Cable TDR & RAID Rebuild State**: Replacing a degraded Cat6 cable (`CBL-104`) must only clear the Layer-1 fault when both crimped/replaced and patched to `SW-EDGE-01 Gi0/18`, and swapping faulty RAID bay `DISK-BAY-3` on `FS-SRV-01` must transition array status from `'Degraded'` to `'Healthy'`.
2. **SIEM Multi-Token Query Parsing**: Query strings combining key-value filters (e.g., `source=ad_auth severity=CRITICAL` or IP search `185.220.101.44`) must accurately filter logs case-insensitively and only mark the threat hunt resolved when both attacker IP `185.220.101.44` and compromised account `svc_backup` are blocked/revoked.
3. **Change Management Unauthorized Reboot Guard**: Executing `CR-202` on `SQL-PROD-01` without first enabling HA Replica Failover (`isFailoverActive === true`) and obtaining CAB approval (`status === 'Approved'`) must trigger a SLA/Change violation (`status = 'Violated'`) rather than completing cleanly.
4. **DHCP Lease Exhaustion & DNS Zone Serial Update**: Purging rogue leases on VLAN 40 (`SCOPE-VLAN40`) must free IP capacity below 80%, and updating `portal.corp.local` (`A` record) to `192.168.10.202` must increment the zone SOA serial number.
5. **Automation Script Target Scope Execution**: Running a remediation script in `ScriptEngine` must only mutate hosts belonging to the selected target scope (e.g., `OU=Engineering`) and return per-host exit codes and stdout lines.

---

### Task 1: TypeScript Type Definitions for 6 NOC Subsystems

**Files:**
- Create: `src/types/rack.ts`
- Create: `src/types/siem.ts`
- Create: `src/types/change.ts`
- Create: `src/types/dhcpDns.ts`
- Create: `src/types/script.ts`
- Create: `src/types/shiftEvent.ts`
- Modify: `src/types/game.ts`

**Interfaces:**
- Consumes: `Department` from `src/types/network.ts`
- Produces:
  - `src/types/rack.ts`: `PatchCable`, `RaidDriveBay`, `ServerRaidArray`, `UpsState`, `RackUnitState`
  - `src/types/siem.ts`: `SiemLogSource`, `SiemSeverity`, `SiemLogEntry`, `SiemInvestigationCase`
  - `src/types/change.ts`: `ChangeRiskLevel`, `ChangeStatus`, `ChangeRequest`
  - `src/types/dhcpDns.ts`: `DhcpLease`, `DhcpScope`, `DnsRecordType`, `DnsRecord`, `DnsZone`
  - `src/types/script.ts`: `ScriptTargetScope`, `AutomationPlaybook`, `ScriptExecutionLog`, `ScriptExecutionResult`
  - `src/types/shiftEvent.ts`: `ShiftEventSeverity`, `ShiftEvent`, `ShiftReportCard`
  - `src/types/game.ts`: Extended `WindowId` (`'rack-room' | 'siem-console' | 'change-control' | 'dhcp-dns' | 'script-studio'`) and extended `TicketRequirement['type']` (`'rack_repaired' | 'siem_ioc_blocked' | 'change_completed' | 'dhcp_dns_fixed' | 'script_executed' | 'ssl_renewed'`)

- [ ] **Step 1: Create `src/types/rack.ts`**
  Define `PatchCable` (`id`, `label`, `panelPort`, `switchId`, `switchPort`, `targetHostId`, `status: 'Good' | 'Crosstalk' | 'Unplugged'`, `attenuationDb: number`, `lengthMeters: number`), `RaidDriveBay` (`bayIndex: number`, `serial: string`, `capacityTb: number`, `status: 'Online' | 'Faulty' | 'Rebuilding' | 'Empty'`, `smartErrors: number`), `ServerRaidArray` (`serverId: string`, `raidLevel: 'RAID-1' | 'RAID-5' | 'RAID-10'`, `status: 'Healthy' | 'Degraded' | 'Offline'`, `bays: RaidDriveBay[]`), `UpsState` (`model: string`, `inputVoltage: number`, `outputVoltage: number`, `batteryChargePercent: number`, `loadPercent: number`, `mode: 'Online' | 'Battery Bypass' | 'Overload'`, `isHealthy: boolean`), and `RackUnitState`.

- [ ] **Step 2: Create `src/types/siem.ts`**
  Define `SiemLogSource = 'firewall' | 'ad_auth' | 'dns' | 'edr' | 'smb'`, `SiemSeverity = 'INFO' | 'WARN' | 'CRITICAL'`, `SiemLogEntry` (`id`, `timestamp`, `source`, `severity`, `hostId`, `sourceIp`, `username?`, `eventCode`, `message`, `rawPayload`), and `SiemInvestigationCase` (`id`, `title`, `pinnedLogIds: string[]`, `blockedIps: string[]`, `revokedAccounts: string[]`, `isResolved: boolean`).

- [ ] **Step 3: Create `src/types/change.ts`**
  Define `ChangeRiskLevel = 'Low' | 'Medium' | 'High' | 'Critical'`, `ChangeStatus = 'Draft' | 'Pending CAB' | 'Approved' | 'Completed' | 'Violated'`, and `ChangeRequest` (`id`, `title`, `targetHostId`, `description`, `riskLevel`, `status`, `maintenanceWindow`, `requiresFailover: boolean`, `isFailoverActive: boolean`, `hasRollbackPlan: boolean`, `cabNotes: string`).

- [ ] **Step 4: Create `src/types/dhcpDns.ts`**
  Define `DhcpLease` (`ip`, `mac`, `hostname`, `isRogue: boolean`, `isReservation: boolean`, `expiresInMinutes: number`), `DhcpScope` (`id`, `vlanId: number`, `name`, `subnet`, `rangeStart`, `rangeEnd`, `totalAddresses: number`, `leases: DhcpLease[]`), `DnsRecordType = 'A' | 'CNAME' | 'MX' | 'TXT' | 'PTR'`, `DnsRecord` (`id`, `name`, `type`, `value`, `ttl: number`, `isCorrupted?: boolean`), and `DnsZone` (`domain: string`, `soaSerial: number`, `records: DnsRecord[]`).

- [ ] **Step 5: Create `src/types/script.ts`**
  Define `ScriptTargetScope = 'OU=Finance' | 'OU=Engineering' | 'OU=Sales' | 'OU=Executive' | 'All Workstations' | 'All Servers'`, `AutomationPlaybook` (`id`, `name`, `description`, `targetScope: ScriptTargetScope`, `commands: string[]`), `ScriptExecutionLog` (`hostId: string`, `command: string`, `stdout: string`, `exitCode: number`), and `ScriptExecutionResult` (`playbookId: string`, `targetScope: ScriptTargetScope`, `timestamp: string`, `logs: ScriptExecutionLog[]`, `allSucceeded: boolean`).

- [ ] **Step 6: Create `src/types/shiftEvent.ts`**
  Define `ShiftEventSeverity = 'Warning' | 'Critical'`, `ShiftEvent` (`id`, `title`, `description`, `severity`, `targetHostId`, `isActive: boolean`, `isResolved: boolean`, `triggeredAtSecond: number`), and `ShiftReportCard` (`day: number`, `ticketsResolved: number`, `ticketsFailed: number`, `slaAdherenceRate: number`, `uptimePercent: number`, `grade: 'S' | 'A' | 'B' | 'C' | 'F'`, `bonusCash: number`, `bonusXp: number`).

- [ ] **Step 7: Update `src/types/game.ts`**
  Add `'rack_repaired' | 'siem_ioc_blocked' | 'change_completed' | 'dhcp_dns_fixed' | 'script_executed' | 'ssl_renewed'` to `TicketRequirement['type']`, and add `'rack-room' | 'siem-console' | 'change-control' | 'dhcp-dns' | 'script-studio'` to `WindowId`.

- [ ] **Step 8: Run build verification**
  Run: `npm run build`
  Expected: PASS with zero TypeScript errors.

- [ ] **Step 9: Commit Task 1**
  Run: `git add src/types/rack.ts src/types/siem.ts src/types/change.ts src/types/dhcpDns.ts src/types/script.ts src/types/shiftEvent.ts src/types/game.ts && git commit -m "feat(types): add TypeScript interfaces for 6 NOC expansion subsystems"`

---

### Task 2: Physical Server Rack & Patch Panel Engine (`rackEngine.ts`)

**Files:**
- Create: `src/simulation/rackEngine.ts`
- Test: `e2e/rack-engine.spec.ts`

**Interfaces:**
- Consumes: `PatchCable`, `ServerRaidArray`, `UpsState`, `RackUnitState` from `src/types/rack.ts`
- Produces: `RackEngine` class with:
  - `getState(): RackUnitState`
  - `getCables(): PatchCable[]`
  - `runCableTdrTest(cableId: string): { cable: PatchCable; passed: boolean; diagnosticMessage: string }`
  - `replaceAndPatchCable(cableId: string, switchPort: string): PatchCable | undefined`
  - `getRaidArrays(): ServerRaidArray[]`
  - `hotSwapRaidDrive(serverId: string, bayIndex: number): ServerRaidArray | undefined`
  - `getUpsState(): UpsState`
  - `toggleUpsBypass(enableBypass: boolean): UpsState`
  - `isRackHealthyForTicket(): boolean`

- [ ] **Step 1: Write failing Playwright test `e2e/rack-engine.spec.ts`**
  Test that:
  1. Initial `CBL-104` (`PP-01 Port 18 -> SW-EDGE-01 Gi0/18`, serving `PC-SALES-02`) fails `runCableTdrTest('CBL-104')` with `status === 'Crosstalk'` and `attenuationDb > 40`.
  2. Calling `replaceAndPatchCable('CBL-104', 'Gi0/18')` sets `status: 'Good'`, `attenuationDb: 3.2`, and `runCableTdrTest('CBL-104').passed === true`.
  3. Initial `FS-SRV-01` RAID-5 array has `status === 'Degraded'` with bay `2` (3rd drive, `bayIndex: 2`) `'Faulty'`.
  4. Calling `hotSwapRaidDrive('FS-SRV-01', 2)` replaces the drive with a healthy spare, sets bay status to `'Online'`, array `status` to `'Healthy'`, and `isRackHealthyForTicket() === true`.

- [ ] **Step 2: Run test to verify it fails**
  Run: `npx playwright test e2e/rack-engine.spec.ts`
  Expected: FAIL (`Cannot find module '../src/simulation/rackEngine'`)

- [ ] **Step 3: Implement `RackEngine` in `src/simulation/rackEngine.ts`**
  Seed 6 patch cables (`CBL-101` to `CBL-106`, with `CBL-104` having `Crosstalk` and `48.5 dB` attenuation), 2 server RAID arrays (`FS-SRV-01` RAID-5 Degraded on `bayIndex: 2`, `SQL-PROD-01` RAID-10 Healthy), and `APC-UPS-3000VA` state.

- [ ] **Step 4: Run test to verify it passes**
  Run: `npx playwright test e2e/rack-engine.spec.ts`
  Expected: PASS

- [ ] **Step 5: Commit Task 2**
  Run: `git add src/simulation/rackEngine.ts e2e/rack-engine.spec.ts && git commit -m "feat(rack): implement physical server rack, TDR patch cable, and RAID hot-swap engine"`

---

### Task 3: SIEM Log Correlation & Threat Hunting Engine (`siemEngine.ts`)

**Files:**
- Create: `src/simulation/siemEngine.ts`
- Test: `e2e/siem-engine.spec.ts`

**Interfaces:**
- Consumes: `SiemLogEntry`, `SiemInvestigationCase` from `src/types/siem.ts`
- Produces: `SiemEngine` class with:
  - `getLogs(): SiemLogEntry[]`
  - `queryLogs(query: string): SiemLogEntry[]`
  - `getCase(): SiemInvestigationCase`
  - `pinLogToCase(logId: string): SiemInvestigationCase`
  - `unpinLogFromCase(logId: string): SiemInvestigationCase`
  - `blockAttackerIp(ip: string): SiemInvestigationCase`
  - `revokeCompromisedAccount(username: string): SiemInvestigationCase`
  - `isInvestigationResolved(): boolean`

- [ ] **Step 1: Write failing Playwright test `e2e/siem-engine.spec.ts`**
  Test that:
  1. `getLogs()` returns >= 20 multi-source enterprise logs (`firewall`, `ad_auth`, `dns`, `edr`, `smb`).
  2. `queryLogs('source=ad_auth severity=CRITICAL')` filters only matching critical AD authentication events.
  3. `queryLogs('185.220.101.44')` returns the attack chain logs showing brute force on `svc_backup` and lateral movement to `SQL-PROD-01`.
  4. Pinning at least 2 logs from the attack chain, calling `blockAttackerIp('185.220.101.44')`, and calling `revokeCompromisedAccount('svc_backup')` sets `isInvestigationResolved() === true`.

- [ ] **Step 2: Run test to verify it fails**
  Run: `npx playwright test e2e/siem-engine.spec.ts`
  Expected: FAIL (`Cannot find module '../src/simulation/siemEngine'`)

- [ ] **Step 3: Implement `SiemEngine` in `src/simulation/siemEngine.ts`**
  Implement token-based query parser (`source=`, `severity=`, `host=`, `ip=`, `user=`, plus free-text substring matching) and IOC correlation case tracker.

- [ ] **Step 4: Run test to verify it passes**
  Run: `npx playwright test e2e/siem-engine.spec.ts`
  Expected: PASS

- [ ] **Step 5: Commit Task 3**
  Run: `git add src/simulation/siemEngine.ts e2e/siem-engine.spec.ts && git commit -m "feat(siem): implement SIEM log correlation query engine and IOC threat hunting"`

---

### Task 4: Change Management (`changeEngine.ts`) & DHCP/DNS Manager (`dhcpDnsEngine.ts`)

**Files:**
- Create: `src/simulation/changeEngine.ts`
- Create: `src/simulation/dhcpDnsEngine.ts`
- Test: `e2e/change-dhcp-dns-engine.spec.ts`

**Interfaces:**
- Consumes: `ChangeRequest` from `src/types/change.ts`; `DhcpScope`, `DnsZone`, `DnsRecord` from `src/types/dhcpDns.ts`
- Produces:
  - `ChangeEngine` class with:
    - `getChangeRequests(): ChangeRequest[]`
    - `getChangeRequest(id: string): ChangeRequest | undefined`
    - `toggleFailoverReplica(id: string, active: boolean): ChangeRequest | undefined`
    - `attachRollbackPlan(id: string): ChangeRequest | undefined`
    - `requestCabApproval(id: string): { success: boolean; message: string; request?: ChangeRequest }`
    - `executeChangeMaintenance(id: string): { success: boolean; violated: boolean; message: string; request?: ChangeRequest }`
    - `isChangeCompletedCleanly(id: string): boolean`
  - `DhcpDnsEngine` class with:
    - `getScopes(): DhcpScope[]`
    - `purgeRogueLeases(scopeId: string): { purgedCount: number; scope?: DhcpScope }`
    - `addLeaseReservation(scopeId: string, ip: string, mac: string, hostname: string): DhcpScope | undefined`
    - `getDnsZone(): DnsZone`
    - `updateDnsRecord(recordId: string, newValue: string): DnsRecord | undefined`
    - `isDhcpAndDnsHealthy(): boolean`

- [ ] **Step 1: Write failing Playwright test `e2e/change-dhcp-dns-engine.spec.ts`**
  Test that:
  1. Executing `CR-202` before CAB approval and failover activation sets `violated: true` and `status: 'Violated'`.
  2. Enabling failover (`toggleFailoverReplica('CR-202', true)`), attaching rollback plan (`attachRollbackPlan('CR-202')`), requesting CAB approval (`requestCabApproval('CR-202')` -> `'Approved'`), and calling `executeChangeMaintenance('CR-202')` succeeds with `status: 'Completed'` and `isChangeCompletedCleanly('CR-202') === true`.
  3. `SCOPE-VLAN40` starts at 100% lease utilization due to rogue `00:DE:AD:BE:EF:*` leases; `purgeRogueLeases('SCOPE-VLAN40')` removes rogue leases and drops utilization below 50%.
  4. `portal.corp.local` (`REC-PORTAL`) starts pointing to `192.168.10.99` (`isCorrupted: true`); calling `updateDnsRecord('REC-PORTAL', '192.168.10.202')` clears `isCorrupted`, increments `soaSerial`, and sets `isDhcpAndDnsHealthy() === true`.

- [ ] **Step 2: Run test to verify it fails**
  Run: `npx playwright test e2e/change-dhcp-dns-engine.spec.ts`
  Expected: FAIL

- [ ] **Step 3: Implement `ChangeEngine` and `DhcpDnsEngine`**
  Implement `src/simulation/changeEngine.ts` and `src/simulation/dhcpDnsEngine.ts` matching all interface contracts.

- [ ] **Step 4: Run test to verify it passes**
  Run: `npx playwright test e2e/change-dhcp-dns-engine.spec.ts`
  Expected: PASS

- [ ] **Step 5: Commit Task 4**
  Run: `git add src/simulation/changeEngine.ts src/simulation/dhcpDnsEngine.ts e2e/change-dhcp-dns-engine.spec.ts && git commit -m "feat(noc): implement Change Management CAB engine and DHCP/DNS Zone engine"`

---

### Task 5: Automation Script Studio (`scriptEngine.ts`) & Shift Events Engine (`shiftEventEngine.ts`)

**Files:**
- Create: `src/simulation/scriptEngine.ts`
- Create: `src/simulation/shiftEventEngine.ts`
- Test: `e2e/script-shift-engine.spec.ts`

**Interfaces:**
- Consumes: `NetworkEngine` from `src/simulation/networkEngine.ts`, `AutomationPlaybook`, `ScriptTargetScope`, `ScriptExecutionResult` from `src/types/script.ts`, `ShiftEvent`, `ShiftReportCard` from `src/types/shiftEvent.ts`, `CareerStats` from `src/types/game.ts`
- Produces:
  - `ScriptEngine` class with:
    - `getPlaybooks(): AutomationPlaybook[]`
    - `executePlaybook(playbookId: string, targetScope: ScriptTargetScope, customCommands?: string[]): ScriptExecutionResult`
    - `getExecutionHistory(): ScriptExecutionResult[]`
    - `hasExecutedPlaybookOnScope(playbookId: string, targetScope: ScriptTargetScope): boolean`
  - `ShiftEventEngine` class with:
    - `getEvents(): ShiftEvent[]`
    - `triggerEvent(eventId: string): ShiftEvent | undefined`
    - `renewSslCertificate(hostId: string): { success: boolean; message: string }`
    - `isSslValid(hostId: string): boolean`
    - `calculateShiftReport(career: CareerStats): ShiftReportCard`

- [ ] **Step 1: Write failing Playwright test `e2e/script-shift-engine.spec.ts`**
  Test that:
  1. `ScriptEngine` seeds playbooks including `'PLAYBOOK-ENG-REMEDIATE'`, and executing it against `'OU=Engineering'` runs commands across Engineering hosts, returns `allSucceeded: true`, and sets `hasExecutedPlaybookOnScope('PLAYBOOK-ENG-REMEDIATE', 'OU=Engineering') === true`.
  2. `ShiftEventEngine` starts with `WEB-INTRA-01` TLS certificate expired (`isSslValid('WEB-INTRA-01') === false`); calling `renewSslCertificate('WEB-INTRA-01')` resolves `EVT-SSL-EXPIRED` and sets `isSslValid('WEB-INTRA-01') === true`.
  3. `calculateShiftReport(career)` computes deterministic grade (`'S'` when resolved >= 3 and failed === 0, `'A'` when SLA >= 85%, etc.) and bonus rewards.

- [ ] **Step 2: Run test to verify it fails**
  Run: `npx playwright test e2e/script-shift-engine.spec.ts`
  Expected: FAIL

- [ ] **Step 3: Implement `ScriptEngine` and `ShiftEventEngine`**
  Implement `src/simulation/scriptEngine.ts` and `src/simulation/shiftEventEngine.ts`.

- [ ] **Step 4: Run test to verify it passes**
  Run: `npx playwright test e2e/script-shift-engine.spec.ts`
  Expected: PASS

- [ ] **Step 5: Commit Task 5**
  Run: `git add src/simulation/scriptEngine.ts src/simulation/shiftEventEngine.ts e2e/script-shift-engine.spec.ts && git commit -m "feat(automation): implement PowerShell/Bash Script Studio engine and Shift Event engine"`

---

### Task 6: React UI Applications for All 6 Subsystems

**Files:**
- Create: `src/components/apps/RackRoomApp.tsx`
- Create: `src/components/apps/SiemConsoleApp.tsx`
- Create: `src/components/apps/ChangeControlApp.tsx`
- Create: `src/components/apps/DhcpDnsApp.tsx`
- Create: `src/components/apps/ScriptStudioApp.tsx`
- Create: `src/components/desktop/ShiftReportModal.tsx`

**Interfaces:**
- Consumes: `RackEngine`, `SiemEngine`, `ChangeEngine`, `DhcpDnsEngine`, `ScriptEngine`, `ShiftEventEngine`, `CareerStats`
- Produces:
  - `RackRoomApp`: 42U Rack interactive view, Patch Cable TDR diagnostics & Replace/Patch button, RAID-5 bay status & Hot-Swap Spare Drive button, UPS telemetry & Online/Bypass toggle.
  - `SiemConsoleApp`: Search query input (`placeholder="Search logs (e.g. source=ad_auth severity=CRITICAL or 185.220.101.44)"`), log stream table, Pin to Case button, Block Attacker IP input/button, Revoke Account input/button.
  - `ChangeControlApp`: Change request list (`CR-201`..`CR-204`), detail inspector, Toggle HA Failover Replica button, Attach Rollback Plan button, Request CAB Approval button, Execute Maintenance Window button, and TLS Certificate Renewal card for `WEB-INTRA-01`.
  - `DhcpDnsApp`: Tabs for `DHCP Scopes` (Purge Rogue Leases button, Add Reservation form) and `DNS Zone (corp.local)` (inline IP editor & Update Record button).
  - `ScriptStudioApp`: Playbook selector, Target Scope dropdown (`OU=Engineering`, etc.), editable script code area, `Run Automation Playbook` button, and live per-host stdout terminal output.
  - `ShiftReportModal`: End-of-Shift Post-Mortem report card modal showing SLA Grade badge, metrics, and `Start Next Shift` button.

- [ ] **Step 1: Implement `src/components/apps/RackRoomApp.tsx`**
  Include accessible button labels (`Run TDR Test`, `Replace & Patch Cable`, `Hot-Swap Drive Bay 3`, `Toggle UPS Bypass`).

- [ ] **Step 2: Implement `src/components/apps/SiemConsoleApp.tsx`**
  Include query bar, quick filter chips, log table with `Pin Log` button, and IOC remediation panel (`Block IP 185.220.101.44`, `Revoke Account svc_backup`).

- [ ] **Step 3: Implement `src/components/apps/ChangeControlApp.tsx`**
  Include Change Request workflow controls (`Enable HA Failover Replica`, `Attach Rollback Plan`, `Request CAB Approval`, `Execute Maintenance`) plus a dedicated `Renew TLS Certificate (WEB-INTRA-01)` action panel linked to `ShiftEventEngine`.

- [ ] **Step 4: Implement `src/components/apps/DhcpDnsApp.tsx`**
  Include DHCP Scopes view (`Purge Rogue Leases` button on `SCOPE-VLAN40`) and DNS Zone Records table (`Update Record` for `portal.corp.local`).

- [ ] **Step 5: Implement `src/components/apps/ScriptStudioApp.tsx`**
  Include playbook list (`PLAYBOOK-ENG-REMEDIATE`), target scope selector, script editor, and `Execute Playbook` button.

- [ ] **Step 6: Implement `src/components/desktop/ShiftReportModal.tsx`**
  Render SLA grade (`S`/`A`/`B`/`C`/`F`), shift statistics, bonus XP/Cash earned, and `Start Next Shift` button.

- [ ] **Step 7: Verify TypeScript build**
  Run: `npm run build`
  Expected: PASS

- [ ] **Step 8: Commit Task 6**
  Run: `git add src/components/apps/RackRoomApp.tsx src/components/apps/SiemConsoleApp.tsx src/components/apps/ChangeControlApp.tsx src/components/apps/DhcpDnsApp.tsx src/components/apps/ScriptStudioApp.tsx src/components/desktop/ShiftReportModal.tsx && git commit -m "feat(ui): add 5 NOC desktop apps and End-of-Shift report modal"`

---

### Task 7: Desktop Integration, Ticket Queue (`INC-1066`–`INC-1071`), & Handbook Reference

**Files:**
- Modify: `src/simulation/ticketEngine.ts`
- Modify: `src/components/apps/TicketingApp.tsx`
- Modify: `src/components/apps/HelpDocsApp.tsx`
- Modify: `src/components/desktop/Taskbar.tsx`
- Modify: `src/components/desktop/StartMenu.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: All 6 new engines and UI components
- Produces:
  - 6 new tickets in `INITIAL_TICKETS`:
    - `INC-1066`: Physical Rack — `FS-SRV-01` RAID-5 degraded & `PC-SALES-02` layer-1 crosstalk cable `CBL-104` (`type: 'rack_repaired'`)
    - `INC-1067`: SIEM Threat Hunt — Correlate off-hours brute force IP `185.220.101.44` and compromised `svc_backup` account (`type: 'siem_ioc_blocked'`)
    - `INC-1068`: Change Control — Execute emergency SQL cluster maintenance `CR-202` with HA failover & CAB approval (`type: 'change_completed'`)
    - `INC-1069`: DHCP & DNS — Purge rogue DHCP leases exhausting VLAN 40 and point `portal.corp.local` to `192.168.10.202` (`type: 'dhcp_dns_fixed'`)
    - `INC-1070`: Automation Studio — Run `PLAYBOOK-ENG-REMEDIATE` across `OU=Engineering` (`type: 'script_executed'`)
    - `INC-1071`: TLS Certificate Expiration — Renew expired SSL/TLS certificate on `WEB-INTRA-01` (`type: 'ssl_renewed'`)
  - Full validation in `verifyTicketResolution` in `src/simulation/ticketEngine.ts`.

- [ ] **Step 1: Update `src/simulation/ticketEngine.ts` with `INC-1066` through `INC-1071` and requirement evaluators**
  Extend `TicketValidationContext` with `rackEngine?`, `siemEngine?`, `changeEngine?`, `dhcpDnsEngine?`, `scriptEngine?`, `shiftEventEngine?` and evaluate all 6 new requirement types.

- [ ] **Step 2: Update `src/components/apps/TicketingApp.tsx` quick-launch buttons and props**
  Pass the new engines into `verifyTicketResolution` and provide context-appropriate tool launch buttons (`Open Server Rack Room`, `Open SIEM Console`, `Open Change Control`, `Open DHCP & DNS Manager`, `Open Script Studio`).

- [ ] **Step 3: Update `src/components/apps/HelpDocsApp.tsx`**
  Add non-spoiler technical reference sections for Layer-1 TDR & RAID Arrays, SIEM Query Syntax, ITIL CAB Change Workflow, DHCP/DNS SOA Records, and PowerShell Fleet Playbooks.

- [ ] **Step 4: Register windows and End-of-Shift button in `src/App.tsx`, `Taskbar.tsx`, and `StartMenu.tsx`**
  Add `'rack-room'`, `'siem-console'`, `'change-control'`, `'dhcp-dns'`, and `'script-studio'` to `INITIAL_WINDOWS`, taskbar icons, and start menu items, plus an `End Shift` button in `Taskbar.tsx` that opens `ShiftReportModal`.

- [ ] **Step 5: Verify build**
  Run: `npm run build`
  Expected: PASS

- [ ] **Step 6: Commit Task 7**
  Run: `git add src/simulation/ticketEngine.ts src/components/apps/TicketingApp.tsx src/components/apps/HelpDocsApp.tsx src/components/desktop/Taskbar.tsx src/components/desktop/StartMenu.tsx src/App.tsx && git commit -m "feat(integration): wire 6 NOC subsystems into desktop, taskbar, and ticket engine"`

---

### Task 8: End-to-End Playwright Verification & Cloudflare Pages Deployment

**Files:**
- Modify: `e2e/game.spec.ts`

- [ ] **Step 1: Add E2E tests in `e2e/game.spec.ts` covering all 6 new subsystems and tickets (`INC-1066` to `INC-1071`) plus `ShiftReportModal`**
  1. `RackRoomApp`: Run TDR test on `CBL-104`, replace cable, hot-swap RAID bay 3 on `FS-SRV-01`, resolve `INC-1066`.
  2. `SiemConsoleApp`: Query `185.220.101.44`, pin logs, block IP `185.220.101.44`, revoke `svc_backup`, resolve `INC-1067`.
  3. `ChangeControlApp`: Enable HA failover on `CR-202`, attach rollback plan, request CAB approval, execute maintenance, resolve `INC-1068`, and renew `WEB-INTRA-01` TLS cert to resolve `INC-1071`.
  4. `DhcpDnsApp`: Purge rogue leases on `SCOPE-VLAN40`, update `portal.corp.local` A record to `192.168.10.202`, resolve `INC-1069`.
  5. `ScriptStudioApp`: Run `PLAYBOOK-ENG-REMEDIATE` on `OU=Engineering`, verify host exit codes, resolve `INC-1070`.
  6. `ShiftReportModal`: Open End-of-Shift report card from Taskbar, verify SLA grade and metrics display, and advance to Day 2.

- [ ] **Step 2: Run full Playwright suite**
  Run: `npx playwright test`
  Expected: All tests PASS.

- [ ] **Step 3: Build production bundle and deploy to Cloudflare Pages**
  Run: `npm run build && npx wrangler pages deploy dist --project-name=it-ops-simulator --commit-dirty=true`
  Expected: Live deployment succeeds.

- [ ] **Step 4: Commit Task 8**
  Run: `git add e2e/game.spec.ts && git commit -m "test(e2e): add full E2E suite for NOC expansion features"`
