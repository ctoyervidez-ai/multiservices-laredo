import type { PublicJob } from '@/lib/portal-types';

const employmentTranslations: Record<string, string> = {
  'Temporal / proyecto': 'Temporary / project',
  'Tiempo completo': 'Full time',
  'Medio tiempo': 'Part time',
  'Contratación directa': 'Direct hire',
  'Temp-to-hire': 'Temp-to-hire',
};

const shiftTranslations: Record<string, string> = {
  'Por confirmar': 'To be confirmed',
  'Turno flexible': 'Flexible shift',
  'Primer turno': 'First shift',
  'Segundo turno': 'Second shift',
  'Tercer turno': 'Third shift',
};

export function displayEmploymentType(value: string, language: 'es' | 'en') {
  return language === 'en' ? employmentTranslations[value] || value : value;
}

export function displayShift(value: string, language: 'es' | 'en') {
  return language === 'en' ? shiftTranslations[value] || value : value;
}

export function schemaEmploymentType(job: PublicJob) {
  const value = job.employmentType.toLowerCase();
  if (value.includes('medio') || value.includes('part')) return 'PART_TIME';
  if (value.includes('temporal') || value.includes('temp')) return 'TEMPORARY';
  if (value.includes('contrato') || value.includes('contract')) return 'CONTRACTOR';
  return 'FULL_TIME';
}
