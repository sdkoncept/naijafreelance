export const PLAN_ABBREVIATIONS = {
  formal: 'FOP',
  silver: 'ISP',
  bronze: 'IBP',
  enhanced: 'ENP',
  equity: 'EQP',
} as const;

export const LGA_ABBREVIATIONS = {
  'Akoko Edo': 'AK',
  'Egor': 'EG',
  'Esan Central': 'EC',
  'Esan North-East': 'EN',
  'Esan South-East': 'ES',
  'Esan West': 'ESW',
  'Etsako Central': 'ET',
  'Etsako East': 'EE',
  'Etsako West': 'EW',
  'Igueben': 'IG',
  'Ikpoba Okha': 'IK',
  'Orhionmwon': 'OW',
  'Oredo': 'OR',
  'Ovia North-East': 'ONE',
  'Ovia South-West': 'OSW',
  'Owan East': 'OE',
  'Owan West': 'OWW',
  'Uhunmwonde': 'UH',
} as const;

export const PLAN_NAMES = {
  formal: 'Formal Plan',
  silver: 'Silver Plan',
  bronze: 'Bronze Plan',
  enhanced: 'Enhanced Plan',
  equity: 'Equity Plan',
} as const;

export const ENROLLMENT_TYPES = {
  single: 'Single Enrollment',
  primary: 'Primary (Group Leader)',
  group_member: 'Group Member',
} as const;

export type HealthPlan = keyof typeof PLAN_NAMES;
export type EnrollmentType = keyof typeof ENROLLMENT_TYPES;
