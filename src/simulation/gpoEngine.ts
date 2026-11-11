import { NetworkEngine } from './networkEngine';
import { GpoObject, GpoScope, GpoSettingId } from '../types/gpo';

export interface GpoSettingDefinition {
  id: GpoSettingId;
  name: string;
  category: 'Computer Configuration' | 'User Configuration';
  description: string;
  defaultValue: string | number | boolean;
}

export const GPO_SETTING_CATALOG: Record<GpoSettingId, GpoSettingDefinition> = {
  block_usb_storage: {
    id: 'block_usb_storage',
    name: 'Block Removable Storage Devices',
    category: 'Computer Configuration',
    description: 'Denies read and write access to USB storage devices.',
    defaultValue: true,
  },
  password_complexity: {
    id: 'password_complexity',
    name: 'Password Must Meet Complexity Requirements',
    category: 'Computer Configuration',
    description: 'Requires passwords to have uppercase, lowercase, numbers, and symbols.',
    defaultValue: true,
  },
  max_password_age_days: {
    id: 'max_password_age_days',
    name: 'Maximum Password Age',
    category: 'Computer Configuration',
    description: 'Determines the period of time (in days) that a password can be used before it expires.',
    defaultValue: 60,
  },
  map_drive_finance: {
    id: 'map_drive_finance',
    name: 'Map Finance Share to Drive F:',
    category: 'User Configuration',
    description: 'Automatically map \\\\fs-srv-01\\Finance to F: drive on logon.',
    defaultValue: 'F: (\\\\fs-srv-01\\Finance)',
  },
  map_drive_public: {
    id: 'map_drive_public',
    name: 'Map Public Share to Drive P:',
    category: 'User Configuration',
    description: 'Automatically map \\\\fs-srv-01\\Public to P: drive on logon.',
    defaultValue: 'P: (\\\\fs-srv-01\\Public)',
  },
  disable_cmd: {
    id: 'disable_cmd',
    name: 'Prevent Access to Command Prompt',
    category: 'User Configuration',
    description: 'Disables running cmd.exe on user workstations.',
    defaultValue: true,
  },
  restrict_script_execution: {
    id: 'restrict_script_execution',
    name: 'Restrict Script Execution Policy',
    category: 'Computer Configuration',
    description: 'Restricts unsigned PowerShell and batch scripts from running without authorization.',
    defaultValue: true,
  },
};

export const INITIAL_GPO_OBJECTS: GpoObject[] = [
  {
    id: 'GPO-01',
    name: 'Default Domain Policy',
    scope: 'Domain',
    targetOu: 'All',
    enabled: true,
    enforced: true,
    settings: [
      {
        id: 'password_complexity',
        name: 'Password Must Meet Complexity Requirements',
        category: 'Computer Configuration',
        description: 'Requires passwords to have uppercase, lowercase, numbers, and symbols.',
        enabled: true,
        value: true,
      },
      {
        id: 'max_password_age_days',
        name: 'Maximum Password Age',
        category: 'Computer Configuration',
        description: 'Determines the period of time (in days) that a password can be used before it expires.',
        enabled: true,
        value: 60,
      },
    ],
  },
  {
    id: 'GPO-02',
    name: 'Removable Storage Restriction',
    scope: 'OU',
    targetOu: 'Finance',
    enabled: true,
    enforced: false,
    settings: [
      {
        id: 'block_usb_storage',
        name: 'Block Removable Storage Devices',
        category: 'Computer Configuration',
        description: 'Denies read and write access to USB storage devices.',
        enabled: true,
        value: true,
      },
    ],
  },
  {
    id: 'GPO-03',
    name: 'Department Network Drive Maps',
    scope: 'OU',
    targetOu: 'Finance',
    enabled: true,
    enforced: false,
    settings: [
      {
        id: 'map_drive_finance',
        name: 'Map Finance Share to Drive F:',
        category: 'User Configuration',
        description: 'Automatically map \\\\fs-srv-01\\Finance to F: drive on logon.',
        enabled: true,
        value: 'F: (\\\\fs-srv-01\\Finance)',
      },
      {
        id: 'map_drive_public',
        name: 'Map Public Share to Drive P:',
        category: 'User Configuration',
        description: 'Automatically map \\\\fs-srv-01\\Public to P: drive on logon.',
        enabled: true,
        value: 'P: (\\\\fs-srv-01\\Public)',
      },
    ],
  },
  {
    id: 'GPO-04',
    name: 'Developer & Engineering Hardening',
    scope: 'OU',
    targetOu: 'Engineering',
    enabled: true,
    enforced: false,
    settings: [
      {
        id: 'restrict_script_execution',
        name: 'Restrict Script Execution Policy',
        category: 'Computer Configuration',
        description: 'Restricts unsigned PowerShell and batch scripts from running without authorization.',
        enabled: true,
        value: true,
      },
    ],
  },
];

export interface HostEffectivePolicy {
  usbBlocked: boolean;
  mappedDrives: string[];
  scriptsRestricted: boolean;
  passwordComplexity: boolean;
}

export class GpoEngine {
  private networkEngine: NetworkEngine;
  private gpos: GpoObject[] = [];

  constructor(networkEngine: NetworkEngine, initialGpos: GpoObject[] = INITIAL_GPO_OBJECTS) {
    this.networkEngine = networkEngine;
    this.gpos = initialGpos.map((g) => ({
      ...g,
      settings: g.settings.map((s) => ({ ...s })),
    }));
  }

  public getGpos(): GpoObject[] {
    return this.gpos.map((g) => ({
      ...g,
      settings: g.settings.map((s) => ({ ...s })),
    }));
  }

  public getGpo(id: string): GpoObject | undefined {
    return this.gpos.find((g) => g.id.toLowerCase() === id.toLowerCase());
  }

  public linkGpoToOu(gpoId: string, ouName: string): boolean {
    const gpo = this.getGpo(gpoId);
    if (!gpo) return false;

    if (!gpo.targetOu || gpo.targetOu.trim() === '' || gpo.targetOu === 'None') {
      gpo.targetOu = ouName;
      return true;
    }

    const ous = gpo.targetOu.split(',').map((s) => s.trim());
    if (!ous.some((ou) => ou.toLowerCase() === ouName.toLowerCase())) {
      ous.push(ouName);
      gpo.targetOu = ous.join(', ');
    }
    return true;
  }

  public unlinkGpoFromOu(gpoId: string, ouName: string): boolean {
    const gpo = this.getGpo(gpoId);
    if (!gpo || !gpo.targetOu) return false;

    const ous = gpo.targetOu.split(',').map((s) => s.trim());
    const filtered = ous.filter((ou) => ou.toLowerCase() !== ouName.toLowerCase());
    if (filtered.length === ous.length) return false;

    gpo.targetOu = filtered.length > 0 ? filtered.join(', ') : undefined;
    return true;
  }

  public toggleGpoSetting(
    gpoId: string,
    settingId: GpoSettingId,
    enabled: boolean,
    value?: any
  ): boolean {
    const gpo = this.getGpo(gpoId);
    if (!gpo) return false;

    const setting = gpo.settings.find((s) => s.id === settingId);
    if (setting) {
      setting.enabled = enabled;
      if (value !== undefined) {
        setting.value = value;
      }
      return true;
    }

    const def = GPO_SETTING_CATALOG[settingId];
    if (!def) return false;

    gpo.settings.push({
      id: settingId,
      name: def.name,
      category: def.category,
      description: def.description,
      enabled,
      value: value !== undefined ? value : def.defaultValue,
    });
    return true;
  }

  public getHostOu(hostId: string): string | undefined {
    const host = this.networkEngine.getHost(hostId);
    if (!host) return undefined;
    if (host.activeDirectoryUsername) {
      const user = this.networkEngine.getADUser(host.activeDirectoryUsername);
      if (user?.ou) return user.ou;
    }
    return host.department;
  }

  public getApplicableGposForHost(hostId: string): GpoObject[] {
    const host = this.networkEngine.getHost(hostId);
    if (!host) return [];
    const hostOu = this.getHostOu(hostId);

    return this.gpos.filter((gpo) => {
      if (!gpo.enabled) return false;
      if (gpo.scope === 'Domain' || gpo.targetOu === 'All') return true;
      if (!hostOu || !gpo.targetOu) return false;

      const targetOus = gpo.targetOu.split(',').map((ou) => ou.trim().toLowerCase());
      return targetOus.includes(hostOu.toLowerCase()) || targetOus.includes('all');
    });
  }

  public getEffectivePolicyForHost(hostId: string): HostEffectivePolicy {
    const applicable = this.getApplicableGposForHost(hostId);

    let usbBlocked = false;
    let scriptsRestricted = false;
    let passwordComplexity = false;
    const mappedDrives: string[] = [];

    for (const gpo of applicable) {
      for (const setting of gpo.settings) {
        if (!setting.enabled) continue;
        switch (setting.id) {
          case 'block_usb_storage':
            if (setting.value !== false) usbBlocked = true;
            break;
          case 'restrict_script_execution':
            if (setting.value !== false) scriptsRestricted = true;
            break;
          case 'password_complexity':
            if (setting.value !== false) passwordComplexity = true;
            break;
          case 'map_drive_finance': {
            const drive =
              typeof setting.value === 'string'
                ? setting.value
                : 'F: (\\\\fs-srv-01\\Finance)';
            if (!mappedDrives.includes(drive)) mappedDrives.push(drive);
            break;
          }
          case 'map_drive_public': {
            const drive =
              typeof setting.value === 'string'
                ? setting.value
                : 'P: (\\\\fs-srv-01\\Public)';
            if (!mappedDrives.includes(drive)) mappedDrives.push(drive);
            break;
          }
        }
      }
    }

    return {
      usbBlocked,
      mappedDrives,
      scriptsRestricted,
      passwordComplexity,
    };
  }

  public isUsbBlocked(hostId: string): boolean {
    return this.getEffectivePolicyForHost(hostId).usbBlocked;
  }

  public getMappedDrives(hostId: string): string[] {
    return this.getEffectivePolicyForHost(hostId).mappedDrives;
  }

  public createGpo(name: string, scope: GpoScope, targetOu?: string): GpoObject {
    const newId = `GPO-${(this.gpos.length + 1).toString().padStart(2, '0')}`;
    const newGpo: GpoObject = {
      id: newId,
      name,
      scope,
      targetOu,
      enabled: true,
      enforced: false,
      settings: [],
    };
    this.gpos.push(newGpo);
    return newGpo;
  }

  public deleteGpo(id: string): boolean {
    const idx = this.gpos.findIndex((g) => g.id.toLowerCase() === id.toLowerCase());
    if (idx === -1) return false;
    this.gpos.splice(idx, 1);
    return true;
  }

  public setGpoEnabled(id: string, enabled: boolean): boolean {
    const gpo = this.getGpo(id);
    if (!gpo) return false;
    gpo.enabled = enabled;
    return true;
  }

  public setGpoEnforced(id: string, enforced: boolean): boolean {
    const gpo = this.getGpo(id);
    if (!gpo) return false;
    gpo.enforced = enforced;
    return true;
  }
}
