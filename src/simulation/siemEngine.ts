import type {
  SiemLogEntry,
  SiemInvestigationCase,
} from '../types/siem';

const INITIAL_LOGS: SiemLogEntry[] = [
  {
    id: 'LOG-1001',
    timestamp: '2026-11-11T02:11:04Z',
    source: 'firewall',
    severity: 'INFO',
    hostId: 'FW-EDGE-01',
    sourceIp: '192.168.10.15',
    eventCode: 'FW-ALLOW-443',
    message: 'Outbound HTTPS session established to update.microsoft.com:443',
    rawPayload: 'src=192.168.10.15 dst=20.190.159.2 proto=TCP dport=443 action=ALLOW',
  },
  {
    id: 'LOG-1002',
    timestamp: '2026-11-11T02:12:19Z',
    source: 'dns',
    severity: 'INFO',
    hostId: 'DC-SRV-01',
    sourceIp: '192.168.20.104',
    username: 'j.chen',
    eventCode: 'DNS-QUERY-A',
    message: 'Standard A record query for git.corp.local resolved to 192.168.20.50',
    rawPayload: 'client=192.168.20.104 qname=git.corp.local qtype=A rcode=NOERROR answer=192.168.20.50',
  },
  {
    id: 'LOG-1003',
    timestamp: '2026-11-11T02:14:02Z',
    source: 'ad_auth',
    severity: 'INFO',
    hostId: 'DC-SRV-01',
    sourceIp: '192.168.10.101',
    username: 'm.vance',
    eventCode: 'EVENT-4624',
    message: 'Kerberos TGT ticket granted for user m.vance on Finance workstation PC-FIN-01',
    rawPayload: 'EventID=4624 LogonType=3 TargetUserName=m.vance IpAddress=192.168.10.101 Status=0x0',
  },
  {
    id: 'LOG-1004',
    timestamp: '2026-11-11T02:15:10Z',
    source: 'firewall',
    severity: 'WARN',
    hostId: 'FW-EDGE-01',
    sourceIp: '185.220.101.44',
    username: 'svc_backup',
    eventCode: 'VPN-AUTH-FAIL',
    message: 'External IPsec/SSL-VPN brute force attempt failed for account svc_backup from 185.220.101.44 (attempt 14/50)',
    rawPayload: 'src=185.220.101.44 dst=203.0.113.10 proto=UDP dport=4500 user=svc_backup action=DENY reason=INVALID_PSK_OR_CRED',
  },
  {
    id: 'LOG-1005',
    timestamp: '2026-11-11T02:15:28Z',
    source: 'ad_auth',
    severity: 'WARN',
    hostId: 'DC-SRV-01',
    sourceIp: '185.220.101.44',
    username: 'svc_backup',
    eventCode: 'EVENT-4625',
    message: 'Failed NTLM authentication brute force spike against svc_backup via VPN gateway (38 failures in 30s)',
    rawPayload: 'EventID=4625 LogonType=3 TargetUserName=svc_backup WorkstationName=VPN-GW-01 IpAddress=185.220.101.44 SubStatus=0xC000006A',
  },
  {
    id: 'LOG-1006',
    timestamp: '2026-11-11T02:15:45Z',
    source: 'ad_auth',
    severity: 'CRITICAL',
    hostId: 'DC-SRV-01',
    sourceIp: '185.220.101.44',
    username: 'svc_backup',
    eventCode: 'EVENT-4625-BRUTE',
    message: 'CRITICAL: High-velocity password spray / brute force threshold exceeded for svc_backup from external IP 185.220.101.44',
    rawPayload: 'EventID=4625 LogonType=10 TargetUserName=svc_backup IpAddress=185.220.101.44 FailureCount=52 Alert=BRUTE_FORCE_THRESHOLD',
  },
  {
    id: 'LOG-1007',
    timestamp: '2026-11-11T02:16:03Z',
    source: 'ad_auth',
    severity: 'CRITICAL',
    hostId: 'DC-SRV-01',
    sourceIp: '185.220.101.44',
    username: 'svc_backup',
    eventCode: 'EVENT-4624',
    message: 'CRITICAL: Off-hours VPN login success for privileged service account svc_backup from untrusted external IP 185.220.101.44',
    rawPayload: 'EventID=4624 LogonType=10 TargetUserName=svc_backup IpAddress=185.220.101.44 AuthPackage=NTLM Status=SUCCESS',
  },
  {
    id: 'LOG-1008',
    timestamp: '2026-11-11T02:16:40Z',
    source: 'dns',
    severity: 'INFO',
    hostId: 'DC-SRV-01',
    sourceIp: '192.168.30.112',
    username: 'a.patel',
    eventCode: 'DNS-QUERY-A',
    message: 'Internal DNS lookup for files.corp.local resolved to 192.168.10.20',
    rawPayload: 'client=192.168.30.112 qname=files.corp.local qtype=A rcode=NOERROR answer=192.168.10.20',
  },
  {
    id: 'LOG-1009',
    timestamp: '2026-11-11T02:17:12Z',
    source: 'smb',
    severity: 'WARN',
    hostId: 'FS-SRV-01',
    sourceIp: '185.220.101.44',
    username: 'svc_backup',
    eventCode: 'SMB-SHARE-ENUM',
    message: 'Remote IPC$ and ADMIN$ administrative share enumeration by svc_backup from VPN session 185.220.101.44',
    rawPayload: 'EventID=5140 ShareName=\\\\*\\IPC$ SubjectUserName=svc_backup IpAddress=185.220.101.44 AccessMask=0x1',
  },
  {
    id: 'LOG-1010',
    timestamp: '2026-11-11T02:17:49Z',
    source: 'smb',
    severity: 'CRITICAL',
    hostId: 'SQL-PROD-01',
    sourceIp: '185.220.101.44',
    username: 'svc_backup',
    eventCode: 'SMB-LATERAL-5145',
    message: 'CRITICAL: Lateral movement detected via SMBv3 to SQL-PROD-01\\ADMIN$ using compromised account svc_backup from 185.220.101.44',
    rawPayload: 'EventID=5145 Host=SQL-PROD-01 ShareName=\\\\*\\ADMIN$ RelativeTargetName=SvcHostUpdate.exe SubjectUserName=svc_backup IpAddress=185.220.101.44',
  },
  {
    id: 'LOG-1011',
    timestamp: '2026-11-11T02:18:15Z',
    source: 'edr',
    severity: 'CRITICAL',
    hostId: 'SQL-PROD-01',
    sourceIp: '185.220.101.44',
    username: 'svc_backup',
    eventCode: 'EDR-PROC-4698',
    message: 'CRITICAL: Suspicious persistence scheduled task created on SQL-PROD-01: schtasks /create /tn "SysUpdate" /tr "C:\\Windows\\Temp\\SvcHostUpdate.exe" /sc MINUTE /mo 15 /ru SYSTEM',
    rawPayload: 'EventID=4698 Host=SQL-PROD-01 User=svc_backup SourceIP=185.220.101.44 CommandLine=schtasks /create /tn "SysUpdate" /tr "C:\\Windows\\Temp\\SvcHostUpdate.exe" /sc MINUTE /mo 15 /ru SYSTEM',
  },
  {
    id: 'LOG-1012',
    timestamp: '2026-11-11T02:18:44Z',
    source: 'dns',
    severity: 'WARN',
    hostId: 'SQL-PROD-01',
    sourceIp: '185.220.101.44',
    username: 'svc_backup',
    eventCode: 'DNS-C2-BEACON',
    message: 'Suspicious high-entropy TXT beacon query from SQL-PROD-01 to c2-telemetry.darknode.ru correlated with session 185.220.101.44',
    rawPayload: 'client=SQL-PROD-01 origin_ip=185.220.101.44 user=svc_backup qname=8f9a2b.c2-telemetry.darknode.ru qtype=TXT rcode=NXDOMAIN',
  },
  {
    id: 'LOG-1013',
    timestamp: '2026-11-11T02:19:05Z',
    source: 'firewall',
    severity: 'INFO',
    hostId: 'FW-EDGE-01',
    sourceIp: '192.168.10.20',
    eventCode: 'FW-ALLOW-123',
    message: 'NTP clock synchronization from FS-SRV-01 to time.nist.gov:123',
    rawPayload: 'src=192.168.10.20 dst=129.6.15.28 proto=UDP dport=123 action=ALLOW',
  },
  {
    id: 'LOG-1014',
    timestamp: '2026-11-11T02:20:11Z',
    source: 'ad_auth',
    severity: 'INFO',
    hostId: 'DC-SRV-01',
    sourceIp: '192.168.40.102',
    username: 'r.gomez',
    eventCode: 'EVENT-4624',
    message: 'Workstation unlock authentication succeeded for user r.gomez on PC-SALES-02',
    rawPayload: 'EventID=4624 LogonType=7 TargetUserName=r.gomez IpAddress=192.168.40.102 Status=0x0',
  },
  {
    id: 'LOG-1015',
    timestamp: '2026-11-11T02:21:30Z',
    source: 'smb',
    severity: 'INFO',
    hostId: 'FS-SRV-01',
    sourceIp: '192.168.10.101',
    username: 'm.vance',
    eventCode: 'SMB-READ-5140',
    message: 'Authorized departmental share mount \\\\FS-SRV-01\\Finance_Q4 by m.vance',
    rawPayload: 'EventID=5140 ShareName=\\\\FS-SRV-01\\Finance_Q4 SubjectUserName=m.vance IpAddress=192.168.10.101',
  },
  {
    id: 'LOG-1016',
    timestamp: '2026-11-11T02:22:08Z',
    source: 'edr',
    severity: 'INFO',
    hostId: 'PC-ENG-01',
    sourceIp: '192.168.20.101',
    username: 'd.kim',
    eventCode: 'EDR-SCAN-100',
    message: 'Scheduled nightly heuristic memory scan completed on PC-ENG-01 with 0 detections',
    rawPayload: 'Host=PC-ENG-01 Agent=SentinelGuard-4.8 ScanType=QuickMemory ThreatsFound=0',
  },
  {
    id: 'LOG-1017',
    timestamp: '2026-11-11T02:23:19Z',
    source: 'firewall',
    severity: 'WARN',
    hostId: 'FW-EDGE-01',
    sourceIp: '45.155.205.99',
    eventCode: 'FW-DROP-23',
    message: 'Dropped unsolicited inbound Telnet port scan on WAN interface from 45.155.205.99',
    rawPayload: 'src=45.155.205.99 dst=203.0.113.10 proto=TCP dport=23 action=DROP rule=WAN-DEFAULT-DENY',
  },
  {
    id: 'LOG-1018',
    timestamp: '2026-11-11T02:24:01Z',
    source: 'dns',
    severity: 'INFO',
    hostId: 'DC-SRV-01',
    sourceIp: '192.168.10.102',
    username: 's.baker',
    eventCode: 'DNS-QUERY-A',
    message: 'DNS A record query for portal.corp.local from PC-FIN-02',
    rawPayload: 'client=192.168.10.102 qname=portal.corp.local qtype=A rcode=NOERROR answer=192.168.10.99',
  },
  {
    id: 'LOG-1019',
    timestamp: '2026-11-11T02:25:14Z',
    source: 'ad_auth',
    severity: 'WARN',
    hostId: 'DC-SRV-01',
    sourceIp: '192.168.20.105',
    username: 'k.novak',
    eventCode: 'EVENT-4771',
    message: 'Kerberos pre-authentication failed once for user k.novak (bad password typo)',
    rawPayload: 'EventID=4771 TargetUserName=k.novak IpAddress=192.168.20.105 FailureCode=0x18',
  },
  {
    id: 'LOG-1020',
    timestamp: '2026-11-11T02:26:42Z',
    source: 'edr',
    severity: 'WARN',
    hostId: 'PC-SALES-01',
    sourceIp: '192.168.40.101',
    username: 't.brooks',
    eventCode: 'EDR-USB-204',
    message: 'Removable USB storage device blocked by endpoint device control policy on PC-SALES-01',
    rawPayload: 'Host=PC-SALES-01 User=t.brooks DeviceClass=USBSTOR Vendor=SanDisk Action=BLOCKED',
  },
  {
    id: 'LOG-1021',
    timestamp: '2026-11-11T02:27:55Z',
    source: 'smb',
    severity: 'INFO',
    hostId: 'FS-SRV-01',
    sourceIp: '192.168.20.101',
    username: 'd.kim',
    eventCode: 'SMB-READ-5140',
    message: 'Engineering build artifact share \\\\FS-SRV-01\\Eng_Builds accessed by d.kim',
    rawPayload: 'EventID=5140 ShareName=\\\\FS-SRV-01\\Eng_Builds SubjectUserName=d.kim IpAddress=192.168.20.101',
  },
  {
    id: 'LOG-1022',
    timestamp: '2026-11-11T02:29:10Z',
    source: 'firewall',
    severity: 'CRITICAL',
    hostId: 'FW-EDGE-01',
    sourceIp: '185.220.101.44',
    username: 'svc_backup',
    eventCode: 'FW-EXFIL-ALERT',
    message: 'CRITICAL: Anomalous outbound encrypted tunnel transfer (480 MB) from SQL-PROD-01 to external host 185.220.101.44',
    rawPayload: 'src=192.168.10.30 dst=185.220.101.44 user=svc_backup proto=TCP dport=8443 bytes=503316480 alert=POTENTIAL_EXFILTRATION',
  },
];

const ATTACK_CHAIN_LOG_IDS = new Set<string>([
  'LOG-1004',
  'LOG-1005',
  'LOG-1006',
  'LOG-1007',
  'LOG-1009',
  'LOG-1010',
  'LOG-1011',
  'LOG-1012',
  'LOG-1022',
]);

export class SiemEngine {
  private logs: SiemLogEntry[];
  private investigationCase: SiemInvestigationCase;

  constructor() {
    this.logs = INITIAL_LOGS.map((l) => ({ ...l }));
    this.investigationCase = {
      id: 'CASE-2026-09',
      title: 'Off-Hours VPN Brute Force & SQL Lateral Movement Investigation',
      pinnedLogIds: [],
      blockedIps: [],
      revokedAccounts: [],
      isResolved: false,
    };
  }

  public getLogs(): SiemLogEntry[] {
    return this.logs.map((l) => ({ ...l }));
  }

  public queryLogs(query: string): SiemLogEntry[] {
    const trimmed = query.trim();
    if (!trimmed) {
      return this.getLogs();
    }

    // Match tokens while respecting quoted strings in key="value"
    const rawTokens = trimmed.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) ?? [];
    const tokens = rawTokens.filter(
      (t) => t.toUpperCase() !== 'AND' && t.toUpperCase() !== 'OR'
    );

    return this.logs
      .filter((entry) => {
        return tokens.every((token) => {
          const eqIdx = token.indexOf('=');
          if (eqIdx > 0) {
            const key = token.slice(0, eqIdx).trim().toLowerCase();
            const rawVal = token.slice(eqIdx + 1).trim();
            const val = rawVal.replace(/^["']|["']$/g, '').toLowerCase();

            switch (key) {
              case 'source':
                return entry.source.toLowerCase() === val;
              case 'severity':
                return entry.severity.toLowerCase() === val;
              case 'host':
              case 'hostid':
                return entry.hostId.toLowerCase().includes(val);
              case 'ip':
              case 'sourceip':
                return (
                  entry.sourceIp.toLowerCase().includes(val) ||
                  entry.rawPayload.toLowerCase().includes(val)
                );
              case 'user':
              case 'username':
                return (entry.username ?? '').toLowerCase().includes(val);
              default:
                return (
                  entry.message.toLowerCase().includes(val) ||
                  entry.rawPayload.toLowerCase().includes(val)
                );
            }
          }

          const cleanTerm = token.replace(/^["']|["']$/g, '').toLowerCase();
          const searchable = [
            entry.id,
            entry.timestamp,
            entry.source,
            entry.severity,
            entry.hostId,
            entry.sourceIp,
            entry.username ?? '',
            entry.eventCode,
            entry.message,
            entry.rawPayload,
          ]
            .join(' ')
            .toLowerCase();

          return searchable.includes(cleanTerm);
        });
      })
      .map((l) => ({ ...l }));
  }

  public getCase(): SiemInvestigationCase {
    this.updateResolutionState();
    return {
      ...this.investigationCase,
      pinnedLogIds: [...this.investigationCase.pinnedLogIds],
      blockedIps: [...this.investigationCase.blockedIps],
      revokedAccounts: [...this.investigationCase.revokedAccounts],
    };
  }

  public pinLogToCase(logId: string): SiemInvestigationCase {
    const exists = this.logs.some((l) => l.id === logId);
    if (exists && !this.investigationCase.pinnedLogIds.includes(logId)) {
      this.investigationCase.pinnedLogIds.push(logId);
    }
    this.updateResolutionState();
    return this.getCase();
  }

  public unpinLogFromCase(logId: string): SiemInvestigationCase {
    this.investigationCase.pinnedLogIds =
      this.investigationCase.pinnedLogIds.filter((id) => id !== logId);
    this.updateResolutionState();
    return this.getCase();
  }

  public blockAttackerIp(ip: string): SiemInvestigationCase {
    const normalized = ip.trim();
    if (normalized && !this.investigationCase.blockedIps.includes(normalized)) {
      this.investigationCase.blockedIps.push(normalized);
    }
    this.updateResolutionState();
    return this.getCase();
  }

  public revokeCompromisedAccount(username: string): SiemInvestigationCase {
    const normalized = username.trim().toLowerCase();
    if (
      normalized &&
      !this.investigationCase.revokedAccounts.some(
        (u) => u.toLowerCase() === normalized
      )
    ) {
      this.investigationCase.revokedAccounts.push(username.trim());
    }
    this.updateResolutionState();
    return this.getCase();
  }

  public isInvestigationResolved(): boolean {
    this.updateResolutionState();
    return this.investigationCase.isResolved;
  }

  private updateResolutionState(): void {
    const pinnedAttackLogs = this.investigationCase.pinnedLogIds.filter((id) =>
      ATTACK_CHAIN_LOG_IDS.has(id)
    );
    const hasBlockedAttackerIp =
      this.investigationCase.blockedIps.includes('185.220.101.44');
    const hasRevokedBackupAccount =
      this.investigationCase.revokedAccounts.some(
        (u) => u.toLowerCase() === 'svc_backup'
      );

    this.investigationCase.isResolved =
      pinnedAttackLogs.length >= 2 &&
      hasBlockedAttackerIp &&
      hasRevokedBackupAccount;
  }
}
