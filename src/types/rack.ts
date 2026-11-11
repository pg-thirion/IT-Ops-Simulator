export type PatchCableStatus = 'Good' | 'Crosstalk' | 'Unplugged';

export interface PatchCable {
  id: string;
  label: string;
  panelPort: string;
  switchId: string;
  switchPort: string;
  targetHostId: string;
  status: PatchCableStatus;
  attenuationDb: number;
  lengthMeters: number;
}

export type RaidDriveStatus = 'Online' | 'Faulty' | 'Rebuilding' | 'Empty';

export interface RaidDriveBay {
  bayIndex: number;
  serial: string;
  capacityTb: number;
  status: RaidDriveStatus;
  smartErrors: number;
}

export interface ServerRaidArray {
  serverId: string;
  raidLevel: 'RAID-1' | 'RAID-5' | 'RAID-10';
  status: 'Healthy' | 'Degraded' | 'Offline';
  bays: RaidDriveBay[];
}

export interface UpsState {
  model: string;
  inputVoltage: number;
  outputVoltage: number;
  batteryChargePercent: number;
  loadPercent: number;
  mode: 'Online' | 'Battery Bypass' | 'Overload';
  isHealthy: boolean;
}

export interface RackUnitState {
  cables: PatchCable[];
  raidArrays: ServerRaidArray[];
  ups: UpsState;
}
