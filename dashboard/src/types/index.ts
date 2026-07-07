// Types mirror the JSON emitted by pipeline/build_data.py. Keep in sync with schema.py.

export type Status = "Active" | "Obsolete" | "On hold" | "On going";
export type Criticality = "High" | "Medium" | "Low";
export type Role = "Developed" | "Coached" | "Minor Fix";
export type CapabilityCenter = "MCC" | "KCC";

export interface Project {
  id: number;
  name: string;
  capabilityCenter: CapabilityCenter;
  country: string;
  countryIso2: string | null;
  countryIso3: string | null;
  status: Status;
  criticality: Criticality;
  role: Role;
  devHours: number;
  frequencyPerYear: number;
  manualMinutes: number;
  autoMinutes: number;
  hoursBefore: number;
  hoursAfter: number;
  hoursSaved: number;
  reductionPct: number;
  // Efficiency: devHours is a one-time cost; hoursSaved is annual. Null when undefined.
  leverage: number | null;
  paybackWeeks: number | null;
  firstYearNet: number;
}

export interface CountryAgg {
  country: string;
  countryIso2: string | null;
  countryIso3: string | null;
  projectCount: number;
  hoursSaved: number;
  devHours: number;
}

export interface GroupAgg {
  label: string;
  count: number;
  hoursSaved: number;
  devHours: number;
}

export interface ParetoItem {
  id: number;
  name: string;
  country: string;
  hoursSaved: number;
  cumulativePct: number;
}

export interface Insight {
  kind: string;
  headline: string;
  value: string | number;
}

export interface Portfolio {
  totalHoursSaved: number;
  projectCount: number;
  countryCount: number;
  avgReductionPct: number;
  activeCount: number;
  totalWorkdaysSaved: number;
  totalDevHours: number;
  avgLeverage: number | null;
  paybackWeeks: number | null;
  byCountry: CountryAgg[];
  byStatus: GroupAgg[];
  byCriticality: GroupAgg[];
  byRole: GroupAgg[];
  byCapabilityCenter: GroupAgg[];
  paretoRanking: ParetoItem[];
  insights: Insight[];
}

export interface Dataset {
  generatedAt: string;
  source: string;
  projects: Project[];
  portfolio: Portfolio;
  warnings: string[];
}
