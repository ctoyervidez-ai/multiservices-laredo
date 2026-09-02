'use client';

import { FormEvent, type CSSProperties, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { PublicJob, SiteSettings } from '@/lib/portal-types';

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
    purposeKicker: 'Más que cubrir una vacante',
    purposeTitle: 'Detrás de una operación eficiente, siempre hay un buen equipo.',
    purposeAccent: 'Nosotros te ayudamos a construirlo.',
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
    transportKicker: 'Transporte para colaboradores',
    transportTitle: 'Llegar al trabajo también debe ser sencillo.',
    transportAccent: 'Rutas coordinadas para que el turno empiece a tiempo.',
    transportText: 'Brindamos transporte seguro y confiable para colaboradores en proyectos y ubicaciones seleccionadas.',
    transportPoints: ['Recolección desde puntos estratégicos', 'Viajes seguros y puntuales', 'Coordinación según proyecto y turno'],
    transportAreas: 'Áreas disponibles', transportRoutes: 'Killam · Minas · Milla 13', transportCta: 'Preguntar por transporte',
    transportMainLabel: 'Transporte seguro', transportArrivalLabel: 'Llegadas coordinadas',
    processKicker: 'Nuestro proceso', processTitle: 'Entender primero. Conectar mejor.',
    process: [
      ['01', 'Conocemos', 'La operación, el ambiente, el turno y lo que hace exitosa a la posición.'],
      ['02', 'Reclutamos', 'Buscamos y evaluamos perfiles con intención, no solo por disponibilidad.'],
      ['03', 'Conectamos', 'Presentamos talento preparado para incorporarse con expectativas claras.'],
      ['04', 'Acompañamos', 'Damos seguimiento después del inicio para cuidar la relación y el resultado.'],
    ],
    jobKicker: 'Vacante destacada · Consulta disponibilidad', jobTitle: 'Team Lead', jobPay: '$17', jobPayUnit: 'por hora · según experiencia',
    jobText: 'Buscamos liderazgo práctico, enfoque operativo y ganas de crecer junto a un equipo en movimiento.',
    jobTags: ['Liderazgo', 'Operaciones', 'Laredo, TX'], jobCta: 'Aplicar a esta vacante',
    rolesTitle: 'Vacantes posibles',
    rolesNote: 'Las posiciones y proyectos cambian según disponibilidad. Contáctanos para confirmar las vacantes actuales.',
    roles: ['Labor general', 'Revisión / control de calidad', 'Guardia de caseta', 'Mulero / operador de patio', 'Ejecutivo de tráfico', 'CSR / servicio al cliente', 'Meseros', 'Cocineros', 'Team Lead', 'Proyectos fuera de la ciudad', 'Data Entry', 'Montacarguistas', 'Auditor de bodega', 'Plancheros', 'Asociados de almacén', 'Clerks de tráfico', 'Asistentes administrativos', 'Supervisores', 'Coordinadores de seguridad', 'Personal de contabilidad'],
    differenceKicker: 'Por qué Multiservices', differenceTitle: 'Cerca de la operación. Cerca de las personas.',
    differenceText: 'Soluciones visibles y concretas para responder a temporadas, nuevos proyectos y cambios de producción.',
    showcaseSlides: [
      ['Etiquetado NOM-050', 'Etiquetado listo para cada producto.', 'Termosellado, adhesivo, cosido textil y plastiflecha con ejecución ordenada y seguimiento cercano.', 'Equipo aplicando y escaneando etiquetas en cajas dentro de un almacén'],
      ['Cuadrillas por proyecto', 'Más manos cuando la operación lo exige.', 'Inventarios, sorteos de calidad, retrabajos, carga, descarga y limpieza de patios según el alcance del proyecto.', 'Cuadrilla operativa reunida para coordinar un proyecto logístico'],
      ['Renta de mulas', 'Equipo que mantiene el patio en movimiento.', 'Yard spotter trucks disponibles para apoyar la continuidad mientras una unidad se encuentra en reparación.', 'Mula de patio acoplando un remolque frente a los andenes'],
    ],
    faqKicker: 'Preguntas frecuentes', faqTitle: 'Información clara antes de comenzar.',
    faqs: [
      ['¿Qué tipos de contratación manejan?', 'Personal temporal, por proyecto, temp-to-hire y contratación directa, según la necesidad de cada empresa.'],
      ['¿Cómo puedo aplicar a una vacante?', 'Completa el formulario breve o escríbenos por WhatsApp. El equipo te indicará los siguientes pasos y cómo compartir tu résumé.'],
      ['¿Ofrecen transporte para empleados?', 'Está disponible en proyectos y ubicaciones seleccionadas. Confirma la disponibilidad con el equipo al aplicar.'],
      ['¿Qué información necesita una empresa para comenzar?', 'El puesto, turno, ubicación, fecha requerida, cantidad de personas y cualquier requisito de seguridad o experiencia.'],
    ],
    formKicker: 'El siguiente movimiento empieza aquí', formTitle: 'Cuéntanos qué necesitas.',
    formIntro: 'Aplica a una vacante o solicita personal en menos de dos minutos.',
    candidateTab: 'Busco empleo', employerTab: 'Busco personal',
    name: 'Nombre completo', phone: 'Teléfono', email: 'Correo', role: 'Puesto de interés', rolePrompt: 'Selecciona una vacante', roleOther: 'Otra posición', roleOtherLabel: 'Escribe la posición de interés', roleHelp: 'Elige una vacante posible o selecciona “Otra posición”.', company: 'Empresa', need: '¿Qué tipo de personal necesitas?', message: 'Mensaje adicional', submit: 'Preparar solicitud',
    candidateNote: 'Puedes adjuntar tu CV en PDF. Se guardará de forma privada para el equipo autorizado.', privacy: 'Al enviar, autorizas al equipo a usar estos datos para evaluar tu solicitud y contactarte.',
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
    purposeKicker: 'More than filling a role',
    purposeTitle: 'Behind every efficient operation, there is a strong team.',
    purposeAccent: 'We help you build it.',
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
    transportKicker: 'Employee transportation',
    transportTitle: 'Getting to work should be simple, too.',
    transportAccent: 'Coordinated routes that help every shift start on time.',
    transportText: 'We provide safe, reliable transportation for employees on selected projects and service areas.',
    transportPoints: ['Pickup from strategic locations', 'Safe and punctual trips', 'Coordination by project and shift'],
    transportAreas: 'Available areas', transportRoutes: 'Killam · Minas · Mile 13', transportCta: 'Ask about transportation',
    transportMainLabel: 'Safe transportation', transportArrivalLabel: 'Coordinated arrivals',
    processKicker: 'Our process', processTitle: 'Understand first. Connect better.',
    process: [['01', 'Discover', 'The operation, environment, shift, and what makes the role successful.'], ['02', 'Recruit', 'We source and evaluate people with intention, not just availability.'], ['03', 'Connect', 'We introduce prepared talent with clear expectations.'], ['04', 'Support', 'We follow up after day one to protect the relationship and result.']],
    jobKicker: 'Featured opening · Ask about availability', jobTitle: 'Team Lead', jobPay: '$17', jobPayUnit: 'per hour · based on experience',
    jobText: 'We are looking for practical leadership, an operational mindset, and the drive to grow with a team in motion.',
    jobTags: ['Leadership', 'Operations', 'Laredo, TX'], jobCta: 'Apply for this role', rolesTitle: 'Possible openings',
    rolesNote: 'Positions and projects vary by availability. Contact us to confirm current openings.',
    roles: ['General Labor', 'Quality Inspection', 'Gate Guard', 'Yard Mule Operator', 'Traffic Coordinator', 'CSR / Customer Service', 'Servers', 'Cooks', 'Team Lead', 'Out-of-town Projects', 'Data Entry', 'Forklift Operators', 'Warehouse Auditor', 'Griddle Cooks', 'Warehouse Associates', 'Traffic Clerks', 'Administrative Assistants', 'Supervisors', 'Safety Coordinators', 'Accounting Personnel'],
    differenceKicker: 'Why Multiservices', differenceTitle: 'Close to the operation. Close to the people.',
    differenceText: 'Visible, practical solutions for seasons, new projects, and production changes.',
    showcaseSlides: [
      ['NOM-050 labeling', 'Labeling prepared for every product.', 'Heat seal, adhesive, sewn labels, and tag fasteners delivered through an organized process with close follow-up.', 'Team applying and scanning labels on boxes inside a warehouse'],
      ['Project crews', 'More hands when the operation demands it.', 'Inventory, quality sorting, rework, loading, unloading, and yard cleanup shaped around the project scope.', 'Operations crew meeting to coordinate a logistics project'],
      ['Yard truck rental', 'Equipment that keeps the yard moving.', 'Yard spotter trucks available to protect continuity while a unit is being repaired.', 'Yard spotter truck coupling a trailer in front of loading docks'],
    ],
    faqKicker: 'Frequently asked questions', faqTitle: 'Clear information before you begin.',
    faqs: [
      ['What types of hiring do you offer?', 'Temporary, project-based, temp-to-hire, and direct placement, depending on each employer’s needs.'],
      ['How can I apply for a job?', 'Complete the short form or message us on WhatsApp. The team will explain the next steps and how to share your résumé.'],
      ['Do you offer employee transportation?', 'It is available for selected projects and locations. Confirm current availability with the team when you apply.'],
      ['What does an employer need to get started?', 'The role, shift, location, start date, number of people, and any safety or experience requirements.'],
    ],
    formKicker: 'Your next move starts here', formTitle: 'Tell us what you need.', formIntro: 'Apply for an opening or request staff in under two minutes.',
    candidateTab: 'I need a job', employerTab: 'I need staff', name: 'Full name', phone: 'Phone', email: 'Email', role: 'Role of interest', rolePrompt: 'Select an opening', roleOther: 'Another position', roleOtherLabel: 'Enter the role you are interested in', roleHelp: 'Choose a possible opening or select “Another position”.', company: 'Company', need: 'What kind of staff do you need?', message: 'Additional message', submit: 'Prepare request',
    candidateNote: 'You can attach your résumé as a PDF. It will be stored privately for authorized staff.', privacy: 'By submitting, you authorize the team to use this information to evaluate your application and contact you.',
    successTitle: 'Your request is ready.', successText: 'Review your information and choose how you want to contact the Multiservices team.',
    emailCta: 'Continue by email', whatsappCta: 'Continue on WhatsApp', editCta: 'Edit information',
    footerLine1: 'Connecting talent.', footerLine2: 'Strengthening operations.', footerContact: 'Contact', footerVisit: 'Visit us', footerSocial: 'Follow us',
    mobileApply: 'Apply', mobileHire: 'Hire', mobileCall: 'Call',
  },
} as const;

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
  url: 'https://www.ethrovsdraft.com',
  telephone: '+1-956-441-1292',
  email: 'operations@multiservicesldo.com',
  address: { '@type': 'PostalAddress', streetAddress: '1316 Zaragoza St.', addressLocality: 'Laredo', addressRegion: 'TX', postalCode: '78040', addressCountry: 'US' },
  areaServed: 'Laredo, Texas',
  sameAs: ['https://www.instagram.com/multiservicesldo'],
};

export default function HomeClient({ initialSettings, initialJobs }: { initialSettings: SiteSettings; initialJobs: PublicJob[] }) {
  const [lang, setLang] = useState<Language>('es');
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
  const t = content[lang];

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  useEffect(() => { submissionStartedAt.current = Date.now(); }, []);
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

  const chooseAudience = (next: Audience) => {
    setAudience(next);
    setContactLinks(null);
    setSubmissionError('');
    submissionStartedAt.current = Date.now();
    submissionKey.current = '';
    setMenuOpen(false);
  };

  const selectRole = (index: number) => {
    if (index >= 0) setRoleChoice(String(index));
    chooseAudience('candidate');
  };

  const showPreviousService = () => setServiceSlide((current) => (current - 1 + showcaseImages.length) % showcaseImages.length);
  const showNextService = () => setServiceSlide((current) => (current + 1) % showcaseImages.length);

  const prepareContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const get = (name: string) => String(data.get(name) || '').trim();
    if (audience === 'candidate') {
      setSubmitting(true);
      setSubmissionError('');
      if (!submissionKey.current) submissionKey.current = crypto.randomUUID();
      data.set('startedAt', String(submissionStartedAt.current));
      data.set('submissionKey', submissionKey.current);
      try {
        const request = await fetch('/api/applications', { method: 'POST', body: data });
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
    const subject = lang === 'es' ? `Solicitud de personal — ${get('company')}` : `Staffing request — ${get('company')}`;
    const lines = [`${t.name}: ${get('name')}`, `${t.phone}: ${get('phone')}`, `${t.email}: ${get('email')}`, `${t.company}: ${get('company')}`, `${t.need}: ${get('need')}`, `${t.message}: ${get('message') || '—'}`];
    const body = lines.join('\n');
    setContactLinks({
      email: `mailto:${siteSettings?.contactEmail || 'operations@multiservicesldo.com'}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      whatsapp: `https://wa.me/${siteSettings?.contactWhatsapp || '19566069956'}?text=${encodeURIComponent(`${subject}\n\n${body}`)}`,
    });
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
  const contactEmail = siteSettings?.contactEmail || 'operations@multiservicesldo.com';
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
          {navLinks.map(([href, label]) => <Link href={href} key={href}>{label}</Link>)}
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
          {navLinks.map(([href, label], index) => <Link href={href} key={href} onClick={() => setMenuOpen(false)}><span>0{index + 1}</span>{label}<i>↗</i></Link>)}
        </nav>
        <div><Link href="/vacantes" className="primary-button">{t.candidateCta}<span>↗</span></Link><a href="#contacto" className="secondary-button light" onClick={() => chooseAudience('employer')}>{t.employerCta}<span>↗</span></a></div>
      </div>

      <div id="contenido">
        <section className="hero-v3" id="top">
          <div className="hero-grid">
            <div className="hero-copy" data-reveal="up">
              <p className="eyebrow"><span />{t.heroKicker}</p>
              <h1><span>{heroLine1}</span><em>{heroAccent}</em><span>{heroLine2}</span></h1>
              <p className="hero-lead">{heroLead}</p>
              <div className="hero-actions"><a className="primary-button" href="#contacto" onClick={() => chooseAudience('employer')}>{t.employerCta}<span>↗</span></a><Link className="secondary-button" href="/vacantes">{t.candidateCta}<span>↗</span></Link></div>
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
            <div className="section-cta" data-reveal="up"><p>{lang === 'es' ? '¿Tienes una necesidad fuera de esta lista?' : 'Have a need outside this list?'}</p><a href="#contacto" className="secondary-button light" onClick={() => chooseAudience('employer')}>{t.employerCta}<span>↗</span></a></div>
          </div>
        </section>

        <section className="transport-section page-width" id="transporte">
          <div className="transport-gallery" data-reveal="left">
            <figure className="transport-main-photo"><ResponsivePhoto name="transport-main" overrideSrc={siteSettings?.transportImageUrl} sizes="(max-width: 780px) calc(100vw - 32px), 52vw" alt={lang === 'es' ? 'Colaboradores abordando una van de transporte frente a un centro logístico' : 'Employees boarding a shuttle van outside a logistics center'} /><figcaption>01 / {t.transportMainLabel}</figcaption></figure>
            <figure className="transport-arrival-photo"><ResponsivePhoto name="transport-arrival" sizes="(max-width: 780px) calc(100vw - 64px), 26vw" alt={lang === 'es' ? 'Van de transporte llegando puntualmente con colaboradores a un centro logístico' : 'Employee shuttle arriving on time at a logistics center'} /><figcaption>02 / {t.transportArrivalLabel}</figcaption></figure>
            <div className="transport-routes"><small>{t.transportAreas}</small><strong>{t.transportRoutes}</strong></div>
          </div>
          <div className="transport-copy" data-reveal="right"><p className="eyebrow"><span />{t.transportKicker}</p><h2>{t.transportTitle}</h2><p className="transport-accent">{t.transportAccent}</p><p>{t.transportText}</p><ul>{t.transportPoints.map((point) => <li key={point}>{point}</li>)}</ul><a href="#contacto" className="secondary-button" onClick={() => chooseAudience('candidate')}>{t.transportCta}<span>↗</span></a></div>
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
            <div className="job-copy" data-reveal="left"><p className="eyebrow gold"><span />{t.jobKicker}</p><h2>{featuredJob ? (lang === 'es' ? featuredJob.titleEs : featuredJob.titleEn) : t.jobTitle}</h2><p>{featuredJob ? (lang === 'es' ? featuredJob.summaryEs : featuredJob.summaryEn) : t.jobText}</p><div className="tag-row">{featuredJob ? [featuredJob.location, featuredJob.shift, featuredJob.employmentType].map((tag) => <span key={tag}>{tag}</span>) : t.jobTags.map((tag) => <span key={tag}>{tag}</span>)}</div><Link className="primary-button" href={featuredJob ? `/vacantes/${featuredJob.slug}` : '#application-form'} onClick={() => { if (!featuredJob) selectRole(t.roles.findIndex((role) => role === 'Team Lead')); }}>{t.jobCta}<span>↗</span></Link></div>
            <div className="pay-card" data-reveal="right"><small>{lang === 'es' ? 'Compensación' : 'Compensation'}</small><strong>{featuredJob?.payMin ? `$${featuredJob.payMin}` : t.jobPay}</strong><span>{featuredJob?.payMin ? `por ${featuredJob.payUnit}` : t.jobPayUnit}</span><i>/ HR</i></div>
            <div className="role-cloud" data-reveal="up"><div className="role-cloud-heading"><p>{t.rolesTitle}</p><small>{t.rolesNote}</small></div>{t.roles.map((role, index) => <a className={`role-option ${roleChoice === String(index) ? 'selected' : ''}`} href="#application-form" key={role} aria-label={`${lang === 'es' ? 'Aplicar a' : 'Apply for'} ${role}`} aria-current={roleChoice === String(index) ? 'true' : undefined} onClick={() => selectRole(index)}><small>{String(index + 1).padStart(2, '0')}</small><b>{role}</b></a>)}</div>
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
            <div className="contact-intro" data-reveal="left"><p className="eyebrow gold"><span />{t.formKicker}</p><h2>{t.formTitle}</h2><p>{t.formIntro}</p><div className="direct-links"><a href={phoneHref}><small>PHONE</small><b>{contactPhone}</b><span>↗</span></a><a href={`https://wa.me/${contactWhatsapp}`} target="_blank" rel="noreferrer"><small>WHATSAPP</small><b>{contactPhone}</b><span>↗</span></a><a href={`mailto:${contactEmail}`}><small>EMAIL</small><b>{contactEmail}</b><span>↗</span></a></div></div>
            <div className="form-shell" data-reveal="right" id="application-form">
              <div className="form-tabs" role="group" aria-label={lang === 'es' ? 'Tipo de solicitud' : 'Request type'}><button type="button" aria-pressed={audience === 'candidate'} className={audience === 'candidate' ? 'active' : ''} onClick={() => chooseAudience('candidate')}>{t.candidateTab}</button><button type="button" aria-pressed={audience === 'employer'} className={audience === 'employer' ? 'active' : ''} onClick={() => chooseAudience('employer')}>{t.employerTab}</button></div>
              {contactLinks ? <div className="form-success" role="status"><span>✓</span><h3 ref={successHeadingRef} tabIndex={-1}>{contactLinks.reference ? (lang === 'es' ? 'Recibimos tu solicitud.' : 'We received your application.') : t.successTitle}</h3><p>{contactLinks.reference ? (lang === 'es' ? 'Tu información quedó guardada para que el equipo pueda revisarla y contactarte.' : 'Your information was saved so the team can review it and contact you.') : t.successText}</p>{contactLinks.reference ? <><strong className="application-reference">{lang === 'es' ? 'Folio' : 'Reference'}: {contactLinks.reference}</strong><div><Link className="primary-button" href="/vacantes">{lang === 'es' ? 'Ver vacantes' : 'View openings'}<span>↗</span></Link></div></> : <div><a className="primary-button" href={contactLinks.email}>{t.emailCta}<span>↗</span></a><a className="secondary-button light" href={contactLinks.whatsapp} target="_blank" rel="noreferrer">{t.whatsappCta}<span>↗</span></a></div>}<button type="button" onClick={() => { setContactLinks(null); submissionStartedAt.current = Date.now(); submissionKey.current = ''; }}>{t.editCta}</button></div> : <form onSubmit={prepareContact}>
                <div className="field-pair"><label>{t.name}<input name="name" required autoComplete="name" /></label><label>{t.phone}<input name="phone" required type="tel" autoComplete="tel" /></label></div>
                <label>{t.email}<input name="email" required type="email" autoComplete="email" /></label>
                {audience === 'candidate' ? <><label>{t.role}<select value={roleChoice} required onChange={(event) => setRoleChoice(event.target.value)}><option value="" disabled>{t.rolePrompt}</option>{t.roles.map((role, index) => <option value={String(index)} key={role}>{role}</option>)}<option value="other">{t.roleOther}</option></select></label>{roleChoice === 'other' ? <label>{t.roleOtherLabel}<input name="role" required /></label> : <input type="hidden" name="role" value={roleChoice ? t.roles[Number(roleChoice)] : ''} />}<small className="role-choice-note">{t.roleHelp}</small></> : <><label>{t.company}<input name="company" required autoComplete="organization" /></label><label>{t.need}<textarea name="need" rows={4} required /></label></>}
                <label>{t.message}<textarea name="message" rows={3} /></label>
                {audience === 'candidate' && <><label>{lang === 'es' ? 'Currículum (opcional)' : 'Résumé (optional)'}<input name="resume" type="file" accept="application/pdf,.pdf" /></label><label className="homepage-consent"><input name="consent" type="checkbox" value="yes" required /><span>{lang === 'es' ? 'Autorizo el uso de mis datos para evaluar esta solicitud y contactarme.' : 'I authorize the use of my information to evaluate this application and contact me.'}</span></label><input className="application-honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" /><small className="candidate-note">{t.candidateNote}</small></>}
                {submissionError && <p className="homepage-form-error" role="alert">{submissionError}</p>}
                <button className="primary-button form-submit" type="submit" disabled={submitting}>{submitting ? (lang === 'es' ? 'Enviando…' : 'Submitting…') : audience === 'candidate' ? (lang === 'es' ? 'Enviar solicitud' : 'Submit application') : t.submit}<span>{submitting ? '…' : '↗'}</span></button><small className="privacy-note">{audience === 'candidate' ? t.privacy : (lang === 'es' ? 'Nada se envía hasta que elijas correo o WhatsApp.' : 'Nothing is sent until you choose email or WhatsApp.')}</small>
              </form>}
            </div>
          </div>
        </section>
      </div>

      <footer>
        <div className="page-width footer-grid"><div className="footer-brand"><img src="/logo-optimized.webp" width="80" height="82" alt="Multiservices Laredo" /><h2>{t.footerLine1}<em>{t.footerLine2}</em></h2></div><div><b>{t.footerContact}</b><a href={phoneHref}>{contactPhone}</a><a href={`https://wa.me/${contactWhatsapp}`} target="_blank" rel="noreferrer">WhatsApp ↗</a><a href={`mailto:${contactEmail}`}>{contactEmail}</a></div><div><b>{t.footerVisit}</b><a href="https://maps.google.com/?q=1316+Zaragoza+St+Laredo+TX+78040" target="_blank" rel="noreferrer">1316 Zaragoza St.<br />Laredo, TX 78040 ↗</a></div><div><b>{t.footerSocial}</b><a href="https://www.instagram.com/multiservicesldo" target="_blank" rel="noreferrer">Instagram ↗</a><Link href="/portal">{lang === 'es' ? 'Portal de propietarios' : 'Owner portal'} ↗</Link></div></div>
        <div className="page-width footer-bottom"><span>© 2026 Multiservices Laredo LLC</span><span>STAFFING / RECRUITMENT / TALENT SOLUTIONS</span><a href="#top">TOP ↑</a></div>
      </footer>
    </main>
  );
}
