export type GpoScope = 'Domain' | 'OU';

export type GpoSettingId =
  | 'block_usb_storage'
  | 'password_complexity'
  | 'max_password_age_days'
  | 'map_drive_finance'
  | 'map_drive_public'
  | 'disable_cmd'
  | 'restrict_script_execution';

export interface GpoSetting {
  id: GpoSettingId;
  name: string;
  category: 'Computer Configuration' | 'User Configuration';
  description: string;
  enabled: boolean;
  value?: string | number | boolean;
}

export interface GpoObject {
  id: string;
  name: string;
  scope: GpoScope;
  targetOu?: string; // e.g. 'Finance', 'Engineering', 'Executive', 'All'
  enabled: boolean;
  enforced: boolean;
  settings: GpoSetting[];
}
