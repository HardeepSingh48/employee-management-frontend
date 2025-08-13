import { z } from 'zod';

// Validation schema for salary code creation
export const salaryCodeSchema = z.object({
  siteName: z.string().min(1, 'Site name is required'),
  rank: z.string().min(1, 'Rank is required'),
  stateName: z.string().min(1, 'State name is required'),
  wages: z.number().min(1, 'Wages must be greater than 0'),
});

export type SalaryCodeFormSchema = z.infer<typeof salaryCodeSchema>;
