import { getPublicJobs, getSiteSettings } from '@/lib/site-repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [settings, jobs] = await Promise.all([getSiteSettings(), getPublicJobs()]);
    return Response.json({ settings, jobs }, { headers: { 'cache-control': 'public, max-age=30, stale-while-revalidate=120' } });
  } catch {
    return Response.json({ error: 'No fue posible cargar la información del sitio.' }, { status: 503 });
  }
}
