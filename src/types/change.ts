export type ChangeRiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type ChangeStatus = 'Draft' | 'Pending CAB' | 'Approved' | 'Completed' | 'Violated';

export interface ChangeRequest {
  id: string;
  title: string;
  targetHostId: string;
  description: string;
  riskLevel: ChangeRiskLevel;
  status: ChangeStatus;
  maintenanceWindow: string;
  requiresFailover: boolean;
  isFailoverActive: boolean;
  hasRollbackPlan: boolean;
  cabNotes: string;
}
