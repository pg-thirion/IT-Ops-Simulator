import React from 'react';
import {
  BookOpen,
  Layers,
  Hash,
  Terminal,
  Cpu,
  ShieldCheck,
  Server,
  ShieldAlert,
  ClipboardCheck,
  Globe,
  Code2,
} from 'lucide-react';

export const HelpDocsApp: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-[#12151c] text-slate-100 select-text overflow-y-auto p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-slate-700/60 pb-4">
          <div className="flex items-center space-x-2 text-sky-400 mb-1">
            <BookOpen size={20} />
            <span className="text-xs font-bold uppercase tracking-wider">
              Engineering Standard Operating Procedures
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-100">
            Enterprise IT Operations &amp; Diagnostic Reference Manual
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Standard troubleshooting methodology, diagnostic syntax, transport protocols, and hardware POST references.
          </p>
        </div>

        {/* Section 1: OSI Layer Troubleshooting Methodology */}
        <div className="bg-[#181c25] border border-slate-700/60 rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
            <Layers size={16} className="text-indigo-400" />
            <span>OSI 7-Layer Troubleshooting Methodology</span>
          </h2>
          <p className="text-xs text-slate-400">
            Follow a structured bottom-up or divide-and-conquer approach to isolate failure domains before changing configurations.
          </p>

          <div className="space-y-2 text-xs">
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between font-bold text-slate-200 mb-1">
                <span className="text-indigo-300">Layer 1 — Physical Layer</span>
                <span className="font-mono text-[10px] text-slate-400">Cables, Transceivers, Link LEDs, Power</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Verify link carrier signals and physical RJ-45 seating. Check switch and NIC activity LEDs. Inspect wall drops for cable pinch or interference from high-voltage conduit.
              </p>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between font-bold text-slate-200 mb-1">
                <span className="text-blue-300">Layer 2 — Data Link Layer</span>
                <span className="font-mono text-[10px] text-slate-400">Ethernet, MAC, ARP, VLANs, Duplex</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Inspect local ARP tables (<code className="text-emerald-400">arp -a</code>) for MAC resolution. Verify access switch port VLAN assignments, trunk encapsulation, and duplex mismatch (e.g. half vs full causing late collisions).
              </p>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between font-bold text-slate-200 mb-1">
                <span className="text-teal-300">Layer 3 — Network Layer</span>
                <span className="font-mono text-[10px] text-slate-400">IP Addressing, Subnet Masks, Default Gateways, ICMP</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Check host IP configuration (<code className="text-emerald-400">ipconfig /all</code>). Identify APIPA autoconfig ranges (169.254.0.0/16) indicative of DHCP starvation. Verify ping reachability to local gateway and inter-VLAN subnets.
              </p>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between font-bold text-slate-200 mb-1">
                <span className="text-emerald-300">Layer 4 — Transport Layer</span>
                <span className="font-mono text-[10px] text-slate-400">TCP, UDP, Port Filtering, State Tables</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Verify listening sockets (<code className="text-emerald-400">netstat -an</code>). Test transport reachability against firewall access control lists (ACLs) to detect dropped SYN packets.
              </p>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between font-bold text-slate-200 mb-1">
                <span className="text-amber-300">Layers 5-7 — Session, Presentation &amp; Application</span>
                <span className="font-mono text-[10px] text-slate-400">DNS, TLS, Kerberos, SMB, HTTP/S, AD</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Inspect DNS forward and reverse lookups (<code className="text-emerald-400">nslookup</code>). Verify Active Directory domain trusts, Kerberos ticket expiration, SMB file share ACL permissions, and service daemon running states.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Standard Enterprise TCP/UDP Ports Reference */}
        <div className="bg-[#181c25] border border-slate-700/60 rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
            <Hash size={16} className="text-sky-400" />
            <span>Standard Transport Ports Reference</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-700/80 text-slate-400 uppercase text-[10px] font-mono">
                  <th className="py-2 pr-3">Port</th>
                  <th className="py-2 pr-3">Protocol</th>
                  <th className="py-2 pr-3">Service Name</th>
                  <th className="py-2">Operational Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr>
                  <td className="py-1.5 font-mono text-amber-300 font-bold">20 / 21</td>
                  <td className="py-1.5 font-mono text-slate-400">TCP</td>
                  <td className="py-1.5 font-semibold text-slate-200">FTP</td>
                  <td className="py-1.5 text-slate-400">File Transfer Protocol (Data / Control)</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-mono text-emerald-400 font-bold">22</td>
                  <td className="py-1.5 font-mono text-slate-400">TCP</td>
                  <td className="py-1.5 font-semibold text-slate-200">SSH / SFTP</td>
                  <td className="py-1.5 text-slate-400">Secure Shell encrypted remote administration</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-mono text-sky-400 font-bold">25</td>
                  <td className="py-1.5 font-mono text-slate-400">TCP</td>
                  <td className="py-1.5 font-semibold text-slate-200">SMTP</td>
                  <td className="py-1.5 text-slate-400">Simple Mail Transfer Protocol relay</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-mono text-purple-400 font-bold">53</td>
                  <td className="py-1.5 font-mono text-slate-400">TCP / UDP</td>
                  <td className="py-1.5 font-semibold text-slate-200">DNS</td>
                  <td className="py-1.5 text-slate-400">Domain Name System recursive and authoritative resolution</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-mono text-indigo-400 font-bold">67 / 68</td>
                  <td className="py-1.5 font-mono text-slate-400">UDP</td>
                  <td className="py-1.5 font-semibold text-slate-200">DHCP</td>
                  <td className="py-1.5 text-slate-400">Dynamic Host Configuration Protocol (Server: 67, Client: 68)</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-mono text-amber-400 font-bold">80</td>
                  <td className="py-1.5 font-mono text-slate-400">TCP</td>
                  <td className="py-1.5 font-semibold text-slate-200">HTTP</td>
                  <td className="py-1.5 text-slate-400">Hypertext Transfer Protocol unencrypted web traffic</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-mono text-pink-400 font-bold">88</td>
                  <td className="py-1.5 font-mono text-slate-400">TCP / UDP</td>
                  <td className="py-1.5 font-semibold text-slate-200">Kerberos</td>
                  <td className="py-1.5 text-slate-400">Active Directory domain authentication tickets (TGT / TGS)</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-mono text-teal-400 font-bold">123</td>
                  <td className="py-1.5 font-mono text-slate-400">UDP</td>
                  <td className="py-1.5 font-semibold text-slate-200">NTP</td>
                  <td className="py-1.5 text-slate-400">Network Time Protocol clock synchronization</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-mono text-blue-400 font-bold">389 / 636</td>
                  <td className="py-1.5 font-mono text-slate-400">TCP / UDP</td>
                  <td className="py-1.5 font-semibold text-slate-200">LDAP / LDAPS</td>
                  <td className="py-1.5 text-slate-400">Lightweight Directory Access Protocol queries</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-mono text-emerald-400 font-bold">443</td>
                  <td className="py-1.5 font-mono text-slate-400">TCP</td>
                  <td className="py-1.5 font-semibold text-slate-200">HTTPS / TLS</td>
                  <td className="py-1.5 text-slate-400">Encrypted web traffic and corporate portal services</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-mono text-yellow-400 font-bold">445</td>
                  <td className="py-1.5 font-mono text-slate-400">TCP</td>
                  <td className="py-1.5 font-semibold text-slate-200">SMB</td>
                  <td className="py-1.5 text-slate-400">Server Message Block Windows file shares and named pipes</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-mono text-rose-400 font-bold">1433</td>
                  <td className="py-1.5 font-mono text-slate-400">TCP</td>
                  <td className="py-1.5 font-semibold text-slate-200">MSSQL</td>
                  <td className="py-1.5 text-slate-400">Microsoft SQL Server relational database engine</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-mono text-cyan-400 font-bold">3389</td>
                  <td className="py-1.5 font-mono text-slate-400">TCP / UDP</td>
                  <td className="py-1.5 font-semibold text-slate-200">RDP</td>
                  <td className="py-1.5 text-slate-400">Remote Desktop Protocol terminal server sessions</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Diagnostic Command-Line Syntax */}
        <div className="bg-[#181c25] border border-slate-700/60 rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
            <Terminal size={16} className="text-emerald-400" />
            <span>Diagnostic Command Line Syntax</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 font-mono">
              <span className="text-emerald-400 font-bold block mb-1">ipconfig [/all | /renew | /flushdns]</span>
              <span className="text-slate-400 text-[11px] font-sans">
                Inspects network adapters, requests fresh DHCP lease from pool, or flushes local client resolver cache.
              </span>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 font-mono">
              <span className="text-emerald-400 font-bold block mb-1">ping [-t | -n count] &lt;host|ip&gt;</span>
              <span className="text-slate-400 text-[11px] font-sans">
                Sends ICMP Echo Requests to verify Layer 3 round-trip reachability and measure packet loss.
              </span>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 font-mono">
              <span className="text-emerald-400 font-bold block mb-1">nslookup &lt;fqdn&gt; [dns_server]</span>
              <span className="text-slate-400 text-[11px] font-sans">
                Queries configured or specific DNS nameserver for A, AAAA, MX, or TXT records.
              </span>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 font-mono">
              <span className="text-emerald-400 font-bold block mb-1">tracert [-d] &lt;target_ip&gt;</span>
              <span className="text-slate-400 text-[11px] font-sans">
                Traces route hops using increasing TTL packets to isolate gateway and router transit latency.
              </span>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 font-mono">
              <span className="text-emerald-400 font-bold block mb-1">taskkill /pid &lt;id&gt; /f</span>
              <span className="text-slate-400 text-[11px] font-sans">
                Forces immediate termination of unresponsive, locked, or rogue user-mode processes.
              </span>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 font-mono">
              <span className="text-emerald-400 font-bold block mb-1">gpupdate /force</span>
              <span className="text-slate-400 text-[11px] font-sans">
                Refreshes and reapplies local computer and user Group Policy objects from the Active Directory Sysvol share.
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Motherboard BIOS POST Codes Reference Table */}
        <div className="bg-[#181c25] border border-slate-700/60 rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
            <Cpu size={16} className="text-orange-400" />
            <span>Motherboard BIOS POST Diagnostic Codes</span>
          </h2>
          <p className="text-xs text-slate-400">
            Motherboard 2-digit 7-segment hex display outputs representing initialization checkpoints during Power-On Self-Test.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-700/80 text-slate-400 uppercase text-[10px] font-mono">
                  <th className="py-2 pr-3">POST Code</th>
                  <th className="py-2 pr-3">Subsystem Phase</th>
                  <th className="py-2 pr-3">Diagnostic Meaning</th>
                  <th className="py-2">Standard Remediation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr>
                  <td className="py-1.5 font-mono text-emerald-400 font-bold">00 / FF</td>
                  <td className="py-1.5 text-emerald-300 font-semibold">Normal Boot</td>
                  <td className="py-1.5 text-slate-300">POST completed successfully; handoff to OS bootloader</td>
                  <td className="py-1.5 text-slate-400">No action required. System operational.</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-mono text-rose-400 font-bold">55</td>
                  <td className="py-1.5 text-rose-300 font-semibold">Memory Error</td>
                  <td className="py-1.5 text-slate-300">Memory not detected, unseated DIMM, or incompatible RAM timing</td>
                  <td className="py-1.5 text-slate-400">Reseat DIMM module, clean contacts, or replace defective stick.</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-mono text-amber-400 font-bold">D0 / 04</td>
                  <td className="py-1.5 text-amber-300 font-semibold">CPU Init</td>
                  <td className="py-1.5 text-slate-300">CPU initialization error or socket contact fault</td>
                  <td className="py-1.5 text-slate-400">Inspect CPU pins, check EPS 12V 8-pin connector, verify thermal paste.</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-mono text-sky-400 font-bold">A2 / 99</td>
                  <td className="py-1.5 text-sky-300 font-semibold">Storage / I/O</td>
                  <td className="py-1.5 text-slate-300">IDE / SATA / NVMe storage detection failure or Super I/O freeze</td>
                  <td className="py-1.5 text-slate-400">Check M.2 seating, SATA data and power cables, disconnect rogue peripherals.</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-mono text-purple-400 font-bold">B2 / 62</td>
                  <td className="py-1.5 text-purple-300 font-semibold">Video / GPU</td>
                  <td className="py-1.5 text-slate-300">Legacy Option ROM or PCIe graphics card handshake fault</td>
                  <td className="py-1.5 text-slate-400">Reseat GPU in primary PCIe x16 slot, check PCIe supplemental power.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 5: Email Authentication & Anti-Phishing Reference */}
        <div className="bg-[#181c25] border border-slate-700/60 rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
            <ShieldCheck size={16} className="text-amber-400" />
            <span>Email Authentication Standards (SPF, DKIM, DMARC)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <strong className="text-amber-300 block mb-1">SPF (Sender Policy Framework)</strong>
              <p className="text-[11px] text-slate-400">
                DNS TXT record listing IP addresses authorized to send mail on behalf of the domain. Status 'fail' indicates the connecting mail relay is unauthorized.
              </p>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <strong className="text-sky-300 block mb-1">DKIM (DomainKeys Identified Mail)</strong>
              <p className="text-[11px] text-slate-400">
                Cryptographic digital signature in message headers verified via the sender domain public key. Verifies message body integrity during transit.
              </p>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <strong className="text-emerald-300 block mb-1">DMARC Policy</strong>
              <p className="text-[11px] text-slate-400">
                Specifies recipient MTA action (none, quarantine, reject) when SPF or DKIM alignment checks fail. Ensures spoofed sender identities are isolated.
              </p>
            </div>
          </div>
        </div>

        {/* Section 6: Layer-1 Cabling TDR Attenuation & RAID-5 Hot-Swap Parity Rebuild */}
        <div className="bg-[#181c25] border border-slate-700/60 rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
            <Server size={16} className="text-indigo-400" />
            <span>Layer-1 Cabling TDR Attenuation &amp; RAID-5 Hot-Swap Parity Rebuild</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <strong className="text-indigo-300 block mb-1">
                Time-Domain Reflectometry (TDR) &amp; Attenuation (&le; 15 dB Nominal)
              </strong>
              <p className="text-[11px] text-slate-400">
                TIA/EIA-568 Cat6/Cat6A horizontal runs should exhibit insertion loss below 15.0 dB. High attenuation (&gt; 15 dB) or NEXT/FEXT near-end crosstalk indicates a split pair, pinched jacket, or unseated termination requiring cable replacement and switch port re-patching.
              </p>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <strong className="text-sky-300 block mb-1">
                RAID-5 Distributed Parity &amp; Hot-Swap Rebuild
              </strong>
              <p className="text-[11px] text-slate-400">
                RAID-5 stripes data and parity across N drives, tolerating a single drive fault in a <code className="text-rose-400">Degraded</code> state. Hot-swapping a drive with elevated S.M.A.R.T. uncorrectable sector counts triggers online parity reconstruction to restore <code className="text-emerald-400">Healthy</code> status.
              </p>
            </div>
          </div>
        </div>

        {/* Section 7: SIEM Log Query Syntax & IOC Containment */}
        <div className="bg-[#181c25] border border-slate-700/60 rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
            <ShieldAlert size={16} className="text-rose-400" />
            <span>SIEM Log Query Syntax &amp; IOC Containment</span>
          </h2>
          <p className="text-xs text-slate-400">
            Use structured key-value filters or free-text indicators to correlate multi-host intrusion chains across firewall, directory, DNS, SMB, and endpoint telemetry.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 font-mono">
              <span className="text-emerald-400 font-bold block mb-1">
                source=&lt;stream&gt; severity=&lt;level&gt; host=&lt;id&gt; ip=&lt;addr&gt; user=&lt;acct&gt;
              </span>
              <span className="text-slate-400 text-[11px] font-sans">
                Filter log streams by telemetry source (<code className="text-sky-300">firewall</code>, <code className="text-sky-300">ad_auth</code>, <code className="text-sky-300">dns</code>, <code className="text-sky-300">edr</code>, <code className="text-sky-300">smb</code>), severity (<code className="text-rose-300">INFO</code>, <code className="text-rose-300">WARN</code>, <code className="text-rose-300">CRITICAL</code>), host, source IP, or account.
              </span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <strong className="text-rose-300 block mb-1">
                Attack Chain Correlation &amp; Containment
              </strong>
              <p className="text-[11px] text-slate-400">
                Pin correlated evidence events to the active investigation case, block the external attacker IP at the perimeter firewall, and revoke compromised service account tokens to complete incident containment.
              </p>
            </div>
          </div>
        </div>

        {/* Section 8: ITIL Change Advisory Board (CAB) Pre-Flight Requirements & PKI TLS Renewal */}
        <div className="bg-[#181c25] border border-slate-700/60 rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
            <ClipboardCheck size={16} className="text-cyan-400" />
            <span>ITIL Change Advisory Board (CAB) Pre-Flight &amp; PKI TLS Renewal</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <strong className="text-cyan-300 block mb-1">
                CAB Pre-Flight Checklist (HA Failover Replica + Rollback Plan)
              </strong>
              <p className="text-[11px] text-slate-400">
                High-risk production maintenance windows require enabling a synchronized High-Availability (HA) failover replica, attaching a verified snapshot rollback plan, and obtaining formal CAB approval before execution to prevent SLA change violations.
              </p>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <strong className="text-amber-300 block mb-1">
                X.509 PKI / TLS 1.3 Certificate Lifecycle
              </strong>
              <p className="text-[11px] text-slate-400">
                Expired TLS certificates trigger browser <code className="text-rose-400">NET::ERR_CERT_DATE_INVALID</code> blocks on HTTPS listeners (TCP 443). Renew and bind updated SHA-256 RSA/ECDSA certificates in the PKI Operations panel.
              </p>
            </div>
          </div>
        </div>

        {/* Section 9: DHCP Lease Pool Exhaustion & DNS Zone Records */}
        <div className="bg-[#181c25] border border-slate-700/60 rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
            <Globe size={16} className="text-teal-400" />
            <span>DHCP Lease Pool Exhaustion &amp; DNS Zone Records</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <strong className="text-teal-300 block mb-1">
                DHCP Scope Starvation &amp; Rogue Leases
              </strong>
              <p className="text-[11px] text-slate-400">
                When a VLAN DHCP scope reaches 100% utilization due to unauthorized or rogue devices, new clients fall back to RFC 3927 APIPA (<code className="text-amber-300">169.254.x.x</code>). Purge rogue leases to reclaim pool capacity and bind static MAC reservations for infrastructure endpoints.
              </p>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <strong className="text-indigo-300 block mb-1">
                Authoritative DNS Resource Records (A, CNAME, MX, TXT, SOA Serial)
              </strong>
              <p className="text-[11px] text-slate-400">
                Verify <code className="text-emerald-400">A</code> records map hostnames to valid IPv4 addresses, <code className="text-emerald-400">CNAME</code> aliases resolve to canonical targets, <code className="text-emerald-400">MX</code>/<code className="text-emerald-400">TXT</code> records support mail routing, and zone edits increment the Start of Authority (SOA) serial number.
              </p>
            </div>
          </div>
        </div>

        {/* Section 10: PowerShell / Bash Fleet Playbook Automation Scopes */}
        <div className="bg-[#181c25] border border-slate-700/60 rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
            <Code2 size={16} className="text-amber-400" />
            <span>PowerShell / Bash Fleet Playbook Automation Scopes</span>
          </h2>
          <p className="text-xs text-slate-400">
            Execute multi-step remediation playbooks against targeted Organizational Units (<code className="text-indigo-300">OU=Engineering</code>, <code className="text-indigo-300">OU=Finance</code>, <code className="text-indigo-300">OU=Sales</code>, <code className="text-indigo-300">All Workstations</code>, <code className="text-indigo-300">All Servers</code>) to flush resolver caches, force Group Policy syncs, and rotate service tokens across entire subnets simultaneously.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HelpDocsApp;
