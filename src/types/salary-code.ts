// State abbreviations for internal use (salary code generation)
export const STATE_ABBREVIATIONS = [
  'UP', 'MP', 'MH', 'GJ', 'RJ', 'PB', 'HR', 'DL', 'UK', 'HP',
  'JK', 'CH', 'BR', 'JH', 'WB', 'OR', 'AP', 'TG', 'KA', 'KL',
  'TN', 'GA', 'AS', 'ML', 'MN', 'MZ', 'NL', 'SK', 'TR', 'AR',
  'AN', 'LD', 'PY', 'DN', 'DD', 'LA'
] as const;

// Full state names for display in dropdowns
export const STATE_NAMES: Record<string, string> = {
  'UP': 'Uttar Pradesh',
  'MP': 'Madhya Pradesh',
  'MH': 'Maharashtra',
  'GJ': 'Gujarat',
  'RJ': 'Rajasthan',
  'PB': 'Punjab',
  'HR': 'Haryana',
  'DL': 'Delhi',
  'UK': 'Uttarakhand',
  'HP': 'Himachal Pradesh',
  'JK': 'Jammu and Kashmir',
  'CH': 'Chandigarh',
  'BR': 'Bihar',
  'JH': 'Jharkhand',
  'WB': 'West Bengal',
  'OR': 'Odisha',
  'AP': 'Andhra Pradesh',
  'TG': 'Telangana',
  'KA': 'Karnataka',
  'KL': 'Kerala',
  'TN': 'Tamil Nadu',
  'GA': 'Goa',
  'AS': 'Assam',
  'ML': 'Meghalaya',
  'MN': 'Manipur',
  'MZ': 'Mizoram',
  'NL': 'Nagaland',
  'SK': 'Sikkim',
  'TR': 'Tripura',
  'AR': 'Arunachal Pradesh',
  'AN': 'Andaman and Nicobar Islands',
  'LD': 'Lakshadweep',
  'PY': 'Puducherry',
  'DN': 'Dadra and Nagar Haveli',
  'DD': 'Daman and Diu',
  'LA': 'Ladakh'
};

// For backward compatibility, keep STATES as the abbreviations
export const STATES = STATE_ABBREVIATIONS;

export const RANKS = [
  'SS', 'SG','SI','DR', 'JSS', 'ASS', 'DS', 'JDS', 'ADS', 'EE', 'JEE', 'AEE',
  'SE', 'JSE', 'ASE', 'ME', 'JME', 'AME', 'CE', 'JCE', 'ACE',
  'TL', 'JTL', 'ATL', 'MGR', 'JMGR', 'AMGR', 'GM', 'JGM', 'AGM'
] as const;

export const SKILL_LEVELS = [
  'Highly Skilled',
  'Skilled',
  'Semi-Skilled',
  'Un-Skilled'
] as const;

export interface SalaryCodeFormData {
  siteName: string;
  rank: string;
  stateName: string;
  wages: number;
}

export interface SalaryCodeResponse {
  id: number;
  salary_code: string;
  site_name: string;
  rank: string;
  state: string;
  base_wage: number;
  skill_level: string;
  is_active: boolean;
  created_at: string | null;
  display_name: string;
}
