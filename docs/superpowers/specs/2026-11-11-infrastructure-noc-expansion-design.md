# Enterprise Infrastructure & NOC Expansion Suite - Design Document

**Date:** 2026-11-11  
**Project:** IT Ops Simulator  
**Status:** Approved for Implementation Planning

---

## 1. Intent & The Why

IT Ops Simulator currently models endpoint troubleshooting, Active Directory, phishing/EDR security, Group Policy, backups, VoIP calls, and desktop hardware bench repairs. To elevate the game into a full Network Operations Center (NOC) and Senior Infrastructure Architect experience, players need:
1. **Physical Server Rack & Patch Panel Room (`RackRoomApp`)**: Layer-1 physical infrastructure puzzle mechanics (tracing RJ45/Fiber patch panels to switch ports, recrimping degraded Cat6 cables failing TDR attenuation checks, hot-swapping failed RAID drives in 42U server bays, and switching UPS battery bypass during brownouts).
2. **SIEM Log Correlation & Threat Hunting (`SiemConsoleApp`)**: Splunk/ELK-style query console (`source="firewall" OR source="ad_auth" status="FAIL"`) to correlate multi-host attack chains and add IOCs (Indicators of Compromise) to investigation cases.
3. **Change Management & Maintenance Windows (`ChangeControlApp`)**: ITIL Change Advisory Board (CAB) workflow where rebooting production servers or modifying core firewall rules without an approved Emergency Change Request (ECR) or active failover replica triggers SLA penalties.
4. **Procedural Shift Events & End-of-Shift Post-Mortem**: Dynamic mid-shift curveballs (ISP BGP leak, expired TLS certificate on `WEB-INTRA-01`, UPS power brownout) plus an End-of-Shift Report Card (`S` to `F` SLA rating, uptime %, bonus payouts, next-day promotion progression).
5. **DHCP Scope & DNS Zone Manager (`DhcpDnsApp`)**: Dedicated MMC snap-in (`dhcpmgmt.msc` / `dnsmgmt.msc`) to clear rogue DHCP lease exhaustion, bind static MAC reservations for network printers, and repair corrupted `A`, `CNAME`, `MX`, and `TXT` records in the `corp.local` zone.
6. **PowerShell / Bash Automation Studio (`ScriptStudioApp`)**: Script IDE where players select or write multi-step remediation playbooks (bulk AD unlock, fleet-wide DNS cache flush, IOC hash purge) and execute them against target subnets or host groups.

---

## 2. Goals, Non-Goals, and Anti-Goals

### Goals
- Build all 6 subsystems with deterministic TypeScript simulation engines (`src/simulation/`) and interactive React UI windows (`src/components/apps/`).
- Add 6 new puzzle-first incident tickets (`INC-1066` through `INC-1071`) that require cross-tool investigation without hand-holding spoilers.
- Connect all 6 subsystems to `ticketEngine`, `Taskbar`, `StartMenu`, `HelpDocsApp`, and `App.tsx`.
- Verify every engine and UI workflow with automated Playwright E2E tests.

### Non-Goals
- External backend dependencies or real shell execution.
- Freeform arbitrary code eval (`eval()`) in Script Studio; scripts use a structured command parser/interpreter against the simulated domain state.

### Anti-Goals
- Direct solution spoilers in ticket descriptions. Tickets must describe user-visible symptoms and require diagnostic inspection in the new consoles.

---

## 3. Subsystem Specifications

### 3.1 Physical Server Rack & Patch Panel Room (`RackRoomApp`)
- **Window ID**: `rack-room` (Icon: 🗄️)
- **Engine**: `src/simulation/rackEngine.ts`
- **Features**:
  - 42U Rack schematic containing `PP-01 (24-Port Cat6 Patch Panel)`, `SW-CORE-01`, `DC-SRV-01`, `FS-SRV-01`, `SQL-PROD-01`, and `APC-UPS-3000VA`.
  - **Cable TDR Tester & Patch Matrix**: Inspect patch cords (`CBL-101` to `CBL-106`). `CBL-104` (`PP-01 Port 18 -> SW-EDGE-01 Gi0/18` serving `PC-SALES-02`) has `Crosstalk / Split Pair (Attenuation 48dB)` and must be recrimped/replaced and patched into `SW-EDGE-01 Gi0/18`.
  - **RAID Hot-Swap Bays**: `FS-SRV-01` RAID-5 array shows `Degraded (Bay 3 Drive Fault - S.M.A.R.T. Error)`. Player pulls faulty SAS drive and inserts spare hot-swap drive to trigger RAID rebuild (`Healthy`).
  - **UPS Battery Telemetry**: Displays input line voltage, battery charge %, load %, and `Enable Online Double-Conversion / Bypass` toggle.
  - **Linked Ticket**: `INC-1066` (Storage array degraded alert on `FS-SRV-01` & Sales drop due to bad patch cable `CBL-104`).

### 3.2 SIEM Log Correlation & Threat Hunting (`SiemConsoleApp`)
- **Window ID**: `siem-console` (Icon: 📊)
- **Engine**: `src/simulation/siemEngine.ts`
- **Features**:
  - Search & Filter Query Bar supporting filter tokens: `source=firewall|ad_auth|dns|edr|smb`, `severity=INFO|WARN|CRITICAL`, `host=<id>`, `ip=<ip>`, or free-text search.
  - Seeded multi-stage attack log trail (~25 realistic log events): External VPN brute-force from `185.220.101.44` against `svc_backup` -> successful login -> SMB lateral movement to `SQL-PROD-01` -> suspicious scheduled task `schtasks /create /tn "SysUpdate"`.
  - **Correlation Case Builder**: Pin suspicious log events to an Incident Case, flag the attacker IP (`185.220.101.44`) and compromised service account (`svc_backup`), and click `Block IOC & Revoke Token`.
  - **Linked Ticket**: `INC-1067` (SIEM anomaly alert: Unusual off-hours authentication spikes and lateral traffic; correlate the attacker IP and compromised account).

### 3.3 Change Management & CAB Console (`ChangeControlApp`)
- **Window ID**: `change-control` (Icon: 📋)
- **Engine**: `src/simulation/changeEngine.ts`
- **Features**:
  - Change Request Queue (`CR-201` to `CR-204`) showing Risk Level, Target Asset (`SQL-PROD-01`, `RTR-CORE-01`, `DC-SRV-01`), Maintenance Window, Rollback Plan status, and CAB Approval state (`Draft`, `Pending CAB`, `Approved`, `Completed`, `Violated`).
  - **Pre-Flight Check & Approval**: To approve `CR-202` (Core SQL Production Cluster Kernel Patch & Reboot on `SQL-PROD-01`), player must first enable `High-Availability Replica Failover (SQL-REPLICA-02)` and attach a valid Rollback Plan, then request CAB Approval (`Approved`) and execute the scheduled maintenance window.
  - **Unauthorized Change Guard**: Performing high-risk maintenance without an approved Change Request flags a Change Violation.
  - **Linked Ticket**: `INC-1068` (Execute zero-downtime emergency kernel maintenance `CR-202` on `SQL-PROD-01` with replica failover and CAB sign-off).

### 3.4 DHCP Scope & DNS Zone Manager (`DhcpDnsApp`)
- **Window ID**: `dhcp-dns` (Icon: 🌐)
- **Engine**: `src/simulation/dhcpDnsEngine.ts`
- **Features**:
  - **DHCP Scopes Tab**: VLAN 10, 20, 30, 40 scopes. VLAN 40 (`192.168.40.0/24` - Sales) is at `100% Lease Exhaustion` due to rogue IoT/test container MAC leases (`00:DE:AD:BE:EF:*`). Actions: `Purge Rogue Leases`, `Expand Scope Pool`, and `Create Static MAC Reservation` (`PRN-FIN-01` -> `192.168.10.250`).
  - **DNS Zone Editor (`corp.local`) Tab**: Inspect and edit `A`, `CNAME`, `MX`, and `TXT` records. `portal.corp.local` (`A` record) is pointing to stale dead IP `192.168.10.99` instead of `WEB-INTRA-01` (`192.168.10.202`). Player updates record or adds missing record and increments SOA serial.
  - **Linked Ticket**: `INC-1069` (Sales VLAN 40 unable to obtain DHCP leases & internal `portal.corp.local` resolving to dead host).

### 3.5 PowerShell / Bash Automation Studio (`ScriptStudioApp`)
- **Window ID**: `script-studio` (Icon: ⚡)
- **Engine**: `src/simulation/scriptEngine.ts`
- **Features**:
  - Code editor with playbook templates and custom command pipeline support (`Clear-DnsClientCache`, `Unlock-ADAccount`, `Stop-RemoteProcess`, `Reset-SpoolerService`, `Set-FirewallBlockRule`).
  - Target selector (`OU=Finance`, `OU=Engineering`, `OU=Sales`, `All Workstations`, `All Servers`).
  - Execution console showing host-by-host stdout results, exit codes (`0` success), and remediation summary.
  - **Linked Ticket**: `INC-1070` (Domain-wide stale DNS cache and locked service tokens across Engineering subnet; run automated fleet remediation playbook `PLAYBOOK-ENG-REMEDIATE` across `OU=Engineering`).

### 3.6 Procedural Shift Events & End-of-Shift Post-Mortem
- **Engine**: `src/simulation/shiftEventEngine.ts`
- **Component**: `src/components/desktop/ShiftReportModal.tsx`
- **Features**:
  - **Live Shift Events**: Triggerable or timed mid-shift infrastructure emergencies (e.g., `EVT-SSL-EXPIRED` on `WEB-INTRA-01` requiring TLS certificate renewal, `EVT-UPS-BROWNOUT` requiring UPS battery switchover).
  - **End-of-Shift Report Card Modal**: Accessible via Taskbar "End Shift / Report" button or when shift timer reaches `0:00`. Displays SLA Grade (`S`, `A`, `B`, `C`, `F`), Tickets Resolved, Mean Time to Resolution, Infrastructure Uptime %, XP/Cash bonuses, and "Start Next Shift (Day N+1)" action.
  - **Linked Ticket**: `INC-1071` (Urgent TLS/SSL Certificate Expired on `WEB-INTRA-01` blocking HTTPS intranet logins).
