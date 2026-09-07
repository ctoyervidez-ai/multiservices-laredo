'use client';

import { SITE_ORIGIN } from '@/lib/site-origin';

import { ArrowLeft, BriefcaseBusiness, CheckCircle2, Clock3, DollarSign, Languages, MapPin, Users } from 'lucide-react';
import Link from '@/app/site-link';
import { useState } from 'react';
import { displayEmploymentType, displayShift, schemaEmploymentType } from '@/lib/job-display';
import type { PublicJob } from '@/lib/portal-types';
import ApplicationForm from '../application-form';

export default function JobDetailClient({ job }: { job: PublicJob }) {
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const es = language === 'es';
  const title = es ? job.titleEs : job.titleEn;
  const summary = es ? job.summaryEs : job.summaryEn;
  const description = es ? job.descriptionEs : job.descriptionEn;
  const requirements = (es ? job.requirementsEs : job.requirementsEn).split('\n').map((item) => item.trim()).filter(Boolean);
  const jobPosting = {
    '@context': 'https://schema.org', '@type': 'JobPosting', title: job.titleEs,
    description: `${job.descriptionEs || job.summaryEs}\n\nRequisitos:\n${job.requirementsEs}`,
    datePosted: job.publishedAt || job.updatedAt, validThrough: job.closesAt || undefined,
    employmentType: schemaEmploymentType(job), directApply: true,
    hiringOrganization: { '@type': 'Organization', name: 'Multiservices Laredo', sameAs: SITE_ORIGIN },
    jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: 'Laredo', addressRegion: 'TX', addressCountry: 'US' } },
    baseSalary: job.payMin === null ? undefined : { '@type': 'MonetaryAmount', currency: 'USD', value: { '@type': 'QuantitativeValue', minValue: job.payMin, maxValue: job.payMax || job.payMin, unitText: job.payUnit === 'hora' ? 'HOUR' : job.payUnit.toUpperCase() } },
  };
  return (
    <main className="job-detail-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPosting).replaceAll('<', '\\u003c') }} />
      <header className="jobs-nav detail-nav"><Link className="jobs-brand" href="/"><img src="/logo-optimized.webp" alt="" /><span>MULTISERVICES<small>LAREDO</small></span></Link><div><Link href="/vacantes"><ArrowLeft size={16} />{es ? 'Todas las vacantes' : 'All openings'}</Link><button type="button" onClick={() => setLanguage(es ? 'en' : 'es')}><Languages size={17} />{es ? 'EN' : 'ES'}</button></div></header>
      <section className="job-detail-hero"><div><nav aria-label="Breadcrumb"><Link href="/vacantes">{es ? 'Vacantes' : 'Openings'}</Link><span>/</span><span>{title}</span></nav><div className="job-status-pill">{es ? 'Aceptando solicitudes' : 'Accepting applications'}</div><h1>{title}</h1><p>{summary}</p><div className="job-meta-row"><span><MapPin size={17} />{job.location}</span><span><Clock3 size={17} />{displayShift(job.shift, language)}</span><span><BriefcaseBusiness size={17} />{displayEmploymentType(job.employmentType, language)}</span><span><Users size={17} />{job.openings} {es ? 'posición(es)' : 'opening(s)'}</span></div></div></section>
      <div className="job-detail-grid">
        <article className="job-description">
          <section><p className="job-section-number">01</p><h2>{es ? 'Sobre el puesto' : 'About this role'}</h2><p>{description || summary}</p></section>
          <section><p className="job-section-number">02</p><h2>{es ? 'Requisitos' : 'Requirements'}</h2>{requirements.length ? <ul>{requirements.map((item) => <li key={item}><CheckCircle2 size={18} />{item}</li>)}</ul> : <p>{es ? 'Los requisitos específicos se confirmarán durante el proceso.' : 'Specific requirements will be confirmed during the process.'}</p>}</section>
          <section className="job-conditions"><p className="job-section-number">03</p><h2>{es ? 'Condiciones principales' : 'Key details'}</h2><div><span><DollarSign size={20} /><small>{es ? 'Sueldo' : 'Pay'}</small><strong>{formatPay(job, es)}</strong></span><span><Clock3 size={20} /><small>{es ? 'Turno' : 'Shift'}</small><strong>{displayShift(job.shift, language)}</strong></span><span><MapPin size={20} /><small>{es ? 'Ubicación' : 'Location'}</small><strong>{job.location}</strong></span></div></section>
        </article>
        <aside className="job-apply-card" id="aplicar"><div><span>{es ? 'Solicitud segura' : 'Secure application'}</span><h2>{es ? 'Aplica a esta vacante' : 'Apply for this opening'}</h2><p>{es ? 'Tus datos se guardan directamente para que el equipo pueda revisar tu perfil.' : 'Your information is saved directly so the team can review your profile.'}</p></div><ApplicationForm job={job} language={language} /></aside>
      </div>
    </main>
  );
}

function formatPay(job: PublicJob, es: boolean) {
  if (job.payMin === null) return es ? 'Por confirmar' : 'To be confirmed';
  const value = job.payMax && job.payMax !== job.payMin ? `$${job.payMin}–$${job.payMax}` : `$${job.payMin}`;
  return `${value} / ${es ? job.payUnit : job.payUnit === 'hora' ? 'hour' : job.payUnit}`;
}
