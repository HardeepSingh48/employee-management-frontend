// Constants for salary code form
export const STATES = [
  'UP', 'MP', 'MH', 'GJ', 'RJ', 'PB', 'HR', 'DL', 'UK', 'HP',
  'JK', 'CH', 'BR', 'JH', 'WB', 'OR', 'AP', 'TG', 'KA', 'KL',
  'TN', 'GA', 'AS', 'ML', 'MN', 'MZ', 'NL', 'SK', 'TR', 'AR',
  'AN', 'LD', 'PY', 'DN', 'DD', 'LA'
] as const;

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
