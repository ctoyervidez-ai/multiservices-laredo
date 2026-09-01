"use client";

import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ApplicationForm } from "@/components/application-form";

const serviceAssetIds = [
  "service-labeling",
  "service-crew",
  "service-yard-mule",
  "service-warehouse",
] as const;

const translations = {
  es: {
    skip: "Saltar al contenido",
    utility: {
      line: "Staffing bilingüe · Soluciones operativas",
      address: "1316 Zaragoza St. · Laredo, TX",
      phone: "+1 (956) 441-1292",
    },
    nav: {
      services: "Servicios",
      process: "Proceso",
      jobs: "Vacantes",
      contact: "Contacto",
      cta: "Empezar ahora",
    },
    hero: {
      eyebrow: "Laredo, Texas · Respuesta local",
      titleTop: "Multiservices",
      titleBottom: "Laredo",
      tagline: "Más que empleos. Creamos oportunidades.",
      body: "Conectamos operaciones con personas listas para llegar, integrarse y crecer.",
      employer: "Necesito personal",
      candidate: "Busco empleo",
      imageAlt: "Dos integrantes de un equipo revisando una operación dentro de una bodega",
      imageLabel: "Staffing y soporte operativo en Laredo",
    },
    statement: {
      kicker: "Más que cubrir una vacante",
      title: "Detrás de una operación eficiente, siempre hay un buen equipo.",
      body: "Nosotros te ayudamos a construirlo.",
      strengths: [
        ["01", "Talento preparado", "Personas listas para integrarse desde el primer día."],
        ["02", "Respuesta rápida", "Entendemos la urgencia de tu operación y actuamos rápido."],
        ["03", "Seguimiento continuo", "Acompañamiento constante para asegurar resultados."],
        ["04", "Conocimiento local", "Entendemos Laredo y las necesidades de cada negocio."],
      ],
    },
    services: {
      kicker: "Nuestros servicios",
      title: "Soporte real para cada parte de la operación.",
      body: "Cada servicio se presenta con una imagen distinta, una descripción clara y un alcance específico.",
      cta: "Solicitar este servicio",
      previous: "Servicio anterior",
      next: "Siguiente servicio",
      slide: "Servicio",
      items: [
        {
          number: "01",
          title: "Etiquetado NOM-050",
          text: "Aplicación precisa de etiquetas para productos destinados al mercado mexicano.",
          detail: "Personal capacitado · control visual · trabajo por proyecto",
          alt: "Proceso de etiquetado industrial de productos",
        },
        {
          number: "02",
          title: "Cuadrillas operativas",
          text: "Mano de obra confiable para retrabajos, inventarios, clasificación, carga y descarga.",
          detail: "Equipos por turno · supervisión · respuesta rápida",
          alt: "Integrante de una cuadrilla realizando trabajo de almacén",
        },
        {
          number: "03",
          title: "Renta de mulas",
          text: "Unidades y soporte para el movimiento de remolques y equipo dentro de patio.",
          detail: "Disponibilidad por proyecto · coordinación local · soporte operativo",
          alt: "Unidad de patio para movimiento de remolques",
        },
        {
          number: "04",
          title: "Carga, descarga e inventarios",
          text: "Personal para apoyar el flujo de mercancía, el conteo y la organización de almacén.",
          detail: "Almacén · distribución · manufactura",
          alt: "Mercancía organizada dentro de una operación de almacén",
        },
      ],
    },
    transport: {
      kicker: "Soporte que sale de la oficina",
      title: "¿No puedes transportarte hacia tu trabajo?",
      accent: "En Multiservices Laredo ofrecemos servicio de transporte.",
      body: "Brindamos transporte seguro y confiable para colaboradores en proyectos y posiciones seleccionadas.",
      bullets: [
        "Transporte desde puntos estratégicos",
        "Viajes seguros y puntuales",
        "Cobertura en Killam, Minas y Milla 13",
      ],
      note: "La disponibilidad depende del puesto, turno, cliente y proyecto.",
      cta: "Consultar disponibilidad",
      areas: "Áreas disponibles",
      areaNames: "Killam · Minas · Milla 13",
      imageAlt: "Colaboradores abordando una camioneta de transporte frente a una bodega",
    },
    process: {
      kicker: "Nuestro proceso",
      title: "El trabajo comienza antes de enviar un candidato.",
      body: "Conocemos la necesidad, evaluamos el perfil y damos seguimiento después de la colocación.",
      steps: ["Conocemos tu necesidad", "Reclutamos", "Evaluamos", "Conectamos", "Damos seguimiento"],
    },
    talent: {
      kicker: "Talento para cada operación",
      title: "Desde el piso operativo hasta el liderazgo.",
      body: "Oportunidades y soluciones de personal para distintas áreas de trabajo.",
      categories: [
        { title: "Administrativo", items: ["Customer service", "Traffic clerks", "Asistentes administrativos", "Recepción", "Contabilidad"] },
        { title: "Operativo", items: ["Warehouse associates", "Montacarguistas", "Material handlers", "General labor", "Producción"] },
        { title: "Liderazgo y calidad", items: ["Managers", "Supervisores", "Coordinadores", "Quality leads", "Safety coordinators"] },
      ],
      candidateCta: "Aplicar a vacantes",
      employerCta: "Solicitar personal",
    },
    contact: {
      kicker: "Dos rutas claras",
      title: "Conecta directamente con el equipo correcto.",
      body: "Cada botón lleva a una acción diferente: solicitar personal o aplicar a oportunidades.",
      employerTitle: "Para empresas",
      employerText: "Cuéntanos qué posición, proyecto o servicio necesitas coordinar.",
      employerCta: "Hablar por WhatsApp",
      employerEmail: "Correo de operaciones",
      candidateTitle: "Para candidatos",
      candidateText: "Completa la solicitud en línea para que podamos considerar tu perfil.",
      candidateCta: "Aplicar en línea",
      candidateEmail: "Enviar CV por correo",
      office: "Oficina en Laredo",
      follow: "Instagram",
      followFacebook: "Facebook",
    },
    footer: "Staffing · Workforce solutions · Operational support",
    mobileEmployer: "Solicitar personal",
    mobileCandidate: "Buscar empleo",
  },
  en: {
    skip: "Skip to content",
    utility: {
      line: "Bilingual staffing · Operational solutions",
      address: "1316 Zaragoza St. · Laredo, TX",
      phone: "+1 (956) 441-1292",
    },
    nav: {
      services: "Services",
      process: "Process",
      jobs: "Jobs",
      contact: "Contact",
      cta: "Get started",
    },
    hero: {
      eyebrow: "Laredo, Texas · Local response",
      titleTop: "Multiservices",
      titleBottom: "Laredo",
      tagline: "More than jobs. We create opportunities.",
      body: "We connect operations with people who are ready to show up, integrate, and grow.",
      employer: "I need staff",
      candidate: "Find work",
      imageAlt: "Two team members reviewing a warehouse operation",
      imageLabel: "Staffing and operational support in Laredo",
    },
    statement: {
      kicker: "More than filling a vacancy",
      title: "Behind every efficient operation is a strong team.",
      body: "We help you build it.",
      strengths: [
        ["01", "Prepared talent", "People ready to integrate from day one."],
        ["02", "Fast response", "We understand operational urgency and move quickly."],
        ["03", "Consistent follow-up", "Ongoing support focused on reliable results."],
        ["04", "Local knowledge", "We understand Laredo and the needs of local businesses."],
      ],
    },
    services: {
      kicker: "Our services",
      title: "Practical support for every part of the operation.",
      body: "Every service includes a distinct image, a clear description, and a specific scope.",
      cta: "Request this service",
      previous: "Previous service",
      next: "Next service",
      slide: "Service",
      items: [
        {
          number: "01",
          title: "NOM-050 labeling",
          text: "Accurate label application for products entering the Mexican market.",
          detail: "Trained staff · visual control · project-based work",
          alt: "Industrial product labeling process",
        },
        {
          number: "02",
          title: "Operational crews",
          text: "Reliable labor for rework, inventory, sorting, loading, and unloading.",
          detail: "Shift teams · supervision · fast response",
          alt: "Crew member working inside a warehouse",
        },
        {
          number: "03",
          title: "Yard mule rental",
          text: "Units and support for moving trailers and equipment inside the yard.",
          detail: "Project availability · local coordination · operational support",
          alt: "Yard unit used to move trailers",
        },
        {
          number: "04",
          title: "Loading, unloading, and inventory",
          text: "People who support product flow, counting, and warehouse organization.",
          detail: "Warehousing · distribution · manufacturing",
          alt: "Organized freight inside a warehouse operation",
        },
      ],
    },
    transport: {
      kicker: "Support beyond the office",
      title: "Need transportation to work?",
      accent: "Multiservices Laredo offers transportation service.",
      body: "We provide safe, dependable transportation for team members in selected projects and positions.",
      bullets: [
        "Transportation from strategic pickup points",
        "Safe and punctual trips",
        "Coverage in Killam, Minas, and Milla 13",
      ],
      note: "Availability depends on role, shift, client, and project.",
      cta: "Check availability",
      areas: "Available areas",
      areaNames: "Killam · Minas · Milla 13",
      imageAlt: "Team members boarding a transportation van outside a warehouse",
    },
    process: {
      kicker: "Our process",
      title: "The work begins before we send a candidate.",
      body: "We understand the need, evaluate the profile, and follow up after placement.",
      steps: ["Understand your need", "Recruit", "Evaluate", "Connect", "Follow up"],
    },
    talent: {
      kicker: "Talent for every operation",
      title: "From the floor to leadership.",
      body: "Job opportunities and staffing solutions across multiple work areas.",
      categories: [
        { title: "Administrative", items: ["Customer service", "Traffic clerks", "Administrative assistants", "Reception", "Accounting"] },
        { title: "Operations", items: ["Warehouse associates", "Forklift operators", "Material handlers", "General labor", "Production"] },
        { title: "Leadership and quality", items: ["Managers", "Supervisors", "Coordinators", "Quality leads", "Safety coordinators"] },
      ],
      candidateCta: "Apply for jobs",
      employerCta: "Request staff",
    },
    contact: {
      kicker: "Two clear paths",
      title: "Connect with the right team directly.",
      body: "Each button has a distinct action: request staff or apply for opportunities.",
      employerTitle: "For employers",
      employerText: "Tell us which role, project, or service you need to coordinate.",
      employerCta: "Talk on WhatsApp",
      employerEmail: "Operations email",
      candidateTitle: "For candidates",
      candidateText: "Complete the online application so we can consider your profile.",
      candidateCta: "Apply online",
      candidateEmail: "Email your résumé",
      office: "Laredo office",
      follow: "Instagram",
      followFacebook: "Facebook",
    },
    footer: "Staffing · Workforce solutions · Operational support",
    mobileEmployer: "Request staff",
    mobileCandidate: "Find work",
  },
} as const;

type Language = keyof typeof translations;

const employerWhatsApp = "https://wa.me/19566069956?text=Hola%20Multiservices%20Laredo%2C%20necesito%20informaci%C3%B3n%20sobre%20soluciones%20de%20staffing.";
const transportWhatsApp = "https://wa.me/19566069956?text=Hola%20Multiservices%20Laredo%2C%20quiero%20consultar%20la%20disponibilidad%20del%20servicio%20de%20transporte.";
const candidateEmail = "mailto:vacantes@multiservicesldo.com?subject=Solicitud%20de%20empleo%20-%20Multiservices%20Laredo";
const operationsEmail = "mailto:operations@multiservicesldo.com?subject=Solicitud%20de%20servicio%20-%20Multiservices%20Laredo";
const mapsUrl = "https://www.google.com/maps/search/?api=1&query=1316+Zaragoza+St+Laredo+TX+78040";

function VisualAsset({ id, alt, className = "" }: { id: string; alt: string; className?: string }) {
  return (
    <svg className={`visual-asset ${className}`} role="img" aria-label={alt} preserveAspectRatio="xMidYMid slice">
      <use href={`/images/site-assets.svg#${id}`} width="100%" height="100%" />
    </svg>
  );
}

function ArrowLink({
  href,
  children,
  className = "",
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
}) {
  return (
    <a
      className={`arrow-link ${className}`}
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
    >
      <span>{children}</span>
      <ArrowUpRight aria-hidden="true" size={18} strokeWidth={1.8} />
    </a>
  );
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("es");
  const [activeService, setActiveService] = useState(0);
  const t = translations[language];
  const currentService = t.services.items[activeService];

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return undefined;

    const interval = window.setInterval(() => {
      setActiveService((current) => (current + 1) % serviceAssetIds.length);
    }, 5600);

    return () => window.clearInterval(interval);
  }, []);

  function changeService(direction: number) {
    setActiveService((current) => (current + direction + serviceAssetIds.length) % serviceAssetIds.length);
  }

  return (
    <>
      <a className="skip-link" href="#main-content">{t.skip}</a>

      <div className="utility-bar" aria-label="Business information">
        <span>{t.utility.line}</span>
        <span>{t.utility.address}</span>
        <a href="tel:+19564411292"><Phone aria-hidden="true" size={13} />{t.utility.phone}</a>
      </div>

      <header className="site-header">
        <a className="brand-lockup" href="#top" aria-label="Multiservices Laredo - Inicio">
          <Image className="brand-logo" src="/images/multiservices-logo.png" alt="" width={76} height={76} priority />
          <span><strong>Multiservices</strong><small>Laredo</small></span>
        </a>

        <nav className="desktop-nav" aria-label="Principal">
          <a href="#servicios">{t.nav.services}</a>
          <a href="#proceso">{t.nav.process}</a>
          <a href="#solicitud">{t.nav.jobs}</a>
          <a href="#contacto">{t.nav.contact}</a>
        </nav>

        <div className="header-actions">
          <div className="language-switcher" aria-label="Language / Idioma">
            {(["es", "en"] as const).map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={language === item}
                onClick={() => setLanguage(item)}
              >
                {item.toUpperCase()}
              </button>
            ))}
          </div>
          <a className="header-cta" href={employerWhatsApp} target="_blank" rel="noreferrer">
            {t.nav.cta}<ArrowRight aria-hidden="true" size={17} />
          </a>
        </div>
      </header>

      <main id="main-content">
        <section className="hero" id="top">
          <div className="hero-copy">
            <p className="eyebrow">{t.hero.eyebrow}</p>
            <h1><span>{t.hero.titleTop}</span><em>{t.hero.titleBottom}</em></h1>
            <p className="hero-tagline">{t.hero.tagline}</p>
            <p className="hero-body">{t.hero.body}</p>
            <div className="hero-actions">
              <a className="button button-gold" href={employerWhatsApp} target="_blank" rel="noreferrer">
                {t.hero.employer}<ArrowRight aria-hidden="true" size={18} />
              </a>
              <a className="button button-outline" href="#solicitud">{t.hero.candidate}<ArrowRight aria-hidden="true" size={18} /></a>
            </div>
          </div>

          <div className="hero-visual">
            <VisualAsset id="warehouse-team" alt={t.hero.imageAlt} />
            <div className="hero-image-label"><MapPin aria-hidden="true" size={16} />{t.hero.imageLabel}</div>
          </div>
        </section>

        <section className="statement-section" aria-labelledby="statement-title">
          <div className="statement-copy">
            <p className="eyebrow">{t.statement.kicker}</p>
            <h2 id="statement-title">{t.statement.title}</h2>
            <p>{t.statement.body}</p>
          </div>
          <div className="strength-grid">
            {t.statement.strengths.map(([number, title, body]) => (
              <article key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="services-showcase" id="servicios" aria-labelledby="services-title">
          <header className="section-intro services-intro">
            <div>
              <p className="eyebrow">{t.services.kicker}</p>
              <h2 id="services-title">{t.services.title}</h2>
            </div>
            <p>{t.services.body}</p>
          </header>

          <div className="service-stage">
            <div className="service-feature" role="tabpanel" aria-live="polite">
              <div className="service-feature-image" key={serviceAssetIds[activeService]}>
                <VisualAsset
                  id={serviceAssetIds[activeService]}
                  alt={currentService.alt}
                />
              </div>
              <div className="service-feature-copy">
                <span>{currentService.number}</span>
                <h3>{currentService.title}</h3>
                <p>{currentService.text}</p>
                <small>{currentService.detail}</small>
                <ArrowLink href={employerWhatsApp} external>{t.services.cta}</ArrowLink>
              </div>
            </div>

            <div className="service-selector" role="tablist" aria-label={t.services.kicker}>
              {t.services.items.map((service, index) => (
                <button
                  key={service.number}
                  type="button"
                  role="tab"
                  aria-selected={activeService === index}
                  onClick={() => setActiveService(index)}
                >
                  <span>{service.number}</span>
                  <strong>{service.title}</strong>
                  <ArrowRight aria-hidden="true" size={17} />
                </button>
              ))}
              <div className="service-controls">
                <button type="button" onClick={() => changeService(-1)} aria-label={t.services.previous}>
                  <ChevronLeft aria-hidden="true" size={20} />
                </button>
                <span>{String(activeService + 1).padStart(2, "0")} / {String(serviceAssetIds.length).padStart(2, "0")}</span>
                <button type="button" onClick={() => changeService(1)} aria-label={t.services.next}>
                  <ChevronRight aria-hidden="true" size={20} />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="transport-section" aria-labelledby="transport-title">
          <div className="transport-copy">
            <p className="eyebrow">{t.transport.kicker}</p>
            <h2 id="transport-title">{t.transport.title}</h2>
            <p className="transport-accent">{t.transport.accent}</p>
            <p className="transport-body">{t.transport.body}</p>
            <ul>
              {t.transport.bullets.map((bullet) => <li key={bullet}><Check aria-hidden="true" size={17} />{bullet}</li>)}
            </ul>
            <p className="transport-note">{t.transport.note}</p>
            <a className="button button-gold" href={transportWhatsApp} target="_blank" rel="noreferrer">
              {t.transport.cta}<ArrowRight aria-hidden="true" size={18} />
            </a>
          </div>

          <div className="transport-visual">
            <VisualAsset id="transport-van" alt={t.transport.imageAlt} />
            <div className="transport-areas">
              <MapPin aria-hidden="true" size={25} />
              <span><small>{t.transport.areas}</small><strong>{t.transport.areaNames}</strong></span>
            </div>
          </div>
        </section>

        <section className="process-section" id="proceso">
          <div className="process-intro">
            <p className="eyebrow eyebrow-gold">{t.process.kicker}</p>
            <h2>{t.process.title}</h2>
            <p>{t.process.body}</p>
          </div>
          <ol className="process-steps">
            {t.process.steps.map((step, index) => (
              <li key={step}><span>0{index + 1}</span><p>{step}</p></li>
            ))}
          </ol>
        </section>

        <section className="talent-section" id="talento">
          <header className="section-intro talent-heading">
            <div><p className="eyebrow">{t.talent.kicker}</p><h2>{t.talent.title}</h2></div>
            <p>{t.talent.body}</p>
          </header>
          <div className="talent-categories">
            {t.talent.categories.map((category, index) => (
              <article key={category.title}>
                <span>0{index + 1}</span>
                <h3>{category.title}</h3>
                <ul>{category.items.map((item) => <li key={item}>{item}</li>)}</ul>
              </article>
            ))}
          </div>
          <div className="talent-actions">
            <a className="button button-gold" href="#solicitud">{t.talent.candidateCta}<ArrowRight aria-hidden="true" size={18} /></a>
            <a className="button button-outline" href={employerWhatsApp} target="_blank" rel="noreferrer">{t.talent.employerCta}<ArrowRight aria-hidden="true" size={18} /></a>
          </div>
        </section>

        <ApplicationForm language={language} />

        <section className="contact-section" id="contacto">
          <header>
            <p className="eyebrow eyebrow-gold">{t.contact.kicker}</p>
            <h2>{t.contact.title}</h2>
            <p>{t.contact.body}</p>
          </header>

          <div className="contact-paths">
            <article>
              <span>01</span>
              <h3>{t.contact.employerTitle}</h3>
              <p>{t.contact.employerText}</p>
              <a className="contact-primary" href={employerWhatsApp} target="_blank" rel="noreferrer">
                <MessageCircle aria-hidden="true" size={20} />{t.contact.employerCta}
              </a>
              <a className="contact-secondary" href={operationsEmail}><Mail aria-hidden="true" size={17} />{t.contact.employerEmail}</a>
            </article>
            <article>
              <span>02</span>
              <h3>{t.contact.candidateTitle}</h3>
              <p>{t.contact.candidateText}</p>
              <a className="contact-primary" href="#solicitud"><ArrowRight aria-hidden="true" size={20} />{t.contact.candidateCta}</a>
              <a className="contact-secondary" href={candidateEmail}><Mail aria-hidden="true" size={17} />{t.contact.candidateEmail}</a>
            </article>
          </div>

          <div className="contact-details">
            <a href={mapsUrl} target="_blank" rel="noreferrer">
              <MapPin aria-hidden="true" size={18} /><span><small>{t.contact.office}</small>1316 Zaragoza St, Laredo, TX 78040</span>
            </a>
            <a href="tel:+19564411292">
              <Phone aria-hidden="true" size={18} /><span><small>Phone</small>+1 (956) 441-1292</span>
            </a>
            <a href="https://www.instagram.com/multiservicesldo/" target="_blank" rel="noreferrer">
              <ArrowUpRight aria-hidden="true" size={18} /><span><small>{t.contact.follow}</small>@multiservicesldo</span>
            </a>
            <a href="https://www.facebook.com/people/Multiservices-Laredo/61557726029987/" target="_blank" rel="noreferrer">
              <ArrowUpRight aria-hidden="true" size={18} /><span><small>{t.contact.followFacebook}</small>Multiservices Laredo</span>
            </a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand">
          <Image src="/images/multiservices-logo.png" alt="" width={72} height={72} />
          <div><strong>Multiservices Laredo LLC</strong><span>{t.footer}</span></div>
        </div>
        <p>© {new Date().getFullYear()} Multiservices Laredo LLC</p>
      </footer>

      <div className="mobile-actionbar" aria-label="Quick actions">
        <a href="#solicitud">{t.mobileCandidate}</a>
        <a href={employerWhatsApp} target="_blank" rel="noreferrer">{t.mobileEmployer}</a>
      </div>
    </>
  );
}
