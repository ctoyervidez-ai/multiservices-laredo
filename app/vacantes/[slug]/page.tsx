import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublicJobBySlug } from '@/lib/site-repository';
import JobDetailClient from './job-detail-client';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const { slug } = await params;
    const job = await getPublicJobBySlug(slug);
    if (!job) return { title: 'Vacante no disponible | Multiservices Laredo' };
    return {
      title: `${job.titleEs} en ${job.location} | Multiservices Laredo`,
      description: job.summaryEs,
      alternates: { canonical: `/vacantes/${job.slug}` },
      openGraph: { title: `${job.titleEs} | Multiservices Laredo`, description: job.summaryEs, type: 'website', images: [] },
      twitter: { card: 'summary', title: `${job.titleEs} | Multiservices Laredo`, description: job.summaryEs, images: [] },
    };
  } catch {
    return { title: 'Vacante | Multiservices Laredo' };
  }
}

export default async function JobPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await getPublicJobBySlug(slug);
  if (!job) notFound();
  return <JobDetailClient job={job} />;
}
