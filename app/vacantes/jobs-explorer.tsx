'use client';

import { ArrowRight, BriefcaseBusiness, Clock3, Languages, MapPin, Search, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { displayEmploymentType, displayShift } from '@/lib/job-display';
import type { PublicJob, SiteSettings } from '@/lib/portal-types';

export default function JobsExplorer({ jobs, settings, unavailable }: { jobs: PublicJob[]; settings: SiteSettings; unavailable: boolean }) {
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const [query, setQuery] = useState('');
  const [shift, setShift] = useState('all');
  const [type, setType] = useState('all');
  const title = (job: PublicJob) => language === 'es' ? job.titleEs : job.titleEn;
  const summary = (job: PublicJob) => language === 'es' ? job.summaryEs : job.summaryEn;
  const shifts = useMemo(() => [...new Set(jobs.map((job) => job.shift).filter(Boolean))], [jobs]);
  const types = useMemo(() => [...new Set(jobs.map((job) => job.employmentType).filter(Boolean))], [jobs]);
  const filtered = useMemo(() => jobs.filter((job) => {
    const haystack = `${job.titleEs} ${job.titleEn} ${job.summaryEs} ${job.summaryEn} ${job.location}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (shift === 'all' || job.shift === shift) && (type === 'all' || job.employmentType === type);
  }), [jobs, query, shift, type]);

  const copy = language === 'es' ? {
    eyebrow: 'Oportunidades actuales', title: 'Encuentra un trabajo que sí encaja contigo.',
    intro: 'Vacantes actualizadas en Laredo y alrededores, con acompañamiento bilingüe durante tu aplicación.',
    search: 'Buscar por puesto o palabra clave', filters: 'Filtros', allShifts: 'Todos los turnos', allTypes: 'Todos los tipos',
    results: `${filtered.length} ${filtered.length === 1 ? 'vacante disponible' : 'vacantes disponibles'}`,
    view: 'Ver vacante', empty: 'No encontramos vacantes con esos filtros.', clear: 'Limpiar filtros',
    noJobs: 'Por ahora no hay vacantes publicadas.', noJobsText: 'Puedes dejar tus datos para que el equipo te considere cuando aparezca una oportunidad.',
    interest: 'Dejar mis datos', error: 'No pudimos cargar las vacantes en este momento.', back: 'Volver al sitio',
  } : {
    eyebrow: 'Current opportunities', title: 'Find work that fits where you are going.',
    intro: 'Updated openings in Laredo and nearby areas, with bilingual support throughout your application.',
    search: 'Search by role or keyword', filters: 'Filters', allShifts: 'All shifts', allTypes: 'All job types',
    results: `${filtered.length} ${filtered.length === 1 ? 'opening available' : 'openings available'}`,
    view: 'View opening', empty: 'No openings match those filters.', clear: 'Clear filters',
    noJobs: 'There are no published openings right now.', noJobsText: 'You can share your information so the team can consider you when an opportunity opens.',
    interest: 'Share my information', error: 'We could not load openings right now.', back: 'Back to site',
  };

  const reset = () => { setQuery(''); setShift('all'); setType('all'); };

  return (
    <main className="jobs-page">
      <header className="jobs-nav">
        <Link className="jobs-brand" href="/"><img src="/logo-optimized.webp" alt="" /><span>MULTISERVICES<small>LAREDO</small></span></Link>
        <div><Link href="/">{copy.back}</Link><button type="button" onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}><Languages size={17} />{language === 'es' ? 'EN' : 'ES'}</button></div>
      </header>

      <section className="jobs-intro">
        <div><p><span />{copy.eyebrow}</p><h1>{copy.title}</h1><div className="jobs-intro-row"><p>{copy.intro}</p><span><BriefcaseBusiness size={19} /> Laredo, Texas</span></div></div>
      </section>

      <section className="jobs-directory" aria-labelledby="jobs-count">
        <div className="jobs-toolbar">
          <label className="jobs-search"><Search size={19} /><span className="sr-only">{copy.search}</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.search} /></label>
          <div className="jobs-filter-label"><SlidersHorizontal size={17} /><span>{copy.filters}</span></div>
          <label><span className="sr-only">{copy.allShifts}</span><select value={shift} onChange={(event) => setShift(event.target.value)}><option value="all">{copy.allShifts}</option>{shifts.map((item) => <option value={item} key={item}>{displayShift(item, language)}</option>)}</select></label>
          <label><span className="sr-only">{copy.allTypes}</span><select value={type} onChange={(event) => setType(event.target.value)}><option value="all">{copy.allTypes}</option>{types.map((item) => <option value={item} key={item}>{displayEmploymentType(item, language)}</option>)}</select></label>
        </div>

        <div className="jobs-results-head"><h2 id="jobs-count">{copy.results}</h2>{(query || shift !== 'all' || type !== 'all') && <button type="button" onClick={reset}>{copy.clear}</button>}</div>

        {unavailable ? <div className="jobs-empty"><span>!</span><h2>{copy.error}</h2><button type="button" onClick={() => location.reload()}>Intentar de nuevo</button></div>
          : jobs.length === 0 ? <div className="jobs-empty"><BriefcaseBusiness size={30} /><h2>{copy.noJobs}</h2><p>{copy.noJobsText}</p><Link href="/#application-form">{copy.interest}<ArrowRight size={17} /></Link></div>
          : filtered.length === 0 ? <div className="jobs-empty"><Search size={30} /><h2>{copy.empty}</h2><button type="button" onClick={reset}>{copy.clear}</button></div>
          : <div className="job-card-grid">{filtered.map((job) => <article className="public-job-card" key={job.id}>
            <div className="job-card-top"><span>{job.featured ? (language === 'es' ? 'Destacada' : 'Featured') : (language === 'es' ? 'Disponible' : 'Open')}</span><small>{formatDate(job.publishedAt, language)}</small></div>
            <h2>{title(job)}</h2><p>{summary(job)}</p>
            <ul><li><MapPin size={16} />{job.location}</li><li><Clock3 size={16} />{displayShift(job.shift, language)}</li><li><BriefcaseBusiness size={16} />{displayEmploymentType(job.employmentType, language)}</li></ul>
            <div className="job-card-footer"><strong>{formatPay(job, language)}</strong><Link href={`/vacantes/${job.slug}`}>{copy.view}<ArrowRight size={17} /></Link></div>
          </article>)}</div>}
      </section>

      <footer className="jobs-footer"><span>© {new Date().getFullYear()} Multiservices Laredo</span><a href={`tel:${settings.contactPhone.replace(/[^+\d]/g, '')}`}>{settings.contactPhone}</a><a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a></footer>
    </main>
  );
}

function formatPay(job: PublicJob, language: 'es' | 'en') {
  if (job.payMin === null) return language === 'es' ? 'Sueldo por confirmar' : 'Pay to be confirmed';
  const range = job.payMax && job.payMax !== job.payMin ? `$${job.payMin}–$${job.payMax}` : `$${job.payMin}`;
  return `${range} / ${language === 'es' ? job.payUnit : job.payUnit === 'hora' ? 'hour' : job.payUnit}`;
}

function formatDate(value: string | null, language: 'es' | 'en') {
  if (!value) return language === 'es' ? 'Publicación reciente' : 'Recently posted';
  return new Intl.DateTimeFormat(language === 'es' ? 'es-MX' : 'en-US', { month: 'short', day: 'numeric' }).format(new Date(value));
}
