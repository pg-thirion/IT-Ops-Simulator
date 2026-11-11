export interface DhcpLease {
  ip: string;
  mac: string;
  hostname: string;
  isRogue: boolean;
  isReservation: boolean;
  expiresInMinutes: number;
}

export interface DhcpScope {
  id: string;
  vlanId: number;
  name: string;
  subnet: string;
  rangeStart: string;
  rangeEnd: string;
  totalAddresses: number;
  leases: DhcpLease[];
}

export type DnsRecordType = 'A' | 'CNAME' | 'MX' | 'TXT' | 'PTR';

export interface DnsRecord {
  id: string;
  name: string;
  type: DnsRecordType;
  value: string;
  ttl: number;
  isCorrupted?: boolean;
}

export interface DnsZone {
  domain: string;
  soaSerial: number;
  records: DnsRecord[];
}
