import HomeClient from './home-client';
import { defaultSettings, getPublicJobs, getSiteSettings } from '@/lib/site-repository';
import type { PublicJob } from '@/lib/portal-types';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let settings = defaultSettings;
  let jobs: PublicJob[] = [];
  try {
    [settings, jobs] = await Promise.all([getSiteSettings(), getPublicJobs()]);
  } catch {
    // The marketing page remains available with safe defaults during a transient data outage.
  }
  return <HomeClient initialSettings={settings} initialJobs={jobs} />;
}
