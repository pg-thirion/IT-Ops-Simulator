export type PostCode = string; // e.g. '00', '55', 'FF', '12', '99'

export interface HardwareComponent {
  id: string;
  slot: 'CPU' | 'RAM_SLOT_1' | 'RAM_SLOT_2' | 'NVME' | 'PSU' | 'NIC';
  name: string;
  status: 'Good' | 'Defective' | 'Unseated' | 'Overheating' | 'Missing';
  specs: string;
}

export interface PsuRails {
  rail12V: number;
  rail5V: number;
  rail3V3: number;
  isGood: boolean;
}

export interface HardwareWorkbenchState {
  hostId: string;
  hostname: string;
  caseOpen: boolean;
  poweredOn: boolean;
  postCode: PostCode;
  postMessage: string;
  thermalPasteCondition: 'Good' | 'Dried' | 'None';
  components: Record<string, HardwareComponent>;
  inventoryParts: HardwareComponent[];
  repaired: boolean;
}
