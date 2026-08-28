'use client';

import { FormEvent, type CSSProperties, useEffect, useRef, useState } from 'react';

type Language = 'es' | 'en';
type Audience = 'candidate' | 'employer';
type PhotoName = 'ms-hero' | 'ms-safety' | 'ms-yard' | 'ms-recruiter';

const tickerItems = ['STAFFING', 'RECRUITMENT', 'WAREHOUSE', 'TEMP → HIRE', 'EQUIPMENT', 'NOM-050', 'LAREDO, TX'];

const content = {
  es: {
    utility: 'Staffing bilingüe + soluciones operativas',
    availability: 'Laredo, Texas · Respuesta local',
    nav: { services: 'Servicios', industries: 'Industrias', process: 'Proceso', jobs: 'Vacantes', faq: 'Preguntas' },
    start: 'Empezar ahora', menu: 'Menú', close: 'Cerrar',
    heroKicker: 'Talento operativo · Atención bilingüe',
    heroLine1: 'La gente correcta.', heroAccent: 'En el momento', heroLine2: 'que la operación la necesita.',
    heroLead: 'Conectamos empresas exigentes con personas listas para integrarse, aportar y mantener cada turno en movimiento.',
    employerCta: 'Necesito personal', candidateCta: 'Busco empleo', callCta: 'Llamar',
    heroBadge: 'Una extensión de tu equipo', heroBadgeSub: 'Staffing · Workforce · Soporte operativo', liveLabel: 'Respuesta desde Laredo',
    signals: [['ES / EN', 'Equipo bilingüe'], ['TEMP → HIRE', 'Contratación flexible'], ['LOCAL', 'Conocimiento del mercado']],
    metrics: [['06', 'soluciones integradas'], ['04', 'pasos con seguimiento'], ['ES/EN', 'atención bilingüe'], ['LDO', 'presencia local']],
    audienceKicker: 'Dos caminos. Una misma promesa.', audienceTitle: 'Hacer que el siguiente movimiento sea más fácil.',
    employer: { label: 'Para empresas', title: 'Personal preparado sin perder el ritmo.', text: 'Cuéntanos el puesto, el turno y la urgencia. Diseñamos la respuesta alrededor de tu operación.', points: ['Temporal y por proyecto', 'Temp-to-hire', 'Contratación directa'], cta: 'Solicitar talento' },
    candidate: { label: 'Para candidatos', title: 'Una oportunidad que sí encaja contigo.', text: 'Explora posiciones operativas, administrativas y de liderazgo con acompañamiento bilingüe.', points: ['Aplicación sencilla', 'Seguimiento cercano', 'Oportunidades locales'], cta: 'Ver oportunidades' },
    industriesKicker: 'Especialización operativa', industriesTitle: 'Conocemos el trabajo detrás de cada turno.',
    industriesIntro: 'No se trata solo de llenar espacios. Entendemos el ritmo, la seguridad y las habilidades que cada entorno exige.',
    industries: [
      ['Almacén y distribución', 'Carga, descarga, inventario, surtido, empaque y operación de piso.'],
      ['Transporte y patio', 'Yard operations, coordinación de unidades y soporte de equipo.'],
      ['Manufactura ligera', 'Retrabajos, control de calidad, etiquetado y cuadrillas por proyecto.'],
      ['Administración logística', 'Tráfico, atención al cliente, supervisión, seguridad y contabilidad.'],
    ],
    servicesKicker: 'Soluciones integrales', servicesTitle: 'Más capacidad para responder. Menos fricción para avanzar.',
    services: [
      ['01', 'Staffing', 'Reclutamiento y selección para posiciones temporales, por proyecto, temp-to-hire y contratación directa.'],
      ['02', 'Cuadrillas temporales', 'Inventarios, sorteos de calidad, escaneo de series, retrabajos, carga, descarga y limpieza de patios.'],
      ['03', 'Renta de equipo', 'Yard spotter trucks, montacargas y apoyo mientras tu equipo se encuentra en reparación.'],
      ['04', 'Etiquetado NOM-050', 'Termosellado, adhesivo, cosido textil y plastiflecha para distintas necesidades de producto.'],
      ['05', 'Apoyo migratorio', 'Preparación y gestión de trámites mediante un proceso claro, organizado y personalizado.'],
      ['06', 'Eventos corporativos', 'Planeación, ambientación, montaje, inauguraciones y experiencias para equipos y empresas.'],
    ],
    operationsKicker: 'Soporte que sale de la oficina', operationsTitleA: 'Movemos personas.', operationsTitleB: 'También movemos operaciones.',
    operationsText: 'Para proyectos seleccionados ofrecemos transporte coordinado, equipo de patio y soluciones que ayudan a proteger el flujo de trabajo.',
    operationsPoints: ['Transporte sujeto a proyecto y ubicación', 'Yard spotter trucks y montacargas', 'Atención directa desde Laredo'],
    safetyLabel: 'Seguridad + coordinación', yardLabel: 'Equipo + continuidad',
    processKicker: 'Nuestro proceso', processTitle: 'Entender primero. Conectar mejor.',
    process: [
      ['01', 'Conocemos', 'La operación, el ambiente, el turno y lo que hace exitosa a la posición.'],
      ['02', 'Reclutamos', 'Buscamos y evaluamos perfiles con intención, no solo por disponibilidad.'],
      ['03', 'Conectamos', 'Presentamos talento preparado para incorporarse con expectativas claras.'],
      ['04', 'Acompañamos', 'Damos seguimiento después del inicio para cuidar la relación y el resultado.'],
    ],
    jobKicker: 'Vacante destacada · Agosto 2026', jobTitle: 'Team Lead', jobPay: '$17', jobPayUnit: 'por hora · según experiencia',
    jobText: 'Buscamos liderazgo práctico, enfoque operativo y ganas de crecer junto a un equipo en movimiento.',
    jobTags: ['Liderazgo', 'Operaciones', 'Laredo, TX'], jobCta: 'Aplicar a esta vacante',
    rolesTitle: 'También conectamos talento para',
    roles: ['Warehouse Associates', 'Forklift Operators', 'Traffic Clerks', 'Administrative Assistants', 'Customer Service', 'Supervisors', 'Safety Coordinators', 'Accounting Personnel'],
    differenceKicker: 'Por qué Multiservices', differenceTitle: 'Cerca de la operación. Cerca de las personas.',
    differenceText: 'Un equipo bilingüe, conocimiento local y comunicación constante para responder a temporadas, nuevos proyectos y cambios de producción.',
    differences: [['Bilingüe por diseño', 'Comunicación clara para empresas y candidatos.'], ['Flexible por operación', 'Soluciones que se ajustan al turno, proyecto y urgencia.'], ['Presente después del inicio', 'Seguimiento para cuidar la integración y el resultado.']],
    faqKicker: 'Preguntas frecuentes', faqTitle: 'Información clara antes de comenzar.',
    faqs: [
      ['¿Qué tipos de contratación manejan?', 'Personal temporal, por proyecto, temp-to-hire y contratación directa, según la necesidad de cada empresa.'],
      ['¿Cómo puedo aplicar a una vacante?', 'Completa el formulario breve o escríbenos por WhatsApp. El equipo te indicará los siguientes pasos y cómo compartir tu résumé.'],
      ['¿Ofrecen transporte para empleados?', 'Está disponible en proyectos y ubicaciones seleccionadas. Confirma la disponibilidad con el equipo al aplicar.'],
      ['¿Qué información necesita una empresa para comenzar?', 'El puesto, turno, ubicación, fecha requerida, cantidad de personas y cualquier requisito de seguridad o experiencia.'],
    ],
    formKicker: 'El siguiente movimiento empieza aquí', formTitle: 'Cuéntanos qué necesitas.',
    formIntro: 'Prepara tu solicitud en menos de dos minutos y continúa por correo o WhatsApp.',
    candidateTab: 'Busco empleo', employerTab: 'Busco personal',
    name: 'Nombre completo', phone: 'Teléfono', email: 'Correo', role: 'Puesto de interés', company: 'Empresa', need: '¿Qué tipo de personal necesitas?', message: 'Mensaje adicional', submit: 'Preparar solicitud',
    candidateNote: 'Podrás adjuntar tu CV en el siguiente paso por correo o WhatsApp.', privacy: 'Nada se envía hasta que elijas correo o WhatsApp.',
    successTitle: 'Tu solicitud está preparada.', successText: 'Revisa tus datos y elige cómo deseas contactar al equipo de Multiservices.',
    emailCta: 'Continuar por correo', whatsappCta: 'Continuar por WhatsApp', editCta: 'Editar información',
    footerLine1: 'Conectamos talento.', footerLine2: 'Fortalecemos operaciones.', footerContact: 'Contacto', footerVisit: 'Visítanos', footerSocial: 'Síguenos',
    mobileApply: 'Aplicar', mobileHire: 'Contratar', mobileCall: 'Llamar',
  },
  en: {
    utility: 'Bilingual staffing + operational solutions',
    availability: 'Laredo, Texas · Local response',
    nav: { services: 'Services', industries: 'Industries', process: 'Process', jobs: 'Open roles', faq: 'Questions' },
    start: 'Start now', menu: 'Menu', close: 'Close',
    heroKicker: 'Operational talent · Bilingual service',
    heroLine1: 'The right people.', heroAccent: 'Right when', heroLine2: 'the operation needs them.',
    heroLead: 'We connect demanding businesses with people ready to contribute, integrate, and keep every shift moving.',
    employerCta: 'I need staff', candidateCta: 'I need a job', callCta: 'Call',
    heroBadge: 'An extension of your team', heroBadgeSub: 'Staffing · Workforce · Operational support', liveLabel: 'Response from Laredo',
    signals: [['ES / EN', 'Bilingual team'], ['TEMP → HIRE', 'Flexible hiring'], ['LOCAL', 'Market knowledge']],
    metrics: [['06', 'integrated solutions'], ['04', 'steps with follow-up'], ['ES/EN', 'bilingual service'], ['LDO', 'local presence']],
    audienceKicker: 'Two paths. One promise.', audienceTitle: 'Make the next move easier.',
    employer: { label: 'For employers', title: 'Prepared people without losing momentum.', text: 'Tell us the role, shift, and urgency. We shape the response around your operation.', points: ['Temporary and project', 'Temp-to-hire', 'Direct placement'], cta: 'Request talent' },
    candidate: { label: 'For candidates', title: 'An opportunity that fits where you are going.', text: 'Explore operational, administrative, and leadership roles with bilingual support.', points: ['Simple application', 'Close follow-up', 'Local opportunities'], cta: 'View opportunities' },
    industriesKicker: 'Operational specialization', industriesTitle: 'We know the work behind every shift.',
    industriesIntro: 'This is more than filling empty spots. We understand the pace, safety, and skills each environment requires.',
    industries: [
      ['Warehouse & distribution', 'Loading, unloading, inventory, picking, packing, and floor operations.'],
      ['Transportation & yard', 'Yard operations, unit coordination, and equipment support.'],
      ['Light manufacturing', 'Rework, quality control, labeling, and project crews.'],
      ['Logistics administration', 'Traffic, customer service, supervision, safety, and accounting.'],
    ],
    servicesKicker: 'Integrated solutions', servicesTitle: 'More capacity to respond. Less friction to move forward.',
    services: [
      ['01', 'Staffing', 'Recruiting and selection for temporary, project-based, temp-to-hire, and direct-hire roles.'],
      ['02', 'Temporary crews', 'Inventory, quality sorting, serial scanning, rework, loading, unloading, and yard cleanup.'],
      ['03', 'Equipment rental', 'Yard spotter trucks, forklifts, and support while your equipment is being repaired.'],
      ['04', 'NOM-050 labeling', 'Heat seal, adhesive, sewn labels, and tag fasteners for different product needs.'],
      ['05', 'Immigration support', 'Document preparation and process guidance through a clear, organized, personal experience.'],
      ['06', 'Corporate events', 'Planning, environments, installations, grand openings, and experiences for teams and businesses.'],
    ],
    operationsKicker: 'Support that leaves the office', operationsTitleA: 'We move people.', operationsTitleB: 'We move operations, too.',
    operationsText: 'Selected projects can include coordinated transportation, yard equipment, and practical solutions that protect workflow.',
    operationsPoints: ['Transportation varies by project and location', 'Yard spotter trucks and forklifts', 'Direct support from Laredo'],
    safetyLabel: 'Safety + coordination', yardLabel: 'Equipment + continuity',
    processKicker: 'Our process', processTitle: 'Understand first. Connect better.',
    process: [['01', 'Discover', 'The operation, environment, shift, and what makes the role successful.'], ['02', 'Recruit', 'We source and evaluate people with intention, not just availability.'], ['03', 'Connect', 'We introduce prepared talent with clear expectations.'], ['04', 'Support', 'We follow up after day one to protect the relationship and result.']],
    jobKicker: 'Featured opening · August 2026', jobTitle: 'Team Lead', jobPay: '$17', jobPayUnit: 'per hour · based on experience',
    jobText: 'We are looking for practical leadership, an operational mindset, and the drive to grow with a team in motion.',
    jobTags: ['Leadership', 'Operations', 'Laredo, TX'], jobCta: 'Apply for this role', rolesTitle: 'We also connect talent for',
    roles: ['Warehouse Associates', 'Forklift Operators', 'Traffic Clerks', 'Administrative Assistants', 'Customer Service', 'Supervisors', 'Safety Coordinators', 'Accounting Personnel'],
    differenceKicker: 'Why Multiservices', differenceTitle: 'Close to the operation. Close to the people.',
    differenceText: 'A bilingual team, local knowledge, and constant communication to respond to seasons, new projects, and production changes.',
    differences: [['Bilingual by design', 'Clear communication for employers and candidates.'], ['Flexible by operation', 'Solutions shaped around the shift, project, and urgency.'], ['Present after day one', 'Follow-up that supports integration and results.']],
    faqKicker: 'Frequently asked questions', faqTitle: 'Clear information before you begin.',
    faqs: [
      ['What types of hiring do you offer?', 'Temporary, project-based, temp-to-hire, and direct placement, depending on each employer’s needs.'],
      ['How can I apply for a job?', 'Complete the short form or message us on WhatsApp. The team will explain the next steps and how to share your résumé.'],
      ['Do you offer employee transportation?', 'It is available for selected projects and locations. Confirm current availability with the team when you apply.'],
      ['What does an employer need to get started?', 'The role, shift, location, start date, number of people, and any safety or experience requirements.'],
    ],
    formKicker: 'Your next move starts here', formTitle: 'Tell us what you need.', formIntro: 'Prepare your request in under two minutes, then continue by email or WhatsApp.',
    candidateTab: 'I need a job', employerTab: 'I need staff', name: 'Full name', phone: 'Phone', email: 'Email', role: 'Role of interest', company: 'Company', need: 'What kind of staff do you need?', message: 'Additional message', submit: 'Prepare request',
    candidateNote: 'You can attach your résumé in the next step by email or WhatsApp.', privacy: 'Nothing is sent until you choose email or WhatsApp.',
    successTitle: 'Your request is ready.', successText: 'Review your information and choose how you want to contact the Multiservices team.',
    emailCta: 'Continue by email', whatsappCta: 'Continue on WhatsApp', editCta: 'Edit information',
    footerLine1: 'Connecting talent.', footerLine2: 'Strengthening operations.', footerContact: 'Contact', footerVisit: 'Visit us', footerSocial: 'Follow us',
    mobileApply: 'Apply', mobileHire: 'Hire', mobileCall: 'Call',
  },
} as const;

const photoWidths = [640, 960, 1440, 2400];

function ResponsivePhoto({ name, alt, portrait = false, priority = false, sizes = '100vw' }: { name: PhotoName; alt: string; portrait?: boolean; priority?: boolean; sizes?: string }) {
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
  url: 'https://www.ethrovsdraft.com',
  telephone: '+1-956-441-1292',
  email: 'operations@multiservicesldo.com',
  address: { '@type': 'PostalAddress', streetAddress: '1316 Zaragoza St.', addressLocality: 'Laredo', addressRegion: 'TX', postalCode: '78040', addressCountry: 'US' },
  areaServed: 'Laredo, Texas',
  sameAs: ['https://www.instagram.com/multiservicesldo'],
};

export default function Home() {
  const [lang, setLang] = useState<Language>('es');
  const [audience, setAudience] = useState<Audience>('candidate');
  const [menuOpen, setMenuOpen] = useState(false);
  const [motionPaused, setMotionPaused] = useState(false);
  const [contactLinks, setContactLinks] = useState<{ email: string; whatsapp: string } | null>(null);
  const heroVisualRef = useRef<HTMLDivElement>(null);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  const t = content[lang];

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  useEffect(() => { if (contactLinks) successHeadingRef.current?.focus(); }, [contactLinks]);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && setMenuOpen(false);
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [menuOpen]);

  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nav = document.querySelector<HTMLElement>('.nav-shell');
    let frame = 0;
    const updateScroll = () => {
      frame = 0;
      const scrollRange = root.scrollHeight - window.innerHeight;
      root.style.setProperty('--scroll-progress', (scrollRange > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollRange)) : 0).toString());
      nav?.classList.toggle('is-compact', window.scrollY > 44);
      if (!reduceMotion && window.innerWidth > 800) {
        document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((target) => {
          const rect = target.getBoundingClientRect();
          if (rect.bottom < -120 || rect.top > window.innerHeight + 120) return;
          const distance = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
          target.style.setProperty('--parallax-y', `${Math.max(-1, Math.min(1, distance)) * Number(target.dataset.parallax || 12)}px`);
        });
      }
    };
    const requestUpdate = () => { if (!frame) frame = window.requestAnimationFrame(updateScroll); };
    if (!reduceMotion && 'IntersectionObserver' in window) {
      root.classList.add('motion-ready');
      const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }), { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
      document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((target) => observer.observe(target));
      requestUpdate();
      window.addEventListener('scroll', requestUpdate, { passive: true });
      window.addEventListener('resize', requestUpdate);
      return () => {
        observer.disconnect();
        if (frame) window.cancelAnimationFrame(frame);
        window.removeEventListener('scroll', requestUpdate);
        window.removeEventListener('resize', requestUpdate);
        root.classList.remove('motion-ready');
        root.style.removeProperty('--scroll-progress');
      };
    }
    updateScroll();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    return () => window.removeEventListener('scroll', requestUpdate);
  }, []);

  const chooseAudience = (next: Audience) => {
    setAudience(next);
    setContactLinks(null);
    setMenuOpen(false);
  };

  const prepareContact = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const get = (name: string) => String(data.get(name) || '').trim();
    const subject = audience === 'candidate'
      ? (lang === 'es' ? `Solicitud de empleo — ${get('name')}` : `Job application — ${get('name')}`)
      : (lang === 'es' ? `Solicitud de personal — ${get('company')}` : `Staffing request — ${get('company')}`);
    const lines = audience === 'candidate'
      ? [`${t.name}: ${get('name')}`, `${t.phone}: ${get('phone')}`, `${t.email}: ${get('email')}`, `${t.role}: ${get('role')}`, `${t.message}: ${get('message') || '—'}`]
      : [`${t.name}: ${get('name')}`, `${t.phone}: ${get('phone')}`, `${t.email}: ${get('email')}`, `${t.company}: ${get('company')}`, `${t.need}: ${get('need')}`, `${t.message}: ${get('message') || '—'}`];
    const body = lines.join('\n');
    setContactLinks({
      email: `mailto:operations@multiservicesldo.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      whatsapp: `https://wa.me/19566069956?text=${encodeURIComponent(`${subject}\n\n${body}`)}`,
    });
  };

  const navLinks = [
    ['#servicios', t.nav.services], ['#industrias', t.nav.industries], ['#proceso', t.nav.process], ['#vacantes', t.nav.jobs], ['#preguntas', t.nav.faq],
  ];

  return (
    <main className={[motionPaused ? 'motion-paused' : '', menuOpen ? 'menu-open' : ''].filter(Boolean).join(' ')}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      <a className="skip-link" href="#contenido">{lang === 'es' ? 'Saltar al contenido' : 'Skip to content'}</a>
      <div className="scroll-progress" aria-hidden="true" />
      <div className="utility-bar"><span>{t.utility}</span><span>{t.availability}</span><a href="tel:+19564411292">+1 956 441 1292</a></div>

      <header className="nav-shell">
        <a className="brand-lockup" href="#top" aria-label="Multiservices Laredo home" onClick={() => setMenuOpen(false)}>
          <img src="/logo-optimized.webp" width="54" height="55" alt="" /><span>MULTISERVICES<small>LAREDO</small></span>
        </a>
        <nav aria-label={lang === 'es' ? 'Navegación principal' : 'Main navigation'}>
          {navLinks.map(([href, label]) => <a href={href} key={href}>{label}</a>)}
        </nav>
        <div className="nav-actions">
          <div className="language-switch" role="group" aria-label="Language">
            <button type="button" aria-pressed={lang === 'es'} className={lang === 'es' ? 'active' : ''} onClick={() => setLang('es')}>ES</button><span>/</span>
            <button type="button" aria-pressed={lang === 'en'} className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
          </div>
          <a className="primary-button nav-cta" href="#contacto">{t.start}<span>↗</span></a>
          <button className="menu-toggle" type="button" aria-label={menuOpen ? t.close : t.menu} aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => setMenuOpen((open) => !open)}><span>{menuOpen ? t.close : t.menu}</span><i aria-hidden="true" /></button>
        </div>
      </header>

      <div className={`mobile-menu ${menuOpen ? 'is-open' : ''}`} id="mobile-menu" aria-hidden={!menuOpen}>
        <nav aria-label={lang === 'es' ? 'Navegación móvil' : 'Mobile navigation'}>
          {navLinks.map(([href, label], index) => <a href={href} key={href} onClick={() => setMenuOpen(false)}><span>0{index + 1}</span>{label}<i>↗</i></a>)}
        </nav>
        <div><a href="#contacto" className="primary-button" onClick={() => chooseAudience('candidate')}>{t.candidateCta}<span>↗</span></a><a href="#contacto" className="secondary-button light" onClick={() => chooseAudience('employer')}>{t.employerCta}<span>↗</span></a></div>
      </div>

      <div id="contenido">
        <section className="hero-v3" id="top">
          <div className="hero-grid">
            <div className="hero-copy" data-reveal="up">
              <p className="eyebrow"><span />{t.heroKicker}</p>
              <h1><span>{t.heroLine1}</span><em>{t.heroAccent}</em><span>{t.heroLine2}</span></h1>
              <p className="hero-lead">{t.heroLead}</p>
              <div className="hero-actions"><a className="primary-button" href="#contacto" onClick={() => chooseAudience('employer')}>{t.employerCta}<span>↗</span></a><a className="secondary-button" href="#contacto" onClick={() => chooseAudience('candidate')}>{t.candidateCta}<span>↓</span></a></div>
              <div className="hero-signals">{t.signals.map(([value, label]) => <div key={value}><strong>{value}</strong><span>{label}</span></div>)}</div>
            </div>
            <div className="hero-visual" ref={heroVisualRef} data-reveal="image" onPointerMove={(event) => {
              const box = heroVisualRef.current?.getBoundingClientRect();
              if (!box) return;
              heroVisualRef.current?.style.setProperty('--mx', `${((event.clientX - box.left) / box.width) * 100}%`);
              heroVisualRef.current?.style.setProperty('--my', `${((event.clientY - box.top) / box.height) * 100}%`);
            }}>
              <div className="hero-photo" data-parallax="9"><ResponsivePhoto name="ms-hero" portrait priority sizes="(max-width: 780px) 100vw, 48vw" alt={lang === 'es' ? 'Supervisora bilingüe y líder operativo revisando un plan de trabajo en un centro logístico' : 'Bilingual supervisor and operations lead reviewing a work plan in a logistics center'} /></div>
              <div className="hero-status"><i /><span>{t.liveLabel}</span><strong>ES / EN</strong></div>
              <div className="hero-card"><small>01 / TALENT SOLUTIONS</small><strong>{t.heroBadge}</strong><span>{t.heroBadgeSub}</span></div>
              <div className="hero-coordinate">27.5064° N<br />99.5075° W</div>
            </div>
          </div>
        </section>

        <div className="moving-line"><div aria-hidden="true">{[...tickerItems, ...tickerItems].map((item, index) => <span key={`${item}-${index}`}>{item}<i>◆</i></span>)}</div><button type="button" aria-pressed={motionPaused} onClick={() => setMotionPaused((paused) => !paused)}>{motionPaused ? (lang === 'es' ? 'Reanudar' : 'Play') : (lang === 'es' ? 'Pausar' : 'Pause')}</button></div>

        <section className="metric-rail page-width" aria-label={lang === 'es' ? 'Resumen de capacidades' : 'Capability summary'}>
          {t.metrics.map(([value, label], index) => <div data-reveal="up" style={{ '--delay': `${index * 70}ms` } as CSSProperties} key={value}><strong>{value}</strong><span>{label}</span></div>)}
        </section>

        <section className="audience-section page-width" id="caminos">
          <div className="section-heading" data-reveal="up"><div><p className="eyebrow"><span />{t.audienceKicker}</p><h2>{t.audienceTitle}</h2></div><p>01 / START</p></div>
          <div className="audience-grid">
            <article className="audience-card employer-card" data-reveal="left">
              <div className="audience-photo"><ResponsivePhoto name="ms-safety" sizes="(max-width: 780px) 100vw, 50vw" alt={lang === 'es' ? 'Equipo operativo en una reunión de seguridad frente a muelles de carga' : 'Operations team in a safety meeting by loading docks'} /></div>
              <div className="audience-card-body"><p><span>01</span>{t.employer.label}</p><h3>{t.employer.title}</h3><div className="audience-copy"><p>{t.employer.text}</p><ul>{t.employer.points.map((point) => <li key={point}>{point}</li>)}</ul></div><a href="#contacto" onClick={() => chooseAudience('employer')}>{t.employer.cta}<span>↗</span></a></div>
            </article>
            <article className="audience-card candidate-card" data-reveal="right">
              <div className="audience-photo"><ResponsivePhoto name="ms-recruiter" portrait sizes="(max-width: 780px) 100vw, 50vw" alt={lang === 'es' ? 'Reclutadora bilingüe atendiendo a un candidato en una oficina contemporánea' : 'Bilingual recruiter meeting a candidate in a contemporary office'} /></div>
              <div className="audience-card-body"><p><span>02</span>{t.candidate.label}</p><h3>{t.candidate.title}</h3><div className="audience-copy"><p>{t.candidate.text}</p><ul>{t.candidate.points.map((point) => <li key={point}>{point}</li>)}</ul></div><a href="#contacto" onClick={() => chooseAudience('candidate')}>{t.candidate.cta}<span>↗</span></a></div>
            </article>
          </div>
        </section>

        <section className="industries-section" id="industrias">
          <div className="page-width">
            <div className="industries-intro" data-reveal="up"><p className="eyebrow gold"><span />{t.industriesKicker}</p><h2>{t.industriesTitle}</h2><p>{t.industriesIntro}</p></div>
            <div className="industry-mosaic">
              {t.industries.map(([title, text], index) => <article className={`industry-card industry-${index + 1}`} key={title} data-reveal="image">
                <div className="industry-image"><ResponsivePhoto name={(['ms-hero', 'ms-yard', 'ms-safety', 'ms-recruiter'] as PhotoName[])[index]} portrait={index === 0 || index === 3} sizes="(max-width: 780px) 100vw, 50vw" alt="" /></div>
                <div><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></div>
              </article>)}
            </div>
          </div>
        </section>

        <section className="services-section" id="servicios">
          <div className="page-width">
            <div className="section-heading inverted" data-reveal="up"><div><p className="eyebrow gold"><span />{t.servicesKicker}</p><h2>{t.servicesTitle}</h2></div><p>02 / SOLUTIONS</p></div>
            <div className="service-list">{t.services.map(([number, title, text], index) => <article key={number} data-reveal="up" style={{ '--delay': `${(index % 3) * 70}ms` } as CSSProperties}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
            <div className="section-cta" data-reveal="up"><p>{lang === 'es' ? '¿Tienes una necesidad fuera de esta lista?' : 'Have a need outside this list?'}</p><a href="#contacto" className="secondary-button light" onClick={() => chooseAudience('employer')}>{t.employerCta}<span>↗</span></a></div>
          </div>
        </section>

        <section className="operations-section page-width">
          <div className="operations-gallery" data-reveal="left">
            <figure className="safety-photo" data-parallax="10"><ResponsivePhoto name="ms-safety" sizes="(max-width: 780px) 90vw, 44vw" alt={lang === 'es' ? 'Cuadrilla reunida para una charla de seguridad en un centro logístico' : 'Crew gathered for a safety talk in a logistics center'} /><figcaption>{t.safetyLabel}</figcaption></figure>
            <figure className="yard-photo" data-parallax="18"><ResponsivePhoto name="ms-yard" sizes="(max-width: 780px) 64vw, 30vw" alt={lang === 'es' ? 'Operador de montacargas y camión de patio trabajando de forma segura' : 'Forklift operator and yard truck working safely'} /><figcaption>{t.yardLabel}</figcaption></figure>
          </div>
          <div className="operations-copy" data-reveal="right"><p className="eyebrow"><span />{t.operationsKicker}</p><h2>{t.operationsTitleA}<em>{t.operationsTitleB}</em></h2><p>{t.operationsText}</p><ul>{t.operationsPoints.map((point) => <li key={point}>{point}</li>)}</ul><a href="#contacto" className="secondary-button" onClick={() => chooseAudience('employer')}>{t.employerCta}<span>↗</span></a></div>
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
            <div className="job-copy" data-reveal="left"><p className="eyebrow gold"><span />{t.jobKicker}</p><h2>{t.jobTitle}</h2><p>{t.jobText}</p><div className="tag-row">{t.jobTags.map((tag) => <span key={tag}>{tag}</span>)}</div><a className="primary-button" href="#contacto" onClick={() => chooseAudience('candidate')}>{t.jobCta}<span>↗</span></a></div>
            <div className="pay-card" data-reveal="right"><small>{lang === 'es' ? 'Compensación' : 'Compensation'}</small><strong>{t.jobPay}</strong><span>{t.jobPayUnit}</span><i>/ HR</i></div>
            <div className="role-cloud" data-reveal="up"><p>{t.rolesTitle}</p>{t.roles.map((role) => <span key={role}>{role}</span>)}</div>
          </div>
        </section>

        <section className="difference-section page-width">
          <div className="difference-title" data-reveal="left"><p className="eyebrow"><span />{t.differenceKicker}</p><h2>{t.differenceTitle}</h2><p>{t.differenceText}</p></div>
          <div className="difference-list">{t.differences.map(([title, text], index) => <article key={title} data-reveal="right" style={{ '--delay': `${index * 80}ms` } as CSSProperties}><span>0{index + 1}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
        </section>

        <section className="faq-section" id="preguntas">
          <div className="page-width faq-grid">
            <div data-reveal="left"><p className="eyebrow"><span />{t.faqKicker}</p><h2>{t.faqTitle}</h2></div>
            <div className="faq-list" data-reveal="right">{t.faqs.map(([question, answer], index) => <details key={question} open={index === 0}><summary><span>0{index + 1}</span>{question}<i>+</i></summary><p>{answer}</p></details>)}</div>
          </div>
        </section>

        <section className="contact-section" id="contacto">
          <div className="page-width contact-grid">
            <div className="contact-intro" data-reveal="left"><p className="eyebrow gold"><span />{t.formKicker}</p><h2>{t.formTitle}</h2><p>{t.formIntro}</p><div className="direct-links"><a href="tel:+19564411292"><small>PHONE</small><b>+1 956 441 1292</b><span>↗</span></a><a href="https://wa.me/19566069956" target="_blank" rel="noreferrer"><small>WHATSAPP</small><b>+1 956 606 9956</b><span>↗</span></a><a href="mailto:operations@multiservicesldo.com"><small>EMAIL</small><b>operations@multiservicesldo.com</b><span>↗</span></a></div></div>
            <div className="form-shell" data-reveal="right">
              <div className="form-tabs" role="group" aria-label={lang === 'es' ? 'Tipo de solicitud' : 'Request type'}><button type="button" aria-pressed={audience === 'candidate'} className={audience === 'candidate' ? 'active' : ''} onClick={() => chooseAudience('candidate')}>{t.candidateTab}</button><button type="button" aria-pressed={audience === 'employer'} className={audience === 'employer' ? 'active' : ''} onClick={() => chooseAudience('employer')}>{t.employerTab}</button></div>
              {contactLinks ? <div className="form-success" role="status"><span>✓</span><h3 ref={successHeadingRef} tabIndex={-1}>{t.successTitle}</h3><p>{t.successText}</p><div><a className="primary-button" href={contactLinks.email}>{t.emailCta}<span>↗</span></a><a className="secondary-button light" href={contactLinks.whatsapp} target="_blank" rel="noreferrer">{t.whatsappCta}<span>↗</span></a></div><button type="button" onClick={() => setContactLinks(null)}>{t.editCta}</button></div> : <form onSubmit={prepareContact}>
                <div className="field-pair"><label>{t.name}<input name="name" required autoComplete="name" /></label><label>{t.phone}<input name="phone" required type="tel" autoComplete="tel" /></label></div>
                <label>{t.email}<input name="email" required type="email" autoComplete="email" /></label>
                {audience === 'candidate' ? <label>{t.role}<input name="role" required /></label> : <><label>{t.company}<input name="company" required autoComplete="organization" /></label><label>{t.need}<textarea name="need" rows={4} required /></label></>}
                <label>{t.message}<textarea name="message" rows={3} /></label>
                {audience === 'candidate' && <small className="candidate-note">{t.candidateNote}</small>}
                <button className="primary-button form-submit" type="submit">{t.submit}<span>↗</span></button><small className="privacy-note">{t.privacy}</small>
              </form>}
            </div>
          </div>
        </section>
      </div>

      <footer>
        <div className="page-width footer-grid"><div className="footer-brand"><img src="/logo-optimized.webp" width="80" height="82" alt="Multiservices Laredo" /><h2>{t.footerLine1}<em>{t.footerLine2}</em></h2></div><div><b>{t.footerContact}</b><a href="tel:+19564411292">+1 956 441 1292</a><a href="https://wa.me/19566069956" target="_blank" rel="noreferrer">WhatsApp ↗</a><a href="mailto:operations@multiservicesldo.com">operations@multiservicesldo.com</a></div><div><b>{t.footerVisit}</b><a href="https://maps.google.com/?q=1316+Zaragoza+St+Laredo+TX+78040" target="_blank" rel="noreferrer">1316 Zaragoza St.<br />Laredo, TX 78040 ↗</a></div><div><b>{t.footerSocial}</b><a href="https://www.instagram.com/multiservicesldo" target="_blank" rel="noreferrer">Instagram ↗</a></div></div>
        <div className="page-width footer-bottom"><span>© 2026 Multiservices Laredo LLC</span><span>STAFFING / RECRUITMENT / TALENT SOLUTIONS</span><a href="#top">TOP ↑</a></div>
      </footer>
      <nav className="mobile-action-bar" aria-label={lang === 'es' ? 'Acciones rápidas' : 'Quick actions'}><a href="#contacto" onClick={() => chooseAudience('candidate')}><span>↗</span>{t.mobileApply}</a><a href="#contacto" onClick={() => chooseAudience('employer')}><span>+</span>{t.mobileHire}</a><a href="tel:+19564411292"><span>☎</span>{t.mobileCall}</a></nav>
    </main>
  );
}
