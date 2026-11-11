import type {
  PatchCable,
  ServerRaidArray,
  UpsState,
  RackUnitState,
} from '../types/rack';

const INITIAL_CABLES: PatchCable[] = [
  {
    id: 'CBL-101',
    label: 'Cat6A Trunk - Domain Controller',
    panelPort: 'PP-01 Port 01',
    switchId: 'SW-CORE-01',
    switchPort: 'Gi0/1',
    targetHostId: 'DC-SRV-01',
    status: 'Good',
    attenuationDb: 2.8,
    lengthMeters: 5,
  },
  {
    id: 'CBL-102',
    label: 'Cat6A Trunk - File Server Primary',
    panelPort: 'PP-01 Port 04',
    switchId: 'SW-CORE-01',
    switchPort: 'Gi0/4',
    targetHostId: 'FS-SRV-01',
    status: 'Good',
    attenuationDb: 3.1,
    lengthMeters: 6,
  },
  {
    id: 'CBL-103',
    label: 'Cat6A Trunk - SQL Production Cluster',
    panelPort: 'PP-01 Port 08',
    switchId: 'SW-CORE-01',
    switchPort: 'Gi0/8',
    targetHostId: 'SQL-PROD-01',
    status: 'Good',
    attenuationDb: 2.5,
    lengthMeters: 4,
  },
  {
    id: 'CBL-104',
    label: 'Cat6 Horizontal Run - Sales Drop 18',
    panelPort: 'PP-01 Port 18',
    switchId: 'SW-EDGE-01',
    switchPort: 'Gi0/18',
    targetHostId: 'PC-SALES-02',
    status: 'Crosstalk',
    attenuationDb: 48.5,
    lengthMeters: 42,
  },
  {
    id: 'CBL-105',
    label: 'Cat6 Horizontal Run - Finance Drop 12',
    panelPort: 'PP-01 Port 12',
    switchId: 'SW-EDGE-01',
    switchPort: 'Gi0/12',
    targetHostId: 'PC-FIN-01',
    status: 'Good',
    attenuationDb: 4.0,
    lengthMeters: 28,
  },
  {
    id: 'CBL-106',
    label: 'Cat6A Uplink - Intranet Web Node',
    panelPort: 'PP-01 Port 22',
    switchId: 'SW-CORE-01',
    switchPort: 'Gi0/22',
    targetHostId: 'WEB-INTRA-01',
    status: 'Good',
    attenuationDb: 3.4,
    lengthMeters: 8,
  },
];

const INITIAL_RAID_ARRAYS: ServerRaidArray[] = [
  {
    serverId: 'FS-SRV-01',
    raidLevel: 'RAID-5',
    status: 'Degraded',
    bays: [
      {
        bayIndex: 0,
        serial: 'SAS-9001A',
        capacityTb: 4,
        status: 'Online',
        smartErrors: 0,
      },
      {
        bayIndex: 1,
        serial: 'SAS-9002B',
        capacityTb: 4,
        status: 'Online',
        smartErrors: 0,
      },
      {
        bayIndex: 2,
        serial: 'SAS-9003C',
        capacityTb: 4,
        status: 'Faulty',
        smartErrors: 142,
      },
      {
        bayIndex: 3,
        serial: 'SAS-9004D',
        capacityTb: 4,
        status: 'Online',
        smartErrors: 0,
      },
    ],
  },
  {
    serverId: 'SQL-PROD-01',
    raidLevel: 'RAID-10',
    status: 'Healthy',
    bays: [
      {
        bayIndex: 0,
        serial: 'NVME-4101A',
        capacityTb: 2,
        status: 'Online',
        smartErrors: 0,
      },
      {
        bayIndex: 1,
        serial: 'NVME-4102B',
        capacityTb: 2,
        status: 'Online',
        smartErrors: 0,
      },
      {
        bayIndex: 2,
        serial: 'NVME-4103C',
        capacityTb: 2,
        status: 'Online',
        smartErrors: 0,
      },
      {
        bayIndex: 3,
        serial: 'NVME-4104D',
        capacityTb: 2,
        status: 'Online',
        smartErrors: 0,
      },
    ],
  },
];

const INITIAL_UPS: UpsState = {
  model: 'APC-UPS-3000VA',
  inputVoltage: 120.2,
  outputVoltage: 120.0,
  batteryChargePercent: 98,
  loadPercent: 64,
  mode: 'Online',
  isHealthy: true,
};

export class RackEngine {
  private state: RackUnitState;

  constructor() {
    this.state = {
      cables: INITIAL_CABLES.map((c) => ({ ...c })),
      raidArrays: INITIAL_RAID_ARRAYS.map((arr) => ({
        ...arr,
        bays: arr.bays.map((b) => ({ ...b })),
      })),
      ups: { ...INITIAL_UPS },
    };
  }

  public getState(): RackUnitState {
    return {
      cables: this.getCables(),
      raidArrays: this.getRaidArrays(),
      ups: this.getUpsState(),
    };
  }

  public getCables(): PatchCable[] {
    return this.state.cables.map((c) => ({ ...c }));
  }

  public runCableTdrTest(cableId: string): {
    cable: PatchCable;
    passed: boolean;
    diagnosticMessage: string;
  } {
    const found = this.state.cables.find((c) => c.id === cableId);
    if (!found) {
      throw new Error(`Patch cable ${cableId} not found`);
    }

    const cable = { ...found };
    const passed = cable.status === 'Good' && cable.attenuationDb <= 15;
    let diagnosticMessage = `TDR PASS: ${cable.id} (${cable.panelPort} -> ${cable.switchId} ${cable.switchPort}) attenuation ${cable.attenuationDb} dB within TIA/EIA-568 Cat6 spec.`;

    if (!passed) {
      if (cable.status === 'Crosstalk') {
        diagnosticMessage = `TDR FAIL: NEXT/FEXT near-end crosstalk & split pair detected at ${cable.lengthMeters}m (${cable.attenuationDb} dB attenuation). Replace and re-patch to ${cable.switchId} Gi0/18.`;
      } else if (cable.status === 'Unplugged') {
        diagnosticMessage = `TDR FAIL: Open circuit on ${cable.id}. Patch cord unplugged at switch port.`;
      } else {
        diagnosticMessage = `TDR FAIL: Excessive insertion loss (${cable.attenuationDb} dB) on ${cable.id}.`;
      }
    }

    return {
      cable,
      passed,
      diagnosticMessage,
    };
  }

  public replaceAndPatchCable(
    cableId: string,
    switchPort: string
  ): PatchCable | undefined {
    const cable = this.state.cables.find((c) => c.id === cableId);
    if (!cable) {
      return undefined;
    }

    cable.status = 'Good';
    cable.attenuationDb = 3.2;
    cable.switchPort = switchPort.trim();
    return { ...cable };
  }

  public getRaidArrays(): ServerRaidArray[] {
    return this.state.raidArrays.map((arr) => ({
      ...arr,
      bays: arr.bays.map((b) => ({ ...b })),
    }));
  }

  public hotSwapRaidDrive(
    serverId: string,
    bayIndex: number
  ): ServerRaidArray | undefined {
    const array = this.state.raidArrays.find((a) => a.serverId === serverId);
    if (!array) {
      return undefined;
    }

    const bay = array.bays.find((b) => b.bayIndex === bayIndex);
    if (!bay) {
      return undefined;
    }

    bay.status = 'Online';
    bay.smartErrors = 0;
    bay.serial = `SAS-SPARE-0${bayIndex + 1}X`;

    const allOnline = array.bays.every((b) => b.status === 'Online');
    if (allOnline) {
      array.status = 'Healthy';
    }

    return {
      ...array,
      bays: array.bays.map((b) => ({ ...b })),
    };
  }

  public getUpsState(): UpsState {
    return { ...this.state.ups };
  }

  public toggleUpsBypass(enableBypass: boolean): UpsState {
    this.state.ups.mode = enableBypass ? 'Battery Bypass' : 'Online';
    this.state.ups.isHealthy = true;
    return this.getUpsState();
  }

  public isRackHealthyForTicket(): boolean {
    const cable104 = this.state.cables.find((c) => c.id === 'CBL-104');
    const fsRaid = this.state.raidArrays.find(
      (a) => a.serverId === 'FS-SRV-01'
    );

    const cableHealthy =
      cable104 !== undefined &&
      cable104.status === 'Good' &&
      cable104.switchPort === 'Gi0/18';

    const raidHealthy =
      fsRaid !== undefined && fsRaid.status === 'Healthy';

    return cableHealthy && raidHealthy;
  }
}
