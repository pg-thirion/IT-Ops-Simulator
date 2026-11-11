import type { DhcpScope, DnsRecord, DnsZone } from '../types/dhcpDns';

const INITIAL_SCOPES: DhcpScope[] = [
  {
    id: 'SCOPE-VLAN10',
    vlanId: 10,
    name: 'Finance & Core Services',
    subnet: '192.168.10.0/24',
    rangeStart: '192.168.10.100',
    rangeEnd: '192.168.10.199',
    totalAddresses: 32,
    leases: [
      {
        ip: '192.168.10.101',
        mac: '00:1B:44:11:3A:B7',
        hostname: 'PC-FIN-01',
        isRogue: false,
        isReservation: false,
        expiresInMinutes: 420,
      },
      {
        ip: '192.168.10.102',
        mac: '00:1B:44:11:3A:B8',
        hostname: 'PC-FIN-02',
        isRogue: false,
        isReservation: false,
        expiresInMinutes: 395,
      },
    ],
  },
  {
    id: 'SCOPE-VLAN20',
    vlanId: 20,
    name: 'Human Resources',
    subnet: '192.168.20.0/24',
    rangeStart: '192.168.20.100',
    rangeEnd: '192.168.20.199',
    totalAddresses: 24,
    leases: [
      {
        ip: '192.168.20.101',
        mac: '00:1C:23:88:10:01',
        hostname: 'PC-HR-01',
        isRogue: false,
        isReservation: false,
        expiresInMinutes: 480,
      },
      {
        ip: '192.168.20.102',
        mac: '00:1C:23:88:10:02',
        hostname: 'PC-HR-02',
        isRogue: false,
        isReservation: false,
        expiresInMinutes: 465,
      },
    ],
  },
  {
    id: 'SCOPE-VLAN30',
    vlanId: 30,
    name: 'Engineering Workstation Pool',
    subnet: '192.168.30.0/24',
    rangeStart: '192.168.30.100',
    rangeEnd: '192.168.30.199',
    totalAddresses: 32,
    leases: [
      {
        ip: '192.168.30.101',
        mac: '00:25:90:6A:44:11',
        hostname: 'WS-ENG-01',
        isRogue: false,
        isReservation: false,
        expiresInMinutes: 350,
      },
      {
        ip: '192.168.30.102',
        mac: '00:25:90:6A:44:12',
        hostname: 'WS-ENG-02',
        isRogue: false,
        isReservation: false,
        expiresInMinutes: 340,
      },
      {
        ip: '192.168.30.103',
        mac: '00:25:90:6A:44:13',
        hostname: 'WS-ENG-03',
        isRogue: false,
        isReservation: false,
        expiresInMinutes: 310,
      },
    ],
  },
  {
    id: 'SCOPE-VLAN40',
    vlanId: 40,
    name: 'Sales Floor',
    subnet: '192.168.40.0/24',
    rangeStart: '192.168.40.100',
    rangeEnd: '192.168.40.115',
    totalAddresses: 16,
    leases: [
      {
        ip: '192.168.40.100',
        mac: '00:50:56:C0:00:01',
        hostname: 'PC-SALES-01',
        isRogue: false,
        isReservation: false,
        expiresInMinutes: 410,
      },
      {
        ip: '192.168.40.101',
        mac: '00:50:56:C0:00:02',
        hostname: 'PC-SALES-02',
        isRogue: false,
        isReservation: false,
        expiresInMinutes: 405,
      },
      {
        ip: '192.168.40.102',
        mac: '00:50:56:C0:00:03',
        hostname: 'PC-SALES-03',
        isRogue: false,
        isReservation: false,
        expiresInMinutes: 390,
      },
      {
        ip: '192.168.40.103',
        mac: '00:50:56:C0:00:04',
        hostname: 'VOIP-SALES-01',
        isRogue: false,
        isReservation: true,
        expiresInMinutes: 1440,
      },
      {
        ip: '192.168.40.104',
        mac: '00:DE:AD:BE:EF:01',
        hostname: 'rogue-iot-cam-01',
        isRogue: true,
        isReservation: false,
        expiresInMinutes: 55,
      },
      {
        ip: '192.168.40.105',
        mac: '00:DE:AD:BE:EF:02',
        hostname: 'rogue-iot-cam-02',
        isRogue: true,
        isReservation: false,
        expiresInMinutes: 54,
      },
      {
        ip: '192.168.40.106',
        mac: '00:DE:AD:BE:EF:03',
        hostname: 'rogue-container-03',
        isRogue: true,
        isReservation: false,
        expiresInMinutes: 53,
      },
      {
        ip: '192.168.40.107',
        mac: '00:DE:AD:BE:EF:04',
        hostname: 'rogue-container-04',
        isRogue: true,
        isReservation: false,
        expiresInMinutes: 52,
      },
      {
        ip: '192.168.40.108',
        mac: '00:DE:AD:BE:EF:05',
        hostname: 'rogue-container-05',
        isRogue: true,
        isReservation: false,
        expiresInMinutes: 51,
      },
      {
        ip: '192.168.40.109',
        mac: '00:DE:AD:BE:EF:06',
        hostname: 'rogue-container-06',
        isRogue: true,
        isReservation: false,
        expiresInMinutes: 50,
      },
      {
        ip: '192.168.40.110',
        mac: '00:DE:AD:BE:EF:07',
        hostname: 'rogue-container-07',
        isRogue: true,
        isReservation: false,
        expiresInMinutes: 49,
      },
      {
        ip: '192.168.40.111',
        mac: '00:DE:AD:BE:EF:08',
        hostname: 'rogue-container-08',
        isRogue: true,
        isReservation: false,
        expiresInMinutes: 48,
      },
      {
        ip: '192.168.40.112',
        mac: '00:DE:AD:BE:EF:09',
        hostname: 'rogue-sensor-09',
        isRogue: true,
        isReservation: false,
        expiresInMinutes: 47,
      },
      {
        ip: '192.168.40.113',
        mac: '00:DE:AD:BE:EF:0A',
        hostname: 'rogue-sensor-10',
        isRogue: true,
        isReservation: false,
        expiresInMinutes: 46,
      },
      {
        ip: '192.168.40.114',
        mac: '00:DE:AD:BE:EF:0B',
        hostname: 'rogue-sensor-11',
        isRogue: true,
        isReservation: false,
        expiresInMinutes: 45,
      },
      {
        ip: '192.168.40.115',
        mac: '00:DE:AD:BE:EF:0C',
        hostname: 'rogue-sensor-12',
        isRogue: true,
        isReservation: false,
        expiresInMinutes: 44,
      },
    ],
  },
];

const INITIAL_DNS_ZONE: DnsZone = {
  domain: 'corp.local',
  soaSerial: 2026111101,
  records: [
    {
      id: 'REC-DC01',
      name: 'dc-srv-01.corp.local',
      type: 'A',
      value: '192.168.10.10',
      ttl: 3600,
      isCorrupted: false,
    },
    {
      id: 'REC-FS01',
      name: 'fs-srv-01.corp.local',
      type: 'A',
      value: '192.168.10.20',
      ttl: 3600,
      isCorrupted: false,
    },
    {
      id: 'REC-SQL01',
      name: 'sql-prod-01.corp.local',
      type: 'A',
      value: '192.168.10.50',
      ttl: 1800,
      isCorrupted: false,
    },
    {
      id: 'REC-WEB01',
      name: 'web-intra-01.corp.local',
      type: 'A',
      value: '192.168.10.202',
      ttl: 3600,
      isCorrupted: false,
    },
    {
      id: 'REC-PORTAL',
      name: 'portal.corp.local',
      type: 'A',
      value: '192.168.10.99',
      ttl: 300,
      isCorrupted: true,
    },
    {
      id: 'REC-INTRANET',
      name: 'intranet.corp.local',
      type: 'CNAME',
      value: 'portal.corp.local',
      ttl: 1800,
      isCorrupted: false,
    },
    {
      id: 'REC-MX01',
      name: 'corp.local',
      type: 'MX',
      value: '10 mail-gw-01.corp.local',
      ttl: 3600,
      isCorrupted: false,
    },
    {
      id: 'REC-SPF',
      name: 'corp.local',
      type: 'TXT',
      value: 'v=spf1 ip4:192.168.10.0/24 -all',
      ttl: 3600,
      isCorrupted: false,
    },
  ],
};

export class DhcpDnsEngine {
  private scopes: DhcpScope[];
  private dnsZone: DnsZone;

  constructor() {
    this.scopes = INITIAL_SCOPES.map((scope) => ({
      ...scope,
      leases: scope.leases.map((lease) => ({ ...lease })),
    }));
    this.dnsZone = {
      ...INITIAL_DNS_ZONE,
      records: INITIAL_DNS_ZONE.records.map((rec) => ({ ...rec })),
    };
  }

  getScopes(): DhcpScope[] {
    return this.scopes.map((scope) => ({
      ...scope,
      leases: scope.leases.map((lease) => ({ ...lease })),
    }));
  }

  purgeRogueLeases(scopeId: string): { purgedCount: number; scope?: DhcpScope } {
    const scope = this.scopes.find((s) => s.id === scopeId);
    if (!scope) {
      return { purgedCount: 0 };
    }

    const beforeCount = scope.leases.length;
    scope.leases = scope.leases.filter((lease) => !lease.isRogue);
    const purgedCount = beforeCount - scope.leases.length;

    return {
      purgedCount,
      scope: {
        ...scope,
        leases: scope.leases.map((lease) => ({ ...lease })),
      },
    };
  }

  addLeaseReservation(
    scopeId: string,
    ip: string,
    mac: string,
    hostname: string
  ): DhcpScope | undefined {
    const scope = this.scopes.find((s) => s.id === scopeId);
    if (!scope) return undefined;

    const cleanIp = ip.trim();
    const cleanMac = mac.trim().toUpperCase();
    const cleanHost = hostname.trim();

    const existingIdx = scope.leases.findIndex(
      (l) => l.ip === cleanIp || l.mac.toUpperCase() === cleanMac
    );
    const newLease = {
      ip: cleanIp,
      mac: cleanMac,
      hostname: cleanHost,
      isRogue: false,
      isReservation: true,
      expiresInMinutes: 1440,
    };

    if (existingIdx >= 0) {
      scope.leases[existingIdx] = newLease;
    } else {
      scope.leases.push(newLease);
    }

    return {
      ...scope,
      leases: scope.leases.map((lease) => ({ ...lease })),
    };
  }

  getDnsZone(): DnsZone {
    return {
      ...this.dnsZone,
      records: this.dnsZone.records.map((rec) => ({ ...rec })),
    };
  }

  updateDnsRecord(recordId: string, newValue: string): DnsRecord | undefined {
    const rec = this.dnsZone.records.find((r) => r.id === recordId);
    if (!rec) return undefined;

    const trimmed = newValue.trim();
    rec.value = trimmed;
    if (rec.id === 'REC-PORTAL') {
      rec.isCorrupted = trimmed !== '192.168.10.202';
    } else {
      rec.isCorrupted = false;
    }

    this.dnsZone.soaSerial += 1;

    return { ...rec };
  }

  isDhcpAndDnsHealthy(): boolean {
    const vlan40 = this.scopes.find((s) => s.id === 'SCOPE-VLAN40');
    if (!vlan40) return false;

    const hasRogueOnVlan40 = vlan40.leases.some((l) => l.isRogue);
    const utilization = vlan40.leases.length / vlan40.totalAddresses;
    const dhcpHealthy = !hasRogueOnVlan40 && utilization < 0.8;

    const portalRec = this.dnsZone.records.find((r) => r.id === 'REC-PORTAL');
    const dnsHealthy =
      portalRec !== undefined &&
      portalRec.value === '192.168.10.202' &&
      !portalRec.isCorrupted;

    return dhcpHealthy && dnsHealthy;
  }
}
