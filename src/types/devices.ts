export type Device = {
  name: string;
  type: string;
  available: boolean;
  value: number;
  id: string;
  roomName?: string;
  idUser?: string;
  
  customName?: string;
  icon?: string;
  parentNodeCustomName?: string;
  active?: boolean;
  origin?: string;
  devCustomName?: string;
  destination?: string;
  classification?: string;

  charts?: {
    realtime?: {
        currentIntensity?: boolean;
        voltage?: boolean;
        power?: boolean;
        // manca una proprietà
    },
    history?: {
        currentIntensity?: boolean;
        voltage?: boolean;
        power?: boolean;
        // manca una proprietà
        consumption?: boolean;
    },
    annualSummary?: {
        electricDemand?: boolean;
        hourlyConsumptions?: boolean;
        mainActivityConsumptions?: boolean;
    },
    monthlySummary?: {
        hourlyConsumptions?: boolean;
        // manca una proprietà
        // manca una proprietà
    },
    dailyProfile?: {
        summer?: boolean;
        winter?: boolean;
    }
  }
}

/* MODAL VALUES */

export const ACTIVE_YES = 'Sì' as const;
export const ACTIVE_NO = 'No' as const;
export const ACTIVE_STATES = [ACTIVE_YES, ACTIVE_NO] as const;

export const CLASSIFICATION_MAIN_ACTIVITY = 'Attività principale' as const;
export const CLASSIFICATION_GENERAL_SERVICES = 'Servizi generali' as const;
export const CLASSIFICATION_AUSILIAR_SERVICES = 'Servizi ausiliari' as const;
export const DEVICE_CLASSIFICATIONS = [
  CLASSIFICATION_MAIN_ACTIVITY, 
  CLASSIFICATION_GENERAL_SERVICES, 
  CLASSIFICATION_AUSILIAR_SERVICES,
] as const;

export const MEASURE_ICON = 'Misura' as const;
export const ELECTRICAL_PANEL_ICON = 'Pannello elettrico' as const;
export const OVEN_ICON = 'Forno' as const;
export const FRIDGE_ICON = 'Frigorifero' as const;
export const HEAT_PUMP_ICON = 'Pompa di calore' as const;
export const CSV_ENEL_ICON = 'Csv Enel' as const;
export const DEVICE_ICONS = [
  MEASURE_ICON,
  ELECTRICAL_PANEL_ICON,
  OVEN_ICON,
  FRIDGE_ICON,
  HEAT_PUMP_ICON,
  CSV_ENEL_ICON,
] as const;

export const DEVICE_ORIGIN_DEV = 'Dispositivo' as const;
export const DEVICE_ORIGIN_CSV = 'CSV' as const;
export const DEVICE_ORIGINS = [
  DEVICE_ORIGIN_DEV,
  DEVICE_ORIGIN_CSV,
] as const;

export const DEVICE_SINGLE_PHASE = 'Monofase' as const;
export const DEVICE_THREE_PHASE = 'Trifase' as const;
export const DEVICE_PHASES = [
  DEVICE_SINGLE_PHASE,
  DEVICE_THREE_PHASE,
] as const;

export type DeviceState = typeof ACTIVE_STATES[number];
export type DeviceClassification = typeof DEVICE_CLASSIFICATIONS[number];
export type DeviceIcon = typeof DEVICE_ICONS[number];
export type DeviceOrigins = typeof DEVICE_ORIGINS[number];
export type DevicePhase = typeof DEVICE_PHASES[number];

export type DeviceModalValues = {
  customName?: string;
  icon?: string; 
  parentNodeCustomName?: string;
  active?: boolean;
  origin?: string;
  devCustomName?: string;
  destination?: string;
  classification?: string;
  phase: string;
  // grafici
  rtCurrentIntensity: boolean;
  rtVoltage: boolean;
  rtPower: boolean;
  hCurrentIntensity: boolean;
  hVoltage: boolean;
  hPower: boolean;
  hEnergy: boolean;
  asElectricDemand: boolean;
  asHourlyConsumption: boolean;
  asMainActivityConsumption: boolean;
  msHourlyConsumption: boolean;
  dpSummer: boolean;
  dpWinter: boolean;
}

export type Period = {
  from: Date;
  to: Date;
}
