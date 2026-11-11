import {
  HardwareWorkbenchState,
  PostCode,
  PsuRails,
} from '../types/hardware';

export const SEED_BENCH_STATE: HardwareWorkbenchState = {
  hostId: 'PC-MKT-03',
  hostname: 'pc-mkt-03.corp.local',
  caseOpen: true,
  poweredOn: true,
  postCode: '55',
  postMessage: 'Memory Not Detected / Incompatible Module',
  thermalPasteCondition: 'Dried',
  repaired: false,
  components: {
    RAM_SLOT_1: {
      id: 'RAM-DEF-01',
      slot: 'RAM_SLOT_1',
      name: '16GB DDR5-4800 (Faulty)',
      status: 'Defective',
      specs: '16GB DDR5-4800 CL40 UDIMM',
    },
    RAM_SLOT_2: {
      id: 'RAM-EMPTY-02',
      slot: 'RAM_SLOT_2',
      name: 'Empty DIMM Slot',
      status: 'Missing',
      specs: 'DDR5 DIMM Slot 2 (Unpopulated)',
    },
    CPU: {
      id: 'CPU-01',
      slot: 'CPU',
      name: 'Intel Core i7-13700',
      status: 'Overheating',
      specs: '16 Cores (8P+8E), 24 Threads, 2.10 - 5.20 GHz (98C Throttling)',
    },
    PSU: {
      id: 'PSU-01',
      slot: 'PSU',
      name: 'Corsair RM650 650W',
      status: 'Good',
      specs: '650W ATX12V 80-Plus Gold',
    },
    NVME: {
      id: 'NVME-01',
      slot: 'NVME',
      name: 'Samsung PM9A1 512GB NVMe SSD',
      status: 'Good',
      specs: '512GB PCIe Gen4 x4 M.2 2280',
    },
    NIC: {
      id: 'NIC-01',
      slot: 'NIC',
      name: 'Intel I219-V Gigabit Network Connection',
      status: 'Good',
      specs: '10/100/1000 Mbps Integrated PCIe Ethernet',
    },
  },
  inventoryParts: [
    {
      id: 'INV-RAM-16',
      slot: 'RAM_SLOT_1',
      name: '16GB DDR5-5600 Module',
      status: 'Good',
      specs: '16GB DDR5-5600 CL36 UDIMM',
    },
    {
      id: 'INV-PASTE-01',
      slot: 'CPU',
      name: 'Thermal Grizzly Kryonaut Compound Tube',
      status: 'Good',
      specs: '12.5 W/mK High Performance Thermal Interface Material',
    },
    {
      id: 'INV-PSU-750',
      slot: 'PSU',
      name: '750W 80-Plus Gold Power Supply',
      status: 'Good',
      specs: '750W 80-Plus Gold Fully Modular ATX',
    },
    {
      id: 'INV-SSD-1TB',
      slot: 'NVME',
      name: '1TB NVMe Gen4 SSD',
      status: 'Good',
      specs: '1TB NVMe M.2 2280 PCIe Gen4 x4',
    },
  ],
};

export const INITIAL_HARDWARE_BENCH_STATE = SEED_BENCH_STATE;

export class HardwareEngine {
  private benchState: HardwareWorkbenchState;

  constructor(initialState?: HardwareWorkbenchState) {
    this.benchState = this.cloneState(initialState || SEED_BENCH_STATE);
  }

  private cloneState(state: HardwareWorkbenchState): HardwareWorkbenchState {
    return {
      ...state,
      components: Object.fromEntries(
        Object.entries(state.components).map(([k, v]) => [k, { ...v }])
      ),
      inventoryParts: state.inventoryParts.map((p) => ({ ...p })),
    };
  }

  public reset(initialState?: HardwareWorkbenchState): void {
    this.benchState = this.cloneState(initialState || SEED_BENCH_STATE);
  }

  public getBenchState(): HardwareWorkbenchState {
    return this.cloneState(this.benchState);
  }

  public isPoweredOn(): boolean {
    return this.benchState.poweredOn;
  }

  public powerOff(): void {
    this.benchState.poweredOn = false;
  }

  public evaluatePost(): { code: PostCode; message: string; isPassing: boolean } {
    const ram1 = this.benchState.components['RAM_SLOT_1'];
    const ram2 = this.benchState.components['RAM_SLOT_2'];

    const hasInstalledRam =
      (ram1 && ram1.status !== 'Missing') || (ram2 && ram2.status !== 'Missing');
    const hasFaultyRam =
      (ram1 && (ram1.status === 'Defective' || ram1.status === 'Unseated')) ||
      (ram2 && (ram2.status === 'Defective' || ram2.status === 'Unseated'));

    if (!hasInstalledRam || hasFaultyRam) {
      return {
        code: '55',
        message: 'Memory Not Detected / Incompatible Module',
        isPassing: false,
      };
    }

    const cpu = this.benchState.components['CPU'];
    if (
      !cpu ||
      cpu.status === 'Missing' ||
      cpu.status === 'Defective' ||
      this.benchState.thermalPasteCondition === 'Dried' ||
      this.benchState.thermalPasteCondition === 'None'
    ) {
      return {
        code: 'FF',
        message: 'CPU Thermal Overheat / Fault',
        isPassing: false,
      };
    }

    const psu = this.benchState.components['PSU'];
    if (!psu || psu.status !== 'Good') {
      return {
        code: '12',
        message: 'Power Delivery Failure / Rails Out of Spec',
        isPassing: false,
      };
    }

    const nvme = this.benchState.components['NVME'];
    if (!nvme || nvme.status !== 'Good') {
      return {
        code: '99',
        message: 'Storage or Peripheral Initialization Failure',
        isPassing: false,
      };
    }

    return {
      code: '00',
      message: 'Normal POST - All Hardware Verified',
      isPassing: true,
    };
  }

  public powerOn(): { postCode: PostCode; postMessage: string; success: boolean } {
    this.benchState.poweredOn = true;
    const post = this.evaluatePost();
    this.benchState.postCode = post.code;
    this.benchState.postMessage = post.message;
    if (post.isPassing) {
      this.benchState.repaired = true;
    }
    return {
      postCode: post.code,
      postMessage: post.message,
      success: post.isPassing,
    };
  }

  public swapComponent(
    slot: 'RAM_SLOT_1' | 'RAM_SLOT_2' | 'NVME' | 'PSU' | 'NIC',
    inventoryItemId: string
  ): boolean {
    if (this.benchState.poweredOn) {
      return false;
    }

    const itemIndex = this.benchState.inventoryParts.findIndex((p) => p.id === inventoryItemId);
    if (itemIndex === -1) {
      return false;
    }

    const newPart = this.benchState.inventoryParts[itemIndex];
    const oldPart = this.benchState.components[slot];

    this.benchState.inventoryParts.splice(itemIndex, 1);

    if (oldPart && oldPart.status !== 'Missing') {
      this.benchState.inventoryParts.push({ ...oldPart });
    }

    this.benchState.components[slot] = {
      ...newPart,
      slot,
    };

    return true;
  }

  public reapplyThermalPaste(): boolean {
    if (this.benchState.poweredOn) {
      return false;
    }

    this.benchState.thermalPasteCondition = 'Good';
    if (this.benchState.components['CPU']) {
      this.benchState.components['CPU'].status = 'Good';
    }
    return true;
  }

  public testPsuRails(): PsuRails {
    const psu = this.benchState.components['PSU'];
    if (!psu || psu.status !== 'Good') {
      return {
        rail12V: 10.15,
        rail5V: 4.12,
        rail3V3: 2.78,
        isGood: false,
      };
    }

    return {
      rail12V: 12.05,
      rail5V: 5.02,
      rail3V3: 3.31,
      isGood: true,
    };
  }
}

export const hardwareEngine = new HardwareEngine();
