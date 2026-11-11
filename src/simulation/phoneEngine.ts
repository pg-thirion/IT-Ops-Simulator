import {
  DialogueNode,
  PhoneCall,
} from '../types/phone';

export const SEED_CALLS: PhoneCall[] = [
  {
    id: 'CALL-01',
    callerName: 'Sarah Mitchell',
    callerTitle: 'Financial Analyst',
    department: 'Finance',
    callerHostId: 'PC-FIN-04',
    linkedTicketId: 'INC-1042',
    urgency: 'High',
    status: 'Ringing',
    currentDialogueNodeId: 'c1-node-root',
    revealedClues: [],
    dialogueTree: {
      'c1-node-root': {
        id: 'c1-node-root',
        speakerText: "Hello, IT Helpdesk? I can't access any intranet resources or external sites, but my network tray icon shows connected! Can you help?",
        choices: [
          {
            id: 'c1-opt-restart',
            text: 'Have you restarted?',
            nextNodeId: 'c1-node-restarted',
            satisfactionDelta: -5,
          },
          {
            id: 'c1-opt-ip',
            text: 'Can you read me your IP settings?',
            revealsClue: 'PC-FIN-04 configured DNS resolver is 192.168.10.250 which does not answer queries.',
            revealsTicketId: 'INC-1042',
            nextNodeId: 'c1-node-ip',
            satisfactionDelta: 10,
          },
        ],
      },
      'c1-node-restarted': {
        id: 'c1-node-restarted',
        speakerText: 'Yes, twice! My network icon says connected but websites time out.',
        choices: [
          {
            id: 'c1-opt-ip-after-restart',
            text: 'Can you read me your IP settings?',
            revealsClue: 'PC-FIN-04 configured DNS resolver is 192.168.10.250 which does not answer queries.',
            revealsTicketId: 'INC-1042',
            nextNodeId: 'c1-node-ip',
            satisfactionDelta: 5,
          },
          {
            id: 'c1-opt-remote',
            text: 'Let me inspect your network adapter settings remotely.',
            nextNodeId: 'c1-node-remote',
            satisfactionDelta: 5,
          },
        ],
      },
      'c1-node-ip': {
        id: 'c1-node-ip',
        speakerText: 'My DNS server says 192.168.10.250!',
        choices: [
          {
            id: 'c1-opt-dns-fix',
            text: '192.168.10.250 is inactive. I will reconfigure PC-FIN-04 to primary DNS at 192.168.10.200.',
            nextNodeId: 'c1-node-closing',
            satisfactionDelta: 15,
          },
        ],
      },
      'c1-node-remote': {
        id: 'c1-node-remote',
        speakerText: 'Okay, I have my screen open. Please take a look.',
        choices: [],
        isTerminal: true,
      },
      'c1-node-closing': {
        id: 'c1-node-closing',
        speakerText: 'Great, thank you! I will wait for you to apply the change.',
        choices: [],
        isTerminal: true,
      },
    },
  },
  {
    id: 'CALL-02',
    callerName: 'Liam Kumar',
    callerTitle: 'DevOps Lead',
    department: 'Engineering',
    callerHostId: 'PC-ENG-02',
    linkedTicketId: 'INC-1043',
    urgency: 'High',
    status: 'Ended',
    currentDialogueNodeId: 'c2-node-root',
    revealedClues: [],
    dialogueTree: {
      'c2-node-root': {
        id: 'c2-node-root',
        speakerText: 'Hey IT Support, Liam here. My workstation says my account is locked out and I cannot log in.',
        choices: [
          {
            id: 'c2-opt-what-happened',
            text: 'What were you doing before it locked?',
            revealsClue: 'User lkumar locked out in Active Directory.',
            revealsTicketId: 'INC-1043',
            nextNodeId: 'c2-node-sudo',
            satisfactionDelta: 10,
          },
          {
            id: 'c2-opt-wait',
            text: 'Wait for the 30-minute lockout policy timer to expire.',
            nextNodeId: 'c2-node-wait',
            satisfactionDelta: -10,
          },
        ],
      },
      'c2-node-sudo': {
        id: 'c2-node-sudo',
        speakerText: 'I locked myself out typing the sudo password into Windows lock screen.',
        choices: [
          {
            id: 'c2-opt-unlock',
            text: 'I will unlock your account in Active Directory right away.',
            nextNodeId: 'c2-node-closing',
            satisfactionDelta: 15,
          },
        ],
      },
      'c2-node-wait': {
        id: 'c2-node-wait',
        speakerText: 'I cannot wait, we have a deployment in 10 minutes! I locked myself out typing the sudo password into Windows lock screen.',
        choices: [
          {
            id: 'c2-opt-unlock-after-wait',
            text: 'Understood. Unlocking lkumar in Active Directory now.',
            revealsClue: 'User lkumar locked out in Active Directory.',
            revealsTicketId: 'INC-1043',
            nextNodeId: 'c2-node-closing',
            satisfactionDelta: 10,
          },
        ],
      },
      'c2-node-closing': {
        id: 'c2-node-closing',
        speakerText: 'Awesome, thanks! Let me know as soon as it is unlocked.',
        choices: [],
        isTerminal: true,
      },
    },
  },
  {
    id: 'CALL-03',
    callerName: 'Clara Jones',
    callerTitle: 'Marketing Specialist',
    department: 'Marketing',
    callerHostId: 'PC-MKT-03',
    linkedTicketId: 'INC-1052',
    urgency: 'Normal',
    status: 'Ended',
    currentDialogueNodeId: 'c3-node-root',
    revealedClues: [],
    dialogueTree: {
      'c3-node-root': {
        id: 'c3-node-root',
        speakerText: 'Hello Helpdesk, my desktop PC-MKT-03 suddenly lost its wired network connection.',
        choices: [
          {
            id: 'c3-opt-check-adapter',
            text: 'Did anything happen to the network adapter?',
            revealsClue: 'PC-MKT-03 network adapter disabled in Device Manager.',
            revealsTicketId: 'INC-1052',
            nextNodeId: 'c3-node-disabled',
            satisfactionDelta: 10,
          },
          {
            id: 'c3-opt-check-cable',
            text: 'Is the Ethernet cable plugged in securely at the back?',
            nextNodeId: 'c3-node-cable',
            satisfactionDelta: 0,
          },
        ],
      },
      'c3-node-disabled': {
        id: 'c3-node-disabled',
        speakerText: 'The Ethernet connection on the back was disabled in Device Manager.',
        choices: [
          {
            id: 'c3-opt-enable',
            text: 'I will enable the network adapter for you remotely.',
            nextNodeId: 'c3-node-closing',
            satisfactionDelta: 15,
          },
        ],
      },
      'c3-node-cable': {
        id: 'c3-node-cable',
        speakerText: 'Yes, the cable is plugged in firmly. But the Ethernet connection on the back was disabled in Device Manager.',
        choices: [
          {
            id: 'c3-opt-enable-from-cable',
            text: 'I will enable the network adapter in Device Manager right now.',
            revealsClue: 'PC-MKT-03 network adapter disabled in Device Manager.',
            revealsTicketId: 'INC-1052',
            nextNodeId: 'c3-node-closing',
            satisfactionDelta: 10,
          },
        ],
      },
      'c3-node-closing': {
        id: 'c3-node-closing',
        speakerText: 'Thank you so much!',
        choices: [],
        isTerminal: true,
      },
    },
  },
  {
    id: 'CALL-04',
    callerName: 'Elena Klein',
    callerTitle: 'Executive Receptionist',
    department: 'Executive',
    callerHostId: 'PC-EXEC-04',
    linkedTicketId: 'INC-1065',
    urgency: 'Normal',
    status: 'Ended',
    currentDialogueNodeId: 'c4-node-root',
    revealedClues: [],
    dialogueTree: {
      'c4-node-root': {
        id: 'c4-node-root',
        speakerText: 'Hello IT Support! The lobby visitor registration terminal keeps disconnecting intermittently when guests sign in.',
        choices: [
          {
            id: 'c4-opt-port',
            text: 'Can you check which network port the reception terminal connects to?',
            revealsClue: 'Reception desk Ethernet drop connects to Switch Port Gi1/0/12 on VLAN 20.',
            revealsTicketId: 'INC-1065',
            nextNodeId: 'c4-node-drop',
            satisfactionDelta: 10,
          },
          {
            id: 'c4-opt-cable',
            text: 'Has the Ethernet cable or power lead been disturbed recently?',
            revealsClue: 'Reception PC link speed fluctuates due to unshielded patch cable near high-voltage conduit.',
            revealsTicketId: 'INC-1065',
            nextNodeId: 'c4-node-closing',
            satisfactionDelta: 5,
          },
        ],
      },
      'c4-node-drop': {
        id: 'c4-node-drop',
        speakerText: 'It is connected to wall jack D-12 right behind the reception counter. The link light occasionally flashes amber instead of solid green.',
        choices: [
          {
            id: 'c4-opt-negotiate',
            text: 'Thank you, that confirms port duplex auto-negotiation failure on wall drop D-12. We are adjusting it now.',
            revealsClue: 'Wall drop D-12 port duplex is mismatching auto-negotiate, causing packet drops.',
            revealsTicketId: 'INC-1065',
            nextNodeId: 'c4-node-closing',
            satisfactionDelta: 10,
          },
        ],
      },
      'c4-node-closing': {
        id: 'c4-node-closing',
        speakerText: 'Thank you for looking into this so quickly! I will monitor the terminal.',
        choices: [],
        isTerminal: true,
      },
    },
  },
];

export const INITIAL_CALLS = SEED_CALLS;

export class PhoneEngine {
  private calls: PhoneCall[] = [];
  private ticketClues: Record<string, string[]> = {};
  private activeCallId: string | null = null;

  constructor(initialCalls?: PhoneCall[]) {
    this.reset(initialCalls);
  }

  public reset(initialCalls?: PhoneCall[]): void {
    const source = initialCalls || SEED_CALLS;
    this.calls = source.map((call) => ({
      ...call,
      revealedClues: [...call.revealedClues],
      dialogueTree: JSON.parse(JSON.stringify(call.dialogueTree)),
    }));
    this.ticketClues = {};
    this.activeCallId = null;
  }

  public getCalls(): PhoneCall[] {
    return this.calls.map((c) => ({
      ...c,
      revealedClues: [...c.revealedClues],
      dialogueTree: { ...c.dialogueTree },
    }));
  }

  public getCall(id: string): PhoneCall | undefined {
    return this.calls.find((c) => c.id === id);
  }

  public getActiveCall(): PhoneCall | null {
    if (this.activeCallId) {
      const active = this.calls.find((c) => c.id === this.activeCallId);
      if (active && (active.status === 'Connected' || active.status === 'Ringing')) {
        return active;
      }
    }
    const connected = this.calls.find((c) => c.status === 'Connected');
    if (connected) return connected;
    const ringing = this.calls.find((c) => c.status === 'Ringing');
    if (ringing) return ringing;
    return null;
  }

  public triggerCall(callId?: string): PhoneCall {
    const targetId = callId || this.calls.find((c) => c.status !== 'Connected')?.id || 'CALL-01';
    const call = this.calls.find((c) => c.id === targetId);
    if (!call) {
      throw new Error(`Call not found: ${targetId}`);
    }
    call.status = 'Ringing';
    this.activeCallId = targetId;
    const rootNodeId = Object.keys(call.dialogueTree)[0];
    if (rootNodeId) {
      call.currentDialogueNodeId = rootNodeId;
    }
    return call;
  }

  public answerCall(callId: string): boolean {
    const call = this.calls.find((c) => c.id === callId);
    if (!call) {
      return false;
    }
    call.status = 'Connected';
    return true;
  }

  public endCall(callId: string): boolean {
    const call = this.calls.find((c) => c.id === callId);
    if (!call) {
      return false;
    }
    call.status = 'Ended';
    return true;
  }

  public selectDialogueChoice(
    callId: string,
    choiceId: string
  ): { revealedClue?: string; linkedTicketId?: string; nextNode: DialogueNode | null } {
    const call = this.calls.find((c) => c.id === callId);
    if (!call) {
      return { nextNode: null };
    }

    const currentNode = call.dialogueTree[call.currentDialogueNodeId];
    if (!currentNode) {
      return { nextNode: null };
    }

    const choice = currentNode.choices.find((ch) => ch.id === choiceId);
    if (!choice) {
      return { nextNode: currentNode };
    }

    const revealedClue = choice.revealsClue;
    const linkedTicketId = choice.revealsTicketId || call.linkedTicketId;

    if (revealedClue) {
      if (!call.revealedClues.includes(revealedClue)) {
        call.revealedClues.push(revealedClue);
      }
      if (linkedTicketId) {
        if (!this.ticketClues[linkedTicketId]) {
          this.ticketClues[linkedTicketId] = [];
        }
        if (!this.ticketClues[linkedTicketId].includes(revealedClue)) {
          this.ticketClues[linkedTicketId].push(revealedClue);
        }
      }
    }

    let nextNode: DialogueNode | null = null;
    if (choice.nextNodeId && call.dialogueTree[choice.nextNodeId]) {
      call.currentDialogueNodeId = choice.nextNodeId;
      nextNode = call.dialogueTree[choice.nextNodeId];
    }

    return {
      revealedClue,
      linkedTicketId,
      nextNode,
    };
  }

  public getRevealedClues(ticketId: string): string[] {
    const cluesFromMap = this.ticketClues[ticketId] || [];
    const cluesFromCalls = this.calls
      .filter((c) => c.linkedTicketId === ticketId)
      .flatMap((c) => c.revealedClues);

    return Array.from(new Set([...cluesFromMap, ...cluesFromCalls]));
  }
}

export const phoneEngine = new PhoneEngine();
