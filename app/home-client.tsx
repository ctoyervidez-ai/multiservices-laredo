'use client';

import { homeContent } from '@/lib/home-content';
import { applyContentOverrides } from '@/lib/content-fields';
import { SITE_ORIGIN } from '@/lib/site-origin';

import { FormEvent, type CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import Link from '@/app/site-link';
import type { PublicJob, SiteSettings } from '@/lib/portal-types';
import { DEFAULT_CONTACT_EMAIL } from '@/lib/site-contact';

type Language = 'es' | 'en';
type Audience = 'candidate' | 'employer';
type PhotoName =
  | 'ms-hero'
  | 'ms-safety'
  | 'service-labeling'
  | 'service-yard-mule'
  | 'transport-main'
  | 'transport-arrival';

const tickerItems = ['STAFFING', 'RECRUITMENT', 'WAREHOUSE', 'TEMP → HIRE', 'EQUIPMENT', 'NOM-050', 'LAREDO, TX'];
const showcaseImages: PhotoName[] = ['service-labeling', 'ms-safety', 'service-yard-mule'];



const photoWidths = [640, 960, 1440];

function ResponsivePhoto({ name, alt, portrait = false, priority = false, sizes = '100vw', overrideSrc }: { name: PhotoName; alt: string; portrait?: boolean; priority?: boolean; sizes?: string; overrideSrc?: string | null }) {
  if (overrideSrc) return <picture><img src={overrideSrc} width={portrait ? 1600 : 2400} height={portrait ? 2000 : 1350} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : undefined} decoding="async" alt={alt} /></picture>;
  const srcSet = (format: 'avif' | 'webp') => photoWidths.map((width) => `/media/${name}-${width}.${format} ${width}w`).join(', ');
  return (
    <picture>
      <source type="image/avif" srcSet={srcSet('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet('webp')} sizes={sizes} />
      <img src={`/media/${name}-1440.webp`} srcSet={srcSet('webp')} sizes={sizes} width={portrait ? 1600 : 2400} height={portrait ? 2000 : 1350} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : undefined} decoding="async" alt={alt} />
    </picture>
  );
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'EmploymentAgency',
  name: 'Multiservices Laredo',
  url: SITE_ORIGIN,
  telephone: '+1-956-441-1292',
  email: DEFAULT_CONTACT_EMAIL,
  address: { '@type': 'PostalAddress', streetAddress: '1316 Zaragoza St.', addressLocality: 'Laredo', addressRegion: 'TX', postalCode: '78040', addressCountry: 'US' },
  areaServed: 'Laredo, Texas',
  sameAs: ['https://www.instagram.com/multiservicesldo', 'https://www.facebook.com/p/Multiservices-Laredo-61557726029987/'],
};

export default function HomeClient({ initialSettings, initialJobs, initialLanguage = 'es' }: { initialSettings: SiteSettings; initialJobs: PublicJob[]; initialLanguage?: Language }) {
  const [lang, setLang] = useState<Language>(initialLanguage);
  const [audience, setAudience] = useState<Audience>('candidate');
  const [menuOpen, setMenuOpen] = useState(false);
  const [serviceSlide, setServiceSlide] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const [roleChoice, setRoleChoice] = useState('');
  const [contactLinks, setContactLinks] = useState<{ email: string; whatsapp: string; reference?: string } | null>(null);
  const [siteSettings] = useState<SiteSettings>(initialSettings);
  const [liveJobs] = useState<PublicJob[]>(initialJobs);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const submissionStartedAt = useRef(0);
  const submissionKey = useRef('');
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  const content = applyContentOverrides(homeContent, siteSettings.contentOverrides || {});
  const t = content[lang];

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  useEffect(() => { submissionStartedAt.current = Date.now(); }, []);
  useEffect(() => { if (contactLinks) successHeadingRef.current?.focus(); }, [contactLinks]);
  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && setMenuOpen(false);
    const desktop = window.matchMedia('(min-width: 1121px)');
    const closeOnDesktop = () => { if (desktop.matches) setMenuOpen(false); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    desktop.addEventListener('change', closeOnDesktop);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
      desktop.removeEventListener('change', closeOnDesktop);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (carouselPaused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setServiceSlide((current) => (current + 1) % showcaseImages.length), 6500);
    return () => window.clearInterval(timer);
  }, [carouselPaused]);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    const root = document.documentElement;
    root.classList.add('motion-ready');
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }), { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((target) => observer.observe(target));
    return () => {
      observer.disconnect();
      root.classList.remove('motion-ready');
    };
  }, []);

  const chooseAudience = useCallback((next: Audience) => {
    setAudience(next);
    setContactLinks(null);
    setSubmissionError('');
    submissionStartedAt.current = Date.now();
    submissionKey.current = '';
    setMenuOpen(false);
  }, []);

  const selectRole = (index: number) => {
    if (index >= 0) setRoleChoice(String(index));
    chooseAudience('candidate');
  };

  const showPreviousService = () => setServiceSlide((current) => (current - 1 + showcaseImages.length) % showcaseImages.length);
  const showNextService = () => setServiceSlide((current) => (current + 1) % showcaseImages.length);

  const prepareContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    data.set('language', lang);
    {
      setSubmitting(true);
      setSubmissionError('');
      if (!submissionKey.current) submissionKey.current = crypto.randomUUID();
      data.set('startedAt', String(submissionStartedAt.current));
      data.set('submissionKey', submissionKey.current);
      try {
        const request = await fetch(audience === 'candidate' ? '/api/applications' : '/api/inquiries', { method: 'POST', body: data });
        const result = await request.json() as { error?: string; reference?: string };
        if (!request.ok || !result.reference) throw new Error(result.error || (lang === 'es' ? 'No pudimos guardar tu solicitud.' : 'We could not save your application.'));
        setContactLinks({ email: '', whatsapp: '', reference: result.reference });
      } catch (error) {
        setSubmissionError(error instanceof Error ? error.message : (lang === 'es' ? 'Inténtalo nuevamente.' : 'Please try again.'));
      } finally {
        setSubmitting(false);
      }
      return;
    }

  };

  const navLinks = [
    ['#servicios', t.nav.services], ['#industrias', t.nav.industries], ['#proceso', t.nav.process], ['/vacantes', t.nav.jobs], ['#preguntas', t.nav.faq],
  ];

  const heroLine1 = lang === 'es' ? siteSettings?.heroLine1Es || t.heroLine1 : siteSettings?.heroLine1En || t.heroLine1;
  const heroAccent = lang === 'es' ? siteSettings?.heroAccentEs || t.heroAccent : siteSettings?.heroAccentEn || t.heroAccent;
  const heroLine2 = lang === 'es' ? siteSettings?.heroLine2Es || t.heroLine2 : siteSettings?.heroLine2En || t.heroLine2;
  const heroLead = lang === 'es' ? siteSettings?.heroLeadEs || t.heroLead : siteSettings?.heroLeadEn || t.heroLead;
  const contactPhone = siteSettings?.contactPhone || '+1 956 441 1292';
  const phoneHref = `tel:${contactPhone.replace(/[^+\d]/g, '')}`;
  const contactWhatsapp = siteSettings?.contactWhatsapp || '19566069956';
  const contactEmail = siteSettings?.contactEmail || DEFAULT_CONTACT_EMAIL;
  const whatsappDisplay = contactWhatsapp.replace(/^(1)(\d{3})(\d{3})(\d{4})$/, '+$1 $2 $3 $4');
  const transportInquiryHref = `https://wa.me/${contactWhatsapp}?text=${encodeURIComponent(lang === 'es'
    ? 'Hola, quisiera información sobre el transporte para colaboradores: rutas, horarios y disponibilidad.'
    : 'Hello, I would like information about employee transportation: routes, schedules, and availability.')}`;
  const featuredJob = liveJobs.find((job) => job.featured) || liveJobs[0];

  return (
    <main className={menuOpen ? 'menu-open' : ''}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ ...localBusinessSchema, telephone: contactPhone, email: contactEmail }).replaceAll('<', '\\u003c') }} />
      <a className="skip-link" href="#contenido">{lang === 'es' ? 'Saltar al contenido' : 'Skip to content'}</a>
      <div className="utility-bar"><span>{t.utility}</span><span>{t.availability}</span><a href={phoneHref}>{contactPhone}</a></div>

      <header className="nav-shell">
        <a className="brand-lockup" href="#top" aria-label="Multiservices Laredo home" onClick={() => setMenuOpen(false)}>
          <img src="/logo-optimized.webp" width="72" height="73" alt="" /><span>MULTISERVICES<small>LAREDO</small></span>
        </a>
        <nav aria-label={lang === 'es' ? 'Navegación principal' : 'Main navigation'}>
          {navLinks.map(([href, label]) => href.startsWith('#')
            ? <a href={href} key={href}>{label}</a>
            : <Link href={href} key={href}>{label}</Link>)}
        </nav>
        <div className="nav-actions">
          <div className="language-switch" role="group" aria-label="Language">
            <button type="button" aria-pressed={lang === 'es'} className={lang === 'es' ? 'active' : ''} onClick={() => setLang('es')}>ES</button><span>/</span>
            <button type="button" aria-pressed={lang === 'en'} className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
          </div>
          <a className="primary-button nav-cta" href="#application-form" onClick={() => chooseAudience(audience)}>{t.start}<span>↗</span></a>
          <button className="menu-toggle" type="button" aria-label={menuOpen ? t.close : t.menu} aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => setMenuOpen((open) => !open)}><span>{menuOpen ? t.close : t.menu}</span><i aria-hidden="true" /></button>
        </div>
      </header>

      <div className={`mobile-menu ${menuOpen ? 'is-open' : ''}`} id="mobile-menu" aria-hidden={!menuOpen}>
        <nav aria-label={lang === 'es' ? 'Navegación móvil' : 'Mobile navigation'}>
          {navLinks.map(([href, label], index) => href.startsWith('#')
            ? <a href={href} key={href} onClick={() => setMenuOpen(false)}><span>0{index + 1}</span>{label}<i>↗</i></a>
            : <Link href={href} key={href} onClick={() => setMenuOpen(false)}><span>0{index + 1}</span>{label}<i>↗</i></Link>)}
        </nav>
        <div><Link href="/vacantes" className="primary-button" onClick={() => setMenuOpen(false)}>{t.candidateCta}<span>↗</span></Link><a href="#application-form" className="secondary-button light" onClick={() => chooseAudience('employer')}>{t.employerCta}<span>↗</span></a></div>
      </div>

      <div id="contenido">
        <section className="hero-v3" id="top">
          <div className="hero-grid">
            <div className="hero-copy" data-reveal="up">
              <p className="eyebrow"><span />{t.heroKicker}</p>
              <h1><span>{heroLine1}</span><em>{heroAccent}</em><span>{heroLine2}</span></h1>
              <p className="hero-lead">{heroLead}</p>
              <div className="hero-actions"><a className="primary-button" href="#application-form" onClick={() => chooseAudience('employer')}>{t.employerCta}<span>↗</span></a><Link className="secondary-button" href="/vacantes">{t.candidateCta}<span>↗</span></Link></div>
              <div className="hero-signals">{t.signals.map(([value, label]) => <div key={value}><strong>{value}</strong><span>{label}</span></div>)}</div>
            </div>
            <div className="hero-visual" data-reveal="image">
              <div className="hero-photo"><ResponsivePhoto name="ms-hero" overrideSrc={siteSettings?.heroImageUrl} portrait priority sizes="(max-width: 780px) calc(100vw - 32px), 500px" alt={lang === 'es' ? 'Supervisora bilingüe y líder operativo revisando un plan de trabajo en un centro logístico' : 'Bilingual supervisor and operations lead reviewing a work plan in a logistics center'} /></div>
              <div className="hero-photo-meta">
                <div className="hero-card"><small>01 / TALENT SOLUTIONS</small><strong>{t.heroBadge}</strong><span>{t.heroBadgeSub}</span></div>
                <div className="hero-status"><i /><span>{t.liveLabel}</span><strong>ES / EN</strong></div>
              </div>
            </div>
          </div>
        </section>

        <div className="moving-line"><div aria-hidden="true">{tickerItems.map((item) => <span key={item}>{item}<i>◆</i></span>)}</div></div>

        <section className="metric-rail page-width" aria-label={lang === 'es' ? 'Resumen de capacidades' : 'Capability summary'}>
          {t.metrics.map(([value, label], index) => <div data-reveal="up" style={{ '--delay': `${index * 70}ms` } as CSSProperties} key={value}><strong>{value}</strong><span>{label}</span></div>)}
        </section>

        <section className="purpose-section page-width" data-reveal="up">
          <p className="eyebrow"><span />{t.purposeKicker}</p>
          <h2>{t.purposeTitle}<em>{t.purposeAccent}</em></h2>
        </section>

        <section className="industries-section" id="industrias">
          <div className="page-width">
            <div className="industries-intro" data-reveal="up"><p className="eyebrow gold"><span />{t.industriesKicker}</p><h2>{t.industriesTitle}</h2><p>{t.industriesIntro}</p></div>
            <div className="industry-mosaic">
              {t.industries.map(([title, text], index) => <article className={`industry-card industry-${index + 1}`} key={title} data-reveal="up">
                <span>0{index + 1}</span><h3>{title}</h3><p>{text}</p>
              </article>)}
            </div>
          </div>
        </section>

        <section className="services-section" id="servicios">
          <div className="page-width">
            <div className="section-heading inverted" data-reveal="up"><div><p className="eyebrow gold"><span />{t.servicesKicker}</p><h2>{t.servicesTitle}</h2></div><p>02 / SOLUTIONS</p></div>
            <div className="service-list">{t.services.map(([number, title, text], index) => <article key={number} data-reveal="up" style={{ '--delay': `${(index % 3) * 70}ms` } as CSSProperties}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
            <div className="section-cta" data-reveal="up"><p>{lang === 'es' ? '¿Tienes una necesidad fuera de esta lista?' : 'Have a need outside this list?'}</p><a href="#application-form" className="secondary-button light" onClick={() => chooseAudience('employer')}>{t.employerCta}<span>↗</span></a></div>
          </div>
        </section>

        <section className="transport-section page-width" id="transporte">
          <div className="transport-gallery" data-reveal="left">
            <figure className="transport-main-photo"><ResponsivePhoto name="transport-main" overrideSrc={siteSettings?.transportImageUrl} sizes="(max-width: 780px) calc(100vw - 32px), 52vw" alt={lang === 'es' ? 'Colaboradores abordando una van de transporte frente a un centro logístico' : 'Employees boarding a shuttle van outside a logistics center'} /><figcaption>01 / {t.transportMainLabel}</figcaption></figure>
            <figure className="transport-arrival-photo"><ResponsivePhoto name="transport-arrival" sizes="(max-width: 780px) calc(100vw - 64px), 26vw" alt={lang === 'es' ? 'Van de transporte llegando puntualmente con colaboradores a un centro logístico' : 'Employee shuttle arriving on time at a logistics center'} /><figcaption>02 / {t.transportArrivalLabel}</figcaption></figure>
            <div className="transport-routes"><small>{t.transportAreas}</small><strong>{t.transportRoutes}</strong></div>
          </div>
          <div className="transport-copy" data-reveal="right"><p className="eyebrow"><span />{t.transportKicker}</p><h2>{t.transportTitle}</h2><p className="transport-accent">{t.transportAccent}</p><p>{t.transportText}</p><ul>{t.transportPoints.map((point) => <li key={point}>{point}</li>)}</ul><a href={transportInquiryHref} className="secondary-button" target="_blank" rel="noreferrer">{t.transportCta}<span>↗</span></a></div>
        </section>

        <section className="process-section" id="proceso">
          <div className="page-width">
            <div className="section-heading" data-reveal="up"><div><p className="eyebrow"><span />{t.processKicker}</p><h2>{t.processTitle}</h2></div><p>03 / PROCESS</p></div>
            <div className="process-line" aria-hidden="true"><i /></div>
            <div className="process-grid">{t.process.map(([number, title, text], index) => <article key={number} data-reveal="up" style={{ '--delay': `${index * 80}ms` } as CSSProperties}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
          </div>
        </section>

        <section className="jobs-section" id="vacantes">
          <div className="page-width job-grid">
            <div className="job-copy" data-reveal="left">
              <p className="eyebrow gold"><span />{featuredJob ? t.jobKicker : (lang === 'es' ? 'Oportunidades laborales' : 'Career opportunities')}</p>
              <h2>{featuredJob ? (lang === 'es' ? featuredJob.titleEs : featuredJob.titleEn) : (lang === 'es' ? 'Comparte tu perfil.' : 'Share your profile.')}</h2>
              <p>{featuredJob ? (lang === 'es' ? featuredJob.summaryEs : featuredJob.summaryEn) : (lang === 'es' ? 'Déjanos tus datos para que el equipo pueda considerarte cuando haya una oportunidad adecuada.' : 'Share your details so the team can consider you when a suitable opportunity becomes available.')}</p>
              {featuredJob && <div className="tag-row">{[featuredJob.location, featuredJob.shift, featuredJob.employmentType].map((tag) => <span key={tag}>{tag}</span>)}</div>}
              {featuredJob
                ? <Link className="primary-button" href={`/vacantes/${featuredJob.slug}#aplicar`}>{t.jobCta}<span>↗</span></Link>
                : <a className="primary-button" href="#application-form" onClick={() => chooseAudience('candidate')}>{lang === 'es' ? 'Enviar mi perfil' : 'Share my profile'}<span>↗</span></a>}
            </div>
            <div className="pay-card" data-reveal="right"><small>{lang === 'es' ? 'Compensación' : 'Compensation'}</small><strong>{featuredJob?.payMin != null ? `$${featuredJob.payMin}` : '—'}</strong><span>{featuredJob?.payMin != null ? `${lang === 'es' ? 'por' : 'per'} ${featuredJob.payUnit}` : (lang === 'es' ? 'Consulta disponibilidad y condiciones' : 'Ask about availability and conditions')}</span></div>
            <div className="role-cloud" data-reveal="up">
              <div className="role-cloud-heading"><p>{t.rolesTitle}</p><small>{t.rolesNote}</small></div>
              {t.roles.map((role, index) => {
                const matchingJob = liveJobs.find((job) => job.titleEs === content.es.roles[index] || job.titleEn === content.en.roles[index]);
                return matchingJob
                  ? <Link className="role-option" href={`/vacantes/${matchingJob.slug}#aplicar`} key={role} aria-label={`${lang === 'es' ? 'Aplicar a' : 'Apply for'} ${role}`}><small>{String(index + 1).padStart(2, '0')}</small><b>{role}</b></Link>
                  : <a className={`role-option ${roleChoice === String(index) ? 'selected' : ''}`} href="#application-form" key={role} aria-label={`${lang === 'es' ? 'Registrar interés en' : 'Register interest in'} ${role}`} aria-current={roleChoice === String(index) ? 'true' : undefined} onClick={() => selectRole(index)}><small>{String(index + 1).padStart(2, '0')}</small><b>{role}</b></a>;
              })}
            </div>
          </div>
        </section>

        <section className="difference-section page-width">
          <div className="difference-title" data-reveal="left"><p className="eyebrow"><span />{t.differenceKicker}</p><h2>{t.differenceTitle}</h2><p>{t.differenceText}</p></div>
          <div className="showcase-carousel" role="region" aria-roledescription="carousel" aria-label={lang === 'es' ? 'Servicios de Multiservices Laredo' : 'Multiservices Laredo services'} data-reveal="right" onMouseEnter={() => setCarouselPaused(true)} onMouseLeave={() => setCarouselPaused(false)} onFocusCapture={() => setCarouselPaused(true)} onBlurCapture={() => setCarouselPaused(false)}>
            <div className="showcase-photo"><ResponsivePhoto key={showcaseImages[serviceSlide]} name={showcaseImages[serviceSlide]} overrideSrc={serviceSlide === 0 ? siteSettings?.operationsImageUrl : null} sizes="(max-width: 820px) calc(100vw - 40px), 50vw" alt={t.showcaseSlides[serviceSlide][3]} /><span>{String(serviceSlide + 1).padStart(2, '0')} / {String(showcaseImages.length).padStart(2, '0')}</span></div>
            <div className="showcase-caption">
              <p>{t.showcaseSlides[serviceSlide][0]}</p><h3>{t.showcaseSlides[serviceSlide][1]}</h3><div><p>{t.showcaseSlides[serviceSlide][2]}</p><div className="carousel-controls"><button type="button" onClick={showPreviousService} aria-label={lang === 'es' ? 'Servicio anterior' : 'Previous service'}>←</button><button type="button" onClick={showNextService} aria-label={lang === 'es' ? 'Siguiente servicio' : 'Next service'}>→</button></div></div>
            </div>
            <div className="carousel-dots" role="group" aria-label={lang === 'es' ? 'Elegir servicio' : 'Choose service'}>{t.showcaseSlides.map(([label], index) => <button type="button" key={label} className={serviceSlide === index ? 'active' : ''} aria-label={label} aria-pressed={serviceSlide === index} onClick={() => setServiceSlide(index)}><span /></button>)}</div>
          </div>
        </section>

        <section className="faq-section" id="preguntas">
          <div className="page-width faq-grid">
            <div data-reveal="left"><p className="eyebrow"><span />{t.faqKicker}</p><h2>{t.faqTitle}</h2></div>
            <div className="faq-list" data-reveal="right">{t.faqs.map(([question, answer], index) => <details key={question} open={index === 0}><summary><span>0{index + 1}</span>{question}<i>+</i></summary><p>{answer}</p></details>)}</div>
          </div>
        </section>

        <section className="contact-section" id="contacto">
          <div className="page-width contact-grid">
            <div className="contact-intro" data-reveal="left"><p className="eyebrow gold"><span />{t.formKicker}</p><h2>{t.formTitle}</h2><p>{t.formIntro}</p><div className="direct-links"><a href={phoneHref}><small>PHONE</small><b>{contactPhone}</b><span>↗</span></a><a href={`https://wa.me/${contactWhatsapp}`} target="_blank" rel="noreferrer"><small>WHATSAPP</small><b>{whatsappDisplay}</b><span>↗</span></a><a href={`mailto:${contactEmail}`}><small>EMAIL</small><b>{contactEmail}</b><span>↗</span></a></div></div>
            <div className="form-shell" data-reveal="right" id="application-form">
              <div className="form-tabs" role="group" aria-label={lang === 'es' ? 'Tipo de solicitud' : 'Request type'}><button type="button" aria-pressed={audience === 'candidate'} className={audience === 'candidate' ? 'active' : ''} onClick={() => chooseAudience('candidate')}>{t.candidateTab}</button><button type="button" aria-pressed={audience === 'employer'} className={audience === 'employer' ? 'active' : ''} onClick={() => chooseAudience('employer')}>{t.employerTab}</button></div>
              {contactLinks ? <div className="form-success" role="status"><span>✓</span><h3 ref={successHeadingRef} tabIndex={-1}>{contactLinks.reference ? (lang === 'es' ? 'Recibimos tu solicitud.' : 'We received your application.') : t.successTitle}</h3><p>{contactLinks.reference ? (lang === 'es' ? 'Tu información quedó guardada para que el equipo pueda revisarla y contactarte.' : 'Your information was saved so the team can review it and contact you.') : t.successText}</p>{contactLinks.reference ? <><strong className="application-reference">{lang === 'es' ? 'Folio' : 'Reference'}: {contactLinks.reference}</strong><div><Link className="primary-button" href={audience === 'candidate' ? '/vacantes' : '/#servicios'}>{audience === 'candidate' ? (lang === 'es' ? 'Ver vacantes' : 'View openings') : (lang === 'es' ? 'Ver servicios' : 'View services')}<span>↗</span></Link></div></> : <div><a className="primary-button" href={contactLinks.email}>{t.emailCta}<span>↗</span></a><a className="secondary-button light" href={contactLinks.whatsapp} target="_blank" rel="noreferrer">{t.whatsappCta}<span>↗</span></a></div>}<button type="button" onClick={() => { setContactLinks(null); submissionStartedAt.current = Date.now(); submissionKey.current = ''; }}>{t.editCta}</button></div> : <form onSubmit={prepareContact}>
                <div className="field-pair"><label>{t.name}<input name="name" required autoComplete="name" /></label><label>{t.phone}<input name="phone" required type="tel" autoComplete="tel" /></label></div>
                <label>{t.email}<input name="email" required type="email" autoComplete="email" /></label>
                {audience === 'candidate' ? <><label>{t.role}<select value={roleChoice} required onChange={(event) => setRoleChoice(event.target.value)}><option value="" disabled>{t.rolePrompt}</option>{t.roles.map((role, index) => <option value={String(index)} key={role}>{role}</option>)}<option value="other">{t.roleOther}</option></select></label>{roleChoice === 'other' ? <label>{t.roleOtherLabel}<input name="role" required /></label> : <input type="hidden" name="role" value={roleChoice ? t.roles[Number(roleChoice)] : ''} />}<small className="role-choice-note">{t.roleHelp}</small></> : <><label>{t.company}<input name="company" required autoComplete="organization" /></label><label>{t.need}<textarea name="need" rows={4} required /></label></>}
                <label>{t.message}<textarea name="message" rows={3} /></label>
                {audience === 'candidate' && <><label>{lang === 'es' ? 'Currículum (opcional)' : 'Résumé (optional)'}<input name="resume" type="file" accept="application/pdf,.pdf" /></label><label className="homepage-consent"><input name="consent" type="checkbox" value="yes" required /><span>{lang === 'es' ? 'Autorizo el uso de mis datos para evaluar esta solicitud y contactarme.' : 'I authorize the use of my information to evaluate this application and contact me.'}</span></label><input className="application-honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" /><small className="candidate-note">{t.candidateNote}</small></>}
                {audience === 'employer' && <><label className="homepage-consent"><input name="consent" type="checkbox" value="yes" required /><span>{lang === 'es' ? 'Autorizo el uso de mis datos para atender esta solicitud y contactarme.' : 'I authorize use of my information to respond to this request and contact me.'}</span></label><input className="application-honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" /></>}
                <Link href="/privacidad">{lang === 'es' ? 'Aviso de privacidad' : 'Privacy notice'}</Link>
                {submissionError && <p className="homepage-form-error" role="alert">{submissionError}</p>}
                <button className="primary-button form-submit" type="submit" disabled={submitting}>{submitting ? (lang === 'es' ? 'Enviando…' : 'Submitting…') : audience === 'candidate' ? (lang === 'es' ? 'Enviar solicitud' : 'Submit application') : (lang === 'es' ? 'Solicitar personal' : 'Request staffing')}<span>{submitting ? '…' : '↗'}</span></button><small className="privacy-note">{audience === 'candidate' ? t.privacy : (lang === 'es' ? 'Tu solicitud se guardará para que el equipo pueda darle seguimiento.' : 'Your request will be saved for our team to follow up.')}</small>
              </form>}
            </div>
          </div>
        </section>
      </div>

      <footer>
        <div className="page-width footer-grid"><div className="footer-brand"><img src="/logo-optimized.webp" width="80" height="82" alt="Multiservices Laredo" /><h2>{t.footerLine1}<em>{t.footerLine2}</em></h2></div><div><b>{t.footerContact}</b><a href={phoneHref}>{contactPhone}</a><a href={`https://wa.me/${contactWhatsapp}`} target="_blank" rel="noreferrer">WhatsApp ↗</a><a href={`mailto:${contactEmail}`}>{contactEmail}</a></div><div><b>{t.footerVisit}</b><a href="https://maps.google.com/?q=1316+Zaragoza+St+Laredo+TX+78040" target="_blank" rel="noreferrer">1316 Zaragoza St.<br />Laredo, TX 78040 ↗</a></div><div><b>{t.footerSocial}</b><a href="https://www.instagram.com/multiservicesldo" target="_blank" rel="noreferrer">Instagram ↗</a><a href="https://www.facebook.com/p/Multiservices-Laredo-61557726029987/" target="_blank" rel="noreferrer">Facebook ↗</a><Link href="/portal">{lang === 'es' ? 'Portal de propietarios' : 'Owner portal'} ↗</Link></div></div>
        <div className="page-width footer-bottom"><span>© 2026 Multiservices Laredo LLC</span><Link href="/privacidad">{lang === 'es' ? 'Privacidad' : 'Privacy'}</Link><a href="#top">TOP ↑</a></div>
      </footer>
    </main>
  );
}
