export type ShiftEventSeverity = 'Warning' | 'Critical';

export interface ShiftEvent {
  id: string;
  title: string;
  description: string;
  severity: ShiftEventSeverity;
  targetHostId: string;
  isActive: boolean;
  isResolved: boolean;
  triggeredAtSecond: number;
}

export interface ShiftReportCard {
  day: number;
  ticketsResolved: number;
  ticketsFailed: number;
  slaAdherenceRate: number;
  uptimePercent: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'F';
  bonusCash: number;
  bonusXp: number;
}
