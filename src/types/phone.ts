export type CallStatus = 'Ringing' | 'Connected' | 'Ended';

export interface DialogueChoice {
  id: string;
  text: string;
  revealsClue?: string; // Clue text added to ticket
  revealsTicketId?: string;
  nextNodeId?: string;
  satisfactionDelta: number; // e.g. +10, -5
}

export interface DialogueNode {
  id: string;
  speakerText: string;
  choices: DialogueChoice[];
  isTerminal?: boolean;
}

export interface PhoneCall {
  id: string;
  callerName: string;
  callerTitle: string;
  department: string;
  callerHostId: string;
  linkedTicketId?: string;
  urgency: 'Normal' | 'High' | 'Critical';
  status: CallStatus;
  currentDialogueNodeId: string;
  dialogueTree: Record<string, DialogueNode>;
  revealedClues: string[];
}
