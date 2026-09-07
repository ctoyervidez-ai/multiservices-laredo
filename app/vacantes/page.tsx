import type { Metadata } from 'next';
import { defaultSettings, getPublicJobs, getSiteSettings } from '@/lib/site-repository';
import type { PublicJob } from '@/lib/portal-types';
import JobsExplorer from './jobs-explorer';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Vacantes en Laredo | Multiservices Laredo',
  description: 'Explora vacantes actualizadas en Laredo y aplica directamente con Multiservices Laredo.',
  alternates: { canonical: '/vacantes' },
};

export default async function VacantesPage() {
  let jobs: PublicJob[] = [];
  let settings = defaultSettings;
  let unavailable = false;
  try {
    [jobs, settings] = await Promise.all([getPublicJobs(), getSiteSettings()]);
  } catch {
    unavailable = true;
  }
  return <JobsExplorer jobs={jobs} settings={settings} unavailable={unavailable} />;
}
