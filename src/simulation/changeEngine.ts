import type { ChangeRequest } from '../types/change';

const INITIAL_CHANGE_REQUESTS: ChangeRequest[] = [
  {
    id: 'CR-201',
    title: 'Edge Switch SNMP v3 Credential Rotation',
    targetHostId: 'SW-EDGE-01',
    description:
      'Rotate SNMP read-only community strings to authenticated SNMPv3 SHA/AES credentials across access layer switches.',
    riskLevel: 'Low',
    status: 'Approved',
    maintenanceWindow: '01:00 - 01:30 UTC',
    requiresFailover: false,
    isFailoverActive: false,
    hasRollbackPlan: true,
    cabNotes: 'Standard low-risk security hardening approved by NOC Lead.',
  },
  {
    id: 'CR-202',
    title: 'SQL-PROD-01 Kernel Security Patch & Cluster Node Reboot',
    targetHostId: 'SQL-PROD-01',
    description:
      'Apply critical Linux/Windows kernel CVE patch and perform warm reboot of primary database cluster node SQL-PROD-01. Requires active HA replica failover (SQL-REPLICA-02) and verified rollback snapshot before CAB sign-off.',
    riskLevel: 'Critical',
    status: 'Draft',
    maintenanceWindow: '02:00 - 03:00 UTC (Emergency ECR)',
    requiresFailover: true,
    isFailoverActive: false,
    hasRollbackPlan: false,
    cabNotes: 'Awaiting HA replica sync verification and documented rollback plan prior to CAB approval.',
  },
  {
    id: 'CR-203',
    title: 'Core Router BGP Prefix Filter Update',
    targetHostId: 'RTR-CORE-01',
    description:
      'Update outbound route-map prefix lists on RTR-CORE-01 to prevent ISP transit route leakage.',
    riskLevel: 'High',
    status: 'Pending CAB',
    maintenanceWindow: '03:00 - 03:45 UTC',
    requiresFailover: true,
    isFailoverActive: true,
    hasRollbackPlan: true,
    cabNotes: 'Standby HSRP router active; ready for final CAB review.',
  },
  {
    id: 'CR-204',
    title: 'Domain Controller Kerberos Ticket Lifetime Policy Adjustment',
    targetHostId: 'DC-SRV-01',
    description:
      'Tighten maximum Kerberos TGT lifetime from 10 hours to 8 hours on primary domain controller DC-SRV-01.',
    riskLevel: 'Medium',
    status: 'Completed',
    maintenanceWindow: '00:00 - 00:30 UTC',
    requiresFailover: false,
    isFailoverActive: false,
    hasRollbackPlan: true,
    cabNotes: 'Executed cleanly during prior maintenance window.',
  },
];

export class ChangeEngine {
  private requests: ChangeRequest[];

  constructor() {
    this.requests = INITIAL_CHANGE_REQUESTS.map((req) => ({ ...req }));
  }

  getChangeRequests(): ChangeRequest[] {
    return this.requests.map((req) => ({ ...req }));
  }

  getChangeRequest(id: string): ChangeRequest | undefined {
    const found = this.requests.find((req) => req.id === id);
    return found ? { ...found } : undefined;
  }

  toggleFailoverReplica(id: string, active: boolean): ChangeRequest | undefined {
    const req = this.requests.find((r) => r.id === id);
    if (!req) return undefined;

    req.isFailoverActive = active;
    req.cabNotes = active
      ? `HA failover replica activated for ${req.targetHostId}.`
      : `HA failover replica deactivated for ${req.targetHostId}.`;
    return { ...req };
  }

  attachRollbackPlan(id: string): ChangeRequest | undefined {
    const req = this.requests.find((r) => r.id === id);
    if (!req) return undefined;

    req.hasRollbackPlan = true;
    req.cabNotes = `Validated LVM/VM snapshot rollback plan attached for ${req.id}.`;
    return { ...req };
  }

  requestCabApproval(id: string): { success: boolean; message: string; request?: ChangeRequest } {
    const req = this.requests.find((r) => r.id === id);
    if (!req) {
      return {
        success: false,
        message: `Change Request ${id} not found.`,
      };
    }

    if (req.requiresFailover && !req.isFailoverActive) {
      return {
        success: false,
        message: `CAB Rejection: ${req.id} requires High-Availability Replica Failover to be active before approval.`,
        request: { ...req },
      };
    }

    if (!req.hasRollbackPlan) {
      return {
        success: false,
        message: `CAB Rejection: ${req.id} requires an attached Rollback Plan before approval.`,
        request: { ...req },
      };
    }

    req.status = 'Approved';
    req.cabNotes = 'CAB Approved: Pre-flight HA failover and rollback verification passed.';
    return {
      success: true,
      message: `Change Request ${req.id} approved by Change Advisory Board.`,
      request: { ...req },
    };
  }

  executeChangeMaintenance(id: string): {
    success: boolean;
    violated: boolean;
    message: string;
    request?: ChangeRequest;
  } {
    const req = this.requests.find((r) => r.id === id);
    if (!req) {
      return {
        success: false,
        violated: false,
        message: `Change Request ${id} not found.`,
      };
    }

    const missingApproval = req.status !== 'Approved';
    const missingFailover = req.requiresFailover && !req.isFailoverActive;
    const missingRollback = !req.hasRollbackPlan;

    if (missingApproval || missingFailover || missingRollback) {
      req.status = 'Violated';
      req.cabNotes =
        'SLA / ITIL Change Policy Violation: Unauthorized maintenance executed without CAB approval or active HA failover replica.';
      return {
        success: false,
        violated: true,
        message: `CHANGE VIOLATION on ${req.id}: Executed maintenance on ${req.targetHostId} without CAB approval or active HA failover!`,
        request: { ...req },
      };
    }

    req.status = 'Completed';
    req.cabNotes = `Maintenance window completed cleanly on ${req.targetHostId} with zero downtime.`;
    return {
      success: true,
      violated: false,
      message: `Change Request ${req.id} executed cleanly on ${req.targetHostId}.`,
      request: { ...req },
    };
  }

  isChangeCompletedCleanly(id: string): boolean {
    const req = this.requests.find((r) => r.id === id);
    if (!req) return false;
    return (
      req.status === 'Completed' &&
      (!req.requiresFailover || req.isFailoverActive) &&
      req.hasRollbackPlan
    );
  }
}
