// Types mirror the JSON emitted by pipeline/build_data.py. Keep in sync with schema.py.

export type Status = "Active" | "Obsolete" | "On hold" | "On going";
export type Criticality = "High" | "Medium" | "Low";
export type Role = "Developed" | "Coached" | "Minor Fix";

export interface Project {
  id: number;
  name: string;
  country: string;
  countryIso2: string | null;
  countryIso3: string | null;
  status: Status;
  criticality: Criticality;
  role: Role;
  frequencyPerYear: number;
  manualMinutes: number;
  autoMinutes: number;
  hoursBefore: number;
  hoursAfter: number;
  hoursSaved: number;
  reductionPct: number;
}

export interface CountryAgg {
  country: string;
  countryIso2: string | null;
  countryIso3: string | null;
  projectCount: number;
  hoursSaved: number;
}

export interface GroupAgg {
  label: string;
  count: number;
  hoursSaved: number;
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
  byCountry: CountryAgg[];
  byStatus: GroupAgg[];
  byCriticality: GroupAgg[];
  byRole: GroupAgg[];
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
