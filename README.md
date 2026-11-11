# IT Ops Simulator

A realistic, browser-based IT Operations and System Administration simulation game.

You work as a Systems Support Engineer for a fictional company with 50 employees across Executive, Finance, Sales, Engineering, Human Resources, and Marketing departments, along with datacenter servers, core/distribution switches, network printers, and an enterprise border gateway router (61 total simulated network nodes).

Rather than clicking a generic button like "Fix DNS", you investigate and repair the actual simulated configuration across a persistent, interconnected network state.

---

## Core Systems & Features

1. **Persistent Unified Network Engine**
   - 61 simulated network hosts (50 employee workstations, 4 datacenter servers, 3 switches, 3 network printers, 1 router/firewall).
   - Real routing, subnet masks, default gateways, and DNS resolvers.
   - Public DNS fallback (`8.8.8.8`, `1.1.1.1`) and Gateway subnet validation.
   - Real-time global propagation: Changing DNS on DC-SRV-01 or DHCP scopes impacts all client workstations immediately.

2. **Virtual Desktop & Window Manager**
   - Windows 11-style enterprise desktop OS with full 8-direction window resizing (E, W, S, N, SE, SW, NE, NW), double-click maximize, and z-index focus stacking.
   - Windows Taskbar with active application pills, system clock, live network indicator, audio toggle, and career level.
   - Windows Start Menu with instant search, pinned IT utilities, and player status.

3. **PowerShell & CMD Diagnostic Terminal**
   - Interactive shell with quote-aware argument parsing:
     - `ipconfig [/all | /release | /renew | /flushdns]`
     - `ping <host | ip> [-n count]`
     - `nslookup <domain> [dns_server]`
     - `tracert <host | ip>`
     - `arp -a`
     - `netstat [-ano]`
     - `route print`
     - `tasklist | Get-Process`
     - `taskkill /pid <id> /f` & `taskkill /im <name> /f`
     - `Test-NetConnection -ComputerName <host> -Port <p>`
     - `curl <url> | Invoke-WebRequest`
     - `systeminfo`
     - `whoami` & `hostname`
     - `net user [username] [/active:yes]`
     - `net group <group> <user> /add`
     - `net view` & `dir`
     - `Get-Service`, `Start-Service`, `Restart-Service`, `Stop-Service`
     - `Get-NetIPConfiguration` & `Set-DnsClientServerAddress`
     - `gpupdate /force`

4. **Remote Desktop (RDP) Client**
   - Connect directly to any employee computer or server rack over virtual RDP (port 3389).
   - Embedded tools on remote machine:
     - Remote PowerShell Terminal
     - IPv4 Network Adapter Properties (DHCP vs Static, IP, Subnet Mask, Default Gateway, Preferred & Alternate DNS)
     - Remote Task Manager (CPU/Memory telemetry & process termination)
     - Remote Device Manager (hardware adapter enable/disable)
     - Remote Services Console
     - Remote Windows Event Viewer

5. **Task Manager (`taskmgr.exe`)**
   - Real-time CPU, RAM, and total process telemetry.
   - Inspect processes on any workstation or datacenter server.
   - Identify and terminate rogue binaries (e.g. `xmrig_miner.exe` on production database server).

6. **Device Manager (`devmgmt.msc`)**
   - Hardware inventory across Network Adapters, Disk Drives, Display Adapters, and Print Queues.
   - Enable / disable network interfaces, with immediate synchronization to link state and packet routing.

7. **Active Directory Users & Computers (`dsa.msc`)**
   - Domain tree navigation (`CORP.LOCAL`) with Organizational Units (Executive, Finance, Engineering, Sales, HR, Marketing, IT).
   - Unlock locked domain user accounts.
   - Reset expired passwords.
   - Manage domain security groups (e.g. grant `Payroll Access` to HR employees).

8. **File Explorer & Network Shares**
   - Browse `\\FS-SRV-01` corporate shares: `Finance`, `Engineering`, `Payroll`, `Public`, `Executive`.
   - Access Control List (ACL) security group permission inspector.
   - Test network drive mount connectivity under different employee credentials.

9. **Wireshark Packet Analyzer**
   - Real-time packet capture stream on simulated interface `eth0`.
   - Filter by protocol (`DNS`, `ICMP`, `DHCP`, `ARP`, `HTTP`, `TCP`).
   - Deep frame inspection (Ethernet II, IPv4, Transport layer, Payload).

10. **Interactive Network Topology Map**
    - 61-node visual map grouped by VLAN (VLAN 10 Infrastructure, VLAN 20 General, VLAN 30 Engineering, VLAN 40 Executive).
    - Real-time link health indicators (green = healthy, amber/red = configuration alert / packet collision).
    - Click any node to inspect telemetry (IP, MAC, Gateway, DNS, CPU, RAM) or launch RDP.

11. **Router & Firewall Web Admin GUI (`https://192.168.1.1`)**
    - Configure DHCP scopes, Option 006 DNS server, upstream DNS forwarders (e.g. 8.8.8.8, 1.1.1.1).
    - Firewall packet filtering and blocked outbound egress ports (e.g. unblock port 443 HTTPS).

12. **Datacenter Services Console (`services.msc`)**
    - Direct control of DNS, DHCP, Active Directory, and Print Spooler daemons.

13. **Windows Event Viewer (`eventvwr.msc`)**
    - Audit system logs, security logon failures (Event ID 4625), DNS Client warnings (Event ID 1014), and service crashes (Event ID 7034).

14. **Career Progression & Tech Store**
    - Earn XP and Cash (in South African Rand `R`, matching ticket bounties).
    - Climb ranks: Helpdesk Support Specialist (Lvl 1) -> Junior SysAdmin (Lvl 2) -> Network Systems Engineer (Lvl 3) -> Senior Infrastructure Architect (Lvl 4) -> IT Operations Director (Lvl 5).
    - Purchase hardware upgrades: Wireshark Packet Analyzer, Dual 4K Monitors, Fluke Enterprise Cable Tester, and an Espresso Machine that boosts ticket SLA patience.

15. **Rich Handcrafted & Procedural Ticket System**
    - Category filtering: Network, Active Directory, Servers, Hardware, Security.
    - INC-1042: Sarah Mitchell (Finance) - DNS resolution timeout
    - INC-1043: Liam Kumar (DevOps) - Active Directory account lockout
    - INC-1044: Sofia Rossi (Engineering) - Static IP conflict with network printer
    - INC-1048: Elena Klein (Executive) - Print Spooler daemon crash
    - INC-1052: Clara Jones (Marketing) - Network adapter disabled in Device Manager
    - INC-1054: Marcus Sterling (CFO) - Domain password expired
    - INC-1055: Natalie Bishop (HR) - Missing Payroll share permission group
    - INC-1058: Monitoring Alert - Production SQL database server rogue crypto miner process
    - Procedural shift generator for infinite day progression!

---

## Quick Start

### Development Mode
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Run Simulation Test Suite
```bash
npx tsx scripts/verify-sim.ts
```
