# Advanced IT Operations Feature Suite - Design Document

**Date:** 2026-11-11  
**Project:** IT Ops Simulator  
**Status:** Approved for Implementation Planning

---

## 1. Intent & The Why

IT Ops Simulator simulates a 50-workstation enterprise domain with routers, switches, DHCP, DNS, and Active Directory. Players currently resolve network misconfigurations and rogue processes. To match real-world system administration depth and the benchmark bar set by Steam's *IT Specialist Simulator*, the simulator needs core enterprise IT vectors:
1. **Phishing & Email Security**: Ingesting forward-reported suspicious emails, analyzing raw headers (SPF, DKIM, DMARC), and blocking malicious senders.
2. **EDR & Endpoint Protection**: Centralized security telemetry (Defender/CrowdStrike style) with host network isolation and threat remediation.
3. **Outbreak Dynamics**: A spreading ransomware mechanic where infected nodes propagate encrypting SMB shares unless quarantined within an SLA countdown.
4. **Group Policy Management**: Domain and OU GPO deployment affecting client behavior (USB restrictions, drive mappings, password rules).
5. **Disaster Recovery**: Instant snapshot creation and restore points for corrupted database tables and encrypted network shares.
6. **VoIP Softphone & Audio Calls**: Interactive incoming phone calls with dynamic dialogue trees to extract diagnostic clues before remoting in.
7. **Hardware Workbench**: Component-level diagnostics (POST error codes, bad RAM, dead PSU, dried thermal paste) for machines brought to the IT bench.

---

## 2. Goals, Non-Goals, and Anti-Goals

### Goals
- Deliver all 7 modular subsystems with simulated state engines and authentic UI applications.
- Seamlessly connect each subsystem to the central `networkEngine`, in-game ticketing queue, and career progression (XP, cash, level unlocks).
- Provide interactive audio feedback (VoIP phone ring, alert sirens for outbreaks, hardware click/POST beeps).
- Ensure 100% test coverage through Playwright test suites verifying all newly created workflows.
- Retain existing responsive window manager capabilities (z-index stacking, minimize/restore, clean unmount on close).

### Non-Goals
- Real internet network sockets or real malware execution (all simulation remains browser-sandboxed).
- Full 3D rendering of computer cases (workbench uses rich 2D interactive blueprint schematic style).

### Anti-Goals
- Simple "one-click button to fix everything" gameplay. Every action requires diagnostic inspection (e.g., checking DKIM header failure, reading POST code 55, linking the correct GPO to OU).
- Spoiler walkthroughs in ticket views. Direct answers like "Change DNS to 192.168.10.200" or "Unlock Liam Kumar" must not be displayed by default. Clues must feel earned through investigation, diagnostic commands, and VoIP phone calls.

---

## 3. Subsystem Specifications

### 3.8 Puzzle Investigation & Clue System (Anti-Spoiler Overhaul)
- **Problem**: Ticket hints previously gave the exact solution ("Open Task Manager and kill xmrig_miner.exe").
- **Design Overhaul**:
  - Tickets only show realistic user statements, error codes, and symptoms (e.g., "The server is running boiling hot and queries are timing out", "My monitor says the network cable is unplugged but the wire is in").
  - Clues are extracted interactively:
    - Running diagnostic commands (`nslookup`, `ping`, `ipconfig /all`, `netstat`, `tasklist`).
    - Asking the right questions on the VoIP Softphone.
    - Inspecting Wireshark packet drops.
  - Optional Senior Sysadmin Clue: Collapsed by default. Player can reveal it for a minor penalty (-25 XP), and it gives a directional clue (e.g., "Review running processes by CPU load on the database node") rather than the exact command.
  - SOP Handbook (`help-docs`): Clean reference manual (OSI layer troubleshooting flow, CLI syntax, VLAN maps, POST code chart) with zero scenario spoilers.

### 3.1 Interactive Email Client (`outlook.exe`)
- **Window ID**: `email-client` (Icon: ✉️)
- **Features**:
  - Folder list: Inbox (Reported Phishing, IT Announcements), Junk, Quarantined.
  - Message preview: Sender, Subject, Date, Body, Attachments (`invoice.xlsm`, `payroll.pdf.exe`).
  - Raw Header Inspector modal: `Authentication-Results`, `spf=fail`, `dkim=neutral`, `Return-Path`, `X-Originating-IP`.
  - Actions: `Quarantine Message`, `Block Sender Domain`, `Mark Safe`, `Forward to Security Incident Response`.
  - Resolution effect: Quarantining phishing emails completes security tickets and updates domain firewall filters.

### 3.2 EDR & Endpoint Protection Console (`edr.msc`)
- **Window ID**: `edr-console` (Icon: 🛡️)
- **Features**:
  - Fleet Health Dashboard: 61 nodes monitored (Total Clean, Suspicious, Isolated, Infected).
  - Telemetry Table: Timestamp, Host, Process Name, Hash, Detection Rule (e.g. `Mimikatz.LSA.Injection`, `CobaltStrike.Beacon`, `Ransomware.FileEntropy`).
  - Actions:
    - `Isolate Node`: Blocks all traffic to/from host except IT admin management VLAN.
    - `Terminate Threat`: Kills malicious process tree across fleet.
    - `Quarantine File`: Removes malicious payload from file system.
    - `Update Threat Signatures`: Deploys latest domain virus definitions (+security rating).

### 3.3 Live Ransomware Outbreak Incident Engine
- **Engine**: `src/simulation/outbreakEngine.ts`
- **Features**:
  - Triggered procedural incident: An employee opens an attachment, starting an infection countdown.
  - Lateral Movement: Malicious process crawls mapped SMB shares (`\\FS-SRV-01\Finance`, `\Engineering`) encrypting files into `.locked` extensions every 20 seconds.
  - Visual alert banner in Taskbar and emergency siren audio toggle.
  - Countermeasures: Player must isolate patient zero host in EDR or router switch port, terminate process, and restore files from Backup Manager.

### 3.4 Group Policy Management Console (`gpmc.msc`)
- **Window ID**: `group-policy` (Icon: 📜)
- **Features**:
  - Tree structure: `corp.local` -> OUs (`Finance`, `Engineering`, `Sales`, `Executive`, `Servers`, `Domain Controllers`).
  - GPO Objects: `Default Domain Policy`, `Workstation Hardening GPO`, `Department Drive Mapping GPO`, `USB Storage Restriction GPO`.
  - Configurable Settings:
    - Removable Storage Devices: `Allowed` vs `Deny Read/Write Access`.
    - Drive Maps: `F: -> \\FS-SRV-01\Finance`, `Z: -> \\FS-SRV-01\Public`.
    - Account Lockout Threshold: `3 attempts` / `5 attempts` / `Unlimited`.
    - Windows Script Host: `Enabled` vs `Disabled`.
  - Applying GPOs executes domain policy updates, modifying client configurations and resolving policy tickets.

### 3.5 Backup & Disaster Recovery Manager (`veeam.exe`)
- **Window ID**: `backup-manager` (Icon: 💾)
- **Features**:
  - Target server list: `DC-SRV-01`, `FS-SRV-01`, `SQL-PROD-01`, `WEB-INTRA-01`.
  - Snapshot Repository: List of restore points with creation time, size, and health status.
  - Actions:
    - `Run Instant Snapshot`: Takes point-in-time snapshot of selected server.
    - `Restore Network Share`: Restores corrupted or encrypted files on `\\FS-SRV-01`.
    - `Rollback SQL Database`: Restores relational SQL database state after query blunders or ransomware.

### 3.6 Interactive VoIP Softphone
- **Window ID**: `voip-phone` (Icon: ☎️)
- **Features**:
  - Softphone interface: dial pad, active call status, employee directory search.
  - Incoming Call Popup: Ringer chime audio, caller card with name, department, profile photo, and priority badge.
  - Dialogue Tree: Multi-choice responses (e.g. "Can you read me the exact error number?", "Did this start after yesterday's update?", "Please check if the link light on your wall jack is solid green").
  - Reveal Clues: Selecting correct troubleshooting questions adds hidden technical notes directly to the linked ticket in Helpdesk Queue!

### 3.7 Hardware Workbench & Repair Lab
- **Window ID**: `hardware-bench` (Icon: 🔧)
- **Features**:
  - Interactive motherboard schematic with clickable sockets:
    - CPU Socket: Inspect thermal paste status (Dried/Overheating, Fresh) and heatsink mounting.
    - RAM DIMM Slots: Slot 1 & 2 DDR5 sticks (Good, Defective/POST 55, Unseated).
    - Storage Bay: NVMe M.2 / SATA (Healthy, Bad Sectors, Disconnected Cable).
    - Power Supply (PSU): 24-pin ATX voltage tester (12V, 5V, 3.3V rails).
    - Network NIC: PCIe card seated status.
  - Diagnostic POST Code LED: 7-segment digital display showing BIOS POST codes (e.g., `00` Normal, `55` Memory not detected, `99` Super IO, `FF` CPU Error).
  - Inventory Parts Shelf: Replacement DDR5 sticks, fresh thermal paste tube, replacement 650W PSU, spare SSDs.
  - Repair verification: Power on virtual rig, verify POST pass, and ship repaired PC back to user.

---

## 4. Technical Architecture & File Layout

```
src/
├── types/
│   ├── mail.ts          # Email, headers, attachments, spam scores
│   ├── security.ts      # EDR detections, isolation status, threat rules
│   ├── gpo.ts           # GPO objects, linked OUs, policy settings
│   ├── backup.ts        # Snapshots, backup jobs, restore targets
│   ├── phone.ts         # Phone calls, dialogue trees, clue extraction
│   └── hardware.ts      # PC workbench components, POST codes, multimeter
├── simulation/
│   ├── mailEngine.ts       # Email storage, header verification, quarantine
│   ├── securityEngine.ts   # EDR telemetry, host isolation, threat mitigation
│   ├── outbreakEngine.ts   # Live ransomware Lateral spreading loop
│   ├── gpoEngine.ts        # Group policy compilation & inheritance
│   ├── backupEngine.ts     # Snapshot retention, file restoration
│   ├── phoneEngine.ts      # Call simulation, dialogue state, audio synth
│   └── hardwareEngine.ts   # Component testing, voltage rails, POST codes
├── components/
│   └── apps/
│       ├── EmailClientApp.tsx
│       ├── EdrConsoleApp.tsx
│       ├── GroupPolicyApp.tsx
│       ├── BackupManagerApp.tsx
│       ├── VoipPhoneApp.tsx
│       └── HardwareWorkbenchApp.tsx
```

---

## 5. Verification Bar
- All existing 9 Playwright tests must remain green.
- Add comprehensive end-to-end Playwright tests covering each new application and workflow:
  1. Inspecting raw DKIM/SPF headers and quarantining phishing email.
  2. Isolating a compromised host and killing trojan in EDR.
  3. Deploying a Group Policy Object and verifying client policy update.
  4. Taking a server snapshot and restoring corrupted share in Backup Manager.
  5. Answering VoIP call, picking correct diagnostic branches, and unlocking ticket clue.
  6. Diagnosing bad RAM / POST 55 on Hardware Workbench and successfully POSTing rig.
- Production build (`npm run build`) and Cloudflare Pages deployment verification.
