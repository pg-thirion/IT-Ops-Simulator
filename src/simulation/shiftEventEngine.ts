import type { ShiftEvent, ShiftReportCard } from '../types/shiftEvent';
import type { CareerStats } from '../types/game';

const INITIAL_SHIFT_EVENTS: ShiftEvent[] = [
  {
    id: 'EVT-SSL-EXPIRED',
    title: 'TLS/SSL Certificate Expired on WEB-INTRA-01',
    description:
      'X.509 wildcard certificate (*.corp.local) bound to Nginx port 443 on WEB-INTRA-01 has expired. Browsers are blocking HTTPS SSO logins with NET::ERR_CERT_DATE_INVALID.',
    severity: 'Critical',
    targetHostId: 'WEB-INTRA-01',
    isActive: true,
    isResolved: false,
    triggeredAtSecond: 60,
  },
  {
    id: 'EVT-UPS-BROWNOUT',
    title: 'Utility Grid Brownout - Rack Room UPS Alert',
    description:
      'Input line voltage sagged below 98V AC on APC-UPS-3000VA. Switch UPS to Online Double-Conversion / Battery Bypass to protect core storage arrays.',
    severity: 'Warning',
    targetHostId: 'APC-UPS-3000VA',
    isActive: false,
    isResolved: false,
    triggeredAtSecond: 180,
  },
  {
    id: 'EVT-BGP-FLAP',
    title: 'ISP Upstream BGP Peer Route Flap',
    description:
      'Transient BGP session instability detected on WAN peer 203.0.113.1. Secondary static route convergence standing by.',
    severity: 'Warning',
    targetHostId: 'RTR-CORE-01',
    isActive: false,
    isResolved: false,
    triggeredAtSecond: 300,
  },
];

export class ShiftEventEngine {
  private events: ShiftEvent[];
  private sslValidByHost: Map<string, boolean>;

  constructor() {
    this.events = INITIAL_SHIFT_EVENTS.map((e) => ({ ...e }));
    this.sslValidByHost = new Map<string, boolean>([
      ['WEB-INTRA-01', false],
      ['DC-SRV-01', true],
      ['FS-SRV-01', true],
      ['SQL-PROD-01', true],
    ]);
  }

  public getEvents(): ShiftEvent[] {
    return this.events.map((e) => ({ ...e }));
  }

  public triggerEvent(eventId: string): ShiftEvent | undefined {
    const evt = this.events.find((e) => e.id === eventId);
    if (!evt) {
      return undefined;
    }
    evt.isActive = true;
    return { ...evt };
  }

  public renewSslCertificate(hostId: string): {
    success: boolean;
    message: string;
  } {
    const normalized = hostId.trim().toUpperCase();
    if (!normalized) {
      return {
        success: false,
        message: 'Host ID is required to renew TLS certificate.',
      };
    }

    this.sslValidByHost.set(normalized, true);

    if (normalized === 'WEB-INTRA-01') {
      const sslEvent = this.events.find((e) => e.id === 'EVT-SSL-EXPIRED');
      if (sslEvent) {
        sslEvent.isResolved = true;
        sslEvent.isActive = false;
      }
    }

    return {
      success: true,
      message: `Issued and bound new SHA-256 RSA-4096 TLS certificate for ${normalized} (valid 365 days). HTTPS listener reloaded cleanly.`,
    };
  }

  public isSslValid(hostId: string): boolean {
    const normalized = hostId.trim().toUpperCase();
    return this.sslValidByHost.get(normalized) ?? true;
  }

  public calculateShiftReport(career: CareerStats): ShiftReportCard {
    const {
      currentDay,
      ticketsResolved,
      ticketsFailed,
      slaAdherenceRate,
    } = career;

    let grade: ShiftReportCard['grade'];
    let bonusCash = 0;
    let bonusXp = 0;

    if (ticketsResolved >= 3 && ticketsFailed === 0 && slaAdherenceRate >= 95) {
      grade = 'S';
      bonusCash = 750;
      bonusXp = 350;
    } else if (slaAdherenceRate >= 85) {
      grade = 'A';
      bonusCash = 500;
      bonusXp = 250;
    } else if (slaAdherenceRate >= 70) {
      grade = 'B';
      bonusCash = 300;
      bonusXp = 150;
    } else if (slaAdherenceRate >= 50) {
      grade = 'C';
      bonusCash = 120;
      bonusXp = 75;
    } else {
      grade = 'F';
      bonusCash = 0;
      bonusXp = 0;
    }

    const unresolvedCriticalEvents = this.events.filter(
      (e) => e.isActive && !e.isResolved
    ).length;
    const rawUptime =
      99.95 - ticketsFailed * 0.4 - unresolvedCriticalEvents * 0.15;
    const uptimePercent = Number(Math.max(92.0, Math.min(99.99, rawUptime)).toFixed(2));

    return {
      day: currentDay,
      ticketsResolved,
      ticketsFailed,
      slaAdherenceRate,
      uptimePercent,
      grade,
      bonusCash,
      bonusXp,
    };
  }
}
