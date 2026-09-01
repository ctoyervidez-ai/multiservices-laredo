"use client";

import Image from "next/image";
import { ArrowRight, ArrowUpRight, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { ApplicationForm } from "@/components/application-form";

const translations = {
  es: {
    skip: "Saltar al contenido",
    nav: { services: "Servicios", process: "Proceso", talent: "Talento", contact: "Contacto", cta: "Solicitar personal" },
    hero: {
      eyebrow: "Laredo, Texas · Staffing y soporte operativo",
      titleTop: "Talento que llega.",
      titleBottom: "Operaciones que avanzan.",
      body: "Conectamos empresas con personal preparado y coordinamos servicios que responden al ritmo real de cada operación.",
      employer: "Solicitar personal",
      candidate: "Buscar empleo",
      call: "Llamar al 956 441 1292",
      location: "1316 Zaragoza St · Laredo, TX",
      imageAlt: "Señalización exterior de Multiservices Laredo en su oficina de Zaragoza Street",
      modes: ["Temporal y por proyecto", "Temp-to-hire", "Contratación directa"],
    },
    sectorsLabel: "Experiencia en",
    sectors: ["Logística", "Manufactura", "Warehousing", "Distribución", "Administración", "Restaurantes"],
    intro: {
      kicker: "Más que staffing",
      title: "Una extensión de su equipo, cerca de su operación.",
      body: "Multiservices Laredo combina reclutamiento, fuerza laboral y soporte operativo para ayudar a empresas que trabajan en ambientes dinámicos y de alta demanda.",
      note: "Cada cliente. Cada posición. Cada proyecto recibe nuestro compromiso.",
      strengths: [
        ["01", "Atención personalizada", "Conocemos la operación antes de proponer una solución."],
        ["02", "Respuesta eficiente", "Entendemos el impacto que puede tener una posición sin cubrir."],
        ["03", "Comunicación constante", "Mantenemos seguimiento con clientes y colaboradores."],
        ["04", "Flexibilidad", "Nos adaptamos a temporadas, proyectos y cambios de producción."],
      ],
    },
    services: {
      kicker: "Soluciones integrales",
      title: "Una respuesta para cada parte de la operación.",
      body: "Staffing es el punto de partida. El resto de nuestros servicios amplía la capacidad de respuesta cuando una operación necesita algo más.",
      groups: [
        {
          number: "01",
          title: "Talento y staffing",
          text: "Reclutamos, evaluamos y conectamos personal para posiciones administrativas, operativas y de liderazgo.",
          items: ["Reclutamiento y selección", "Personal temporal o por proyecto", "Temp-to-hire", "Contratación directa"],
        },
        {
          number: "02",
          title: "Soporte operativo",
          text: "Cuadrillas y recursos que se integran a necesidades puntuales de almacén, patio, calidad y producción.",
          items: ["Inventarios y clasificación de calidad", "Retrabajos, carga y descarga", "Renta y reparación de equipo de patio", "Etiquetado NOM-050"],
        },
        {
          number: "03",
          title: "Servicios especializados",
          text: "Acompañamiento organizado para trámites migratorios y coordinación profesional de eventos empresariales.",
          items: ["Preparación y gestión de trámites migratorios", "Visas de trabajo, SENTRI y cambios de empleador", "Organización y montaje de eventos", "Inauguraciones, capacitaciones y reuniones"],
        },
      ],
      immigrationNote: "Cada trámite y cada proyecto es diferente. Contáctenos para conocer el alcance y disponibilidad del servicio.",
    },
    process: {
      kicker: "Nuestro proceso",
      title: "El trabajo comienza antes de enviar un candidato.",
      body: "Primero buscamos comprender la empresa, el ambiente laboral y las características necesarias para cada posición. Después acompañamos la colocación.",
      steps: ["Conocemos su necesidad", "Reclutamos", "Evaluamos", "Conectamos", "Damos seguimiento"],
    },
    talent: {
      kicker: "Talento para cada operación",
      title: "Desde el piso operativo hasta el liderazgo.",
      body: "Conectamos empresas con candidatos preparados para distintas áreas de trabajo.",
      categories: [
        { title: "Administrativo", items: ["Customer service", "Traffic clerks", "Asistentes administrativos", "Recepción", "Contabilidad"] },
        { title: "Operativo", items: ["Warehouse associates", "Montacarguistas", "Material handlers", "General labor", "Producción"] },
        { title: "Liderazgo y calidad", items: ["Managers", "Supervisores", "Coordinadores", "Quality leads", "Safety coordinators"] },
      ],
      transportTitle: "Transporte disponible para proyectos seleccionados",
      transportText: "La disponibilidad depende de la ubicación, el puesto, el cliente y las necesidades de la operación.",
      candidateCta: "Enviar información",
      employerCta: "Necesito personal",
    },
    local: {
      kicker: "Conocimiento local",
      title: "Cerca cuando la operación lo necesita.",
      body: "Trabajamos desde Laredo con un equipo bilingüe y una visión práctica de los retos de logística, manufactura, almacén, administración y servicio.",
      imageAlt: "Oficina de Multiservices Laredo en Zaragoza Street",
      points: ["Equipo bilingüe", "Seguimiento continuo", "Soluciones flexibles", "Atención personalizada"],
      address: "Visitar la oficina",
    },
    contact: {
      kicker: "Construyamos grandes equipos",
      title: "Hablemos de su próxima necesidad.",
      body: "Elija la ruta correcta y conecte directamente con nuestro equipo.",
      employerTitle: "Para empresas",
      employerText: "Cuéntenos qué posición, proyecto o servicio necesita coordinar.",
      employerCta: "Hablar por WhatsApp",
      employerEmail: "Correo de operaciones",
      candidateTitle: "Para candidatos",
      candidateText: "Complete la solicitud en línea o envíe su currículum para conocer oportunidades disponibles.",
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
    nav: { services: "Services", process: "Process", talent: "Talent", contact: "Contact", cta: "Request staff" },
    hero: {
      eyebrow: "Laredo, Texas · Staffing and operational support",
      titleTop: "Talent that shows up.",
      titleBottom: "Operations that move.",
      body: "We connect companies with prepared people and coordinate services that respond to the real pace of every operation.",
      employer: "Request staff",
      candidate: "Find work",
      call: "Call 956 441 1292",
      location: "1316 Zaragoza St · Laredo, TX",
      imageAlt: "Multiservices Laredo exterior signage at the Zaragoza Street office",
      modes: ["Temporary and project", "Temp-to-hire", "Direct hire"],
    },
    sectorsLabel: "Experience across",
    sectors: ["Logistics", "Manufacturing", "Warehousing", "Distribution", "Administration", "Restaurants"],
    intro: {
      kicker: "More than staffing",
      title: "An extension of your team, close to your operation.",
      body: "Multiservices Laredo combines recruiting, workforce solutions, and operational support for companies working in dynamic, high-demand environments.",
      note: "Every client. Every position. Every project receives our commitment.",
      strengths: [
        ["01", "Personal attention", "We learn the operation before proposing a solution."],
        ["02", "Efficient response", "We understand the impact of an open position."],
        ["03", "Consistent communication", "We follow up with clients and team members."],
        ["04", "Flexibility", "We adapt to seasons, projects, and production changes."],
      ],
    },
    services: {
      kicker: "Integrated solutions",
      title: "A response for every part of the operation.",
      body: "Staffing is the starting point. Our additional services expand your ability to respond when an operation needs more.",
      groups: [
        {
          number: "01",
          title: "Talent and staffing",
          text: "We recruit, evaluate, and connect people for administrative, operational, and leadership roles.",
          items: ["Recruiting and selection", "Temporary or project staffing", "Temp-to-hire", "Direct hire"],
        },
        {
          number: "02",
          title: "Operational support",
          text: "Crews and resources that integrate into specific warehouse, yard, quality, and production needs.",
          items: ["Inventory and quality sorting", "Rework, loading, and unloading", "Yard equipment rental and repair", "NOM-050 labeling"],
        },
        {
          number: "03",
          title: "Specialized services",
          text: "Organized support for immigration paperwork and professional coordination of business events.",
          items: ["Immigration paperwork preparation and management", "Work visas, SENTRI, and employer changes", "Event planning and setup", "Openings, training, and meetings"],
        },
      ],
      immigrationNote: "Every filing and project is different. Contact us to confirm the scope and availability of the service.",
    },
    process: {
      kicker: "Our process",
      title: "The work begins before we send a candidate.",
      body: "We first seek to understand the company, its work environment, and the qualities each position requires. Then we stay involved after placement.",
      steps: ["Understand your need", "Recruit", "Evaluate", "Connect", "Follow up"],
    },
    talent: {
      kicker: "Talent for every operation",
      title: "From the floor to leadership.",
      body: "We connect companies with candidates prepared for different areas of work.",
      categories: [
        { title: "Administrative", items: ["Customer service", "Traffic clerks", "Administrative assistants", "Reception", "Accounting"] },
        { title: "Operations", items: ["Warehouse associates", "Forklift operators", "Material handlers", "General labor", "Production"] },
        { title: "Leadership and quality", items: ["Managers", "Supervisors", "Coordinators", "Quality leads", "Safety coordinators"] },
      ],
      transportTitle: "Transportation available for selected projects",
      transportText: "Availability depends on location, position, client, and the needs of the operation.",
      candidateCta: "Send your information",
      employerCta: "I need staff",
    },
    local: {
      kicker: "Local knowledge",
      title: "Close when the operation needs us.",
      body: "We work from Laredo with a bilingual team and a practical understanding of logistics, manufacturing, warehousing, administration, and service challenges.",
      imageAlt: "Multiservices Laredo office on Zaragoza Street",
      points: ["Bilingual team", "Consistent follow-up", "Flexible solutions", "Personal attention"],
      address: "Visit the office",
    },
    contact: {
      kicker: "Let's build great teams",
      title: "Tell us what your operation needs next.",
      body: "Choose the right path and connect directly with our team.",
      employerTitle: "For employers",
      employerText: "Tell us which position, project, or service you need to coordinate.",
      employerCta: "Talk on WhatsApp",
      employerEmail: "Operations email",
      candidateTitle: "For candidates",
      candidateText: "Complete the online application or email your résumé to learn about available opportunities.",
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
const candidateEmail = "mailto:vacantes@multiservicesldo.com?subject=Solicitud%20de%20empleo%20-%20Multiservices%20Laredo";
const operationsEmail = "mailto:operations@multiservicesldo.com?subject=Solicitud%20de%20servicio%20-%20Multiservices%20Laredo";
const mapsUrl = "https://www.google.com/maps/search/?api=1&query=1316+Zaragoza+St+Laredo+TX+78040";

function ArrowLink({ href, children, className = "", external = false }: { href: string; children: React.ReactNode; className?: string; external?: boolean }) {
  return (
    <a className={`arrow-link ${className}`} href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
      <span>{children}</span>
      <ArrowUpRight aria-hidden="true" size={18} strokeWidth={1.8} />
    </a>
  );
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("es");
  const t = translations[language];

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <>
      <a className="skip-link" href="#main-content">{t.skip}</a>

      <header className="site-header">
        <a className="brand-lockup" href="#top" aria-label="Multiservices Laredo - Inicio">
          <Image className="brand-logo" src="/images/multiservices-logo.png" alt="" width={52} height={52} priority />
          <span><strong>Multiservices</strong><small>Laredo</small></span>
        </a>
        <nav className="desktop-nav" aria-label="Principal">
          <a href="#servicios">{t.nav.services}</a>
          <a href="#proceso">{t.nav.process}</a>
          <a href="#talento">{t.nav.talent}</a>
          <a href="#contacto">{t.nav.contact}</a>
        </nav>
        <div className="header-actions">
          <div className="language-switcher" aria-label="Language / Idioma">
            {(["es", "en"] as const).map((item) => (
              <button key={item} type="button" aria-pressed={language === item} onClick={() => setLanguage(item)}>{item.toUpperCase()}</button>
            ))}
          </div>
          <a className="header-cta" href={employerWhatsApp} target="_blank" rel="noreferrer">{t.nav.cta}<ArrowUpRight aria-hidden="true" size={16} /></a>
        </div>
      </header>

      <main id="main-content">
        <section className="hero" id="top">
          <div className="hero-copy">
            <p className="eyebrow hero-eyebrow">{t.hero.eyebrow}</p>
            <h1><span>{t.hero.titleTop}</span><em>{t.hero.titleBottom}</em></h1>
            <p className="hero-body">{t.hero.body}</p>
            <div className="hero-actions">
              <a className="button button-gold" href={employerWhatsApp} target="_blank" rel="noreferrer">{t.hero.employer}<ArrowRight aria-hidden="true" size={18} /></a>
              <a className="button button-outline-light" href="#solicitud">{t.hero.candidate}</a>
            </div>
            <a className="hero-phone" href="tel:+19564411292"><Phone aria-hidden="true" size={15} />{t.hero.call}</a>
          </div>

          <div className="hero-visual">
            <div className="hero-image-frame">
              <Image src="/images/multiservices-sign.webp" alt={t.hero.imageAlt} fill sizes="(max-width: 760px) 100vw, 42vw" priority />
              <div className="hero-location"><MapPin aria-hidden="true" size={17} />{t.hero.location}</div>
            </div>
            <div className="hero-modes" aria-label="Staffing options">
              {t.hero.modes.map((mode, index) => <div key={mode}><span>0{index + 1}</span><p>{mode}</p></div>)}
            </div>
          </div>
        </section>

        <div className="sector-rail" aria-label={t.sectorsLabel}>
          <strong>{t.sectorsLabel}</strong>
          <div>{t.sectors.map((sector) => <span key={sector}>{sector}</span>)}</div>
        </div>

        <section className="section intro-section">
          <div className="section-heading intro-heading">
            <p className="eyebrow">{t.intro.kicker}</p>
            <h2>{t.intro.title}</h2>
            <p>{t.intro.body}</p>
            <blockquote>{t.intro.note}</blockquote>
          </div>
          <div className="strength-list">
            {t.intro.strengths.map(([number, title, body]) => (
              <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{body}</p></div></article>
            ))}
          </div>
        </section>

        <section className="section services-section" id="servicios">
          <header className="services-header">
            <div><p className="eyebrow">{t.services.kicker}</p><h2>{t.services.title}</h2></div>
            <p>{t.services.body}</p>
          </header>
          <div className="service-bands">
            {t.services.groups.map((group) => (
              <article className="service-band" key={group.number}>
                <span className="service-number">{group.number}</span>
                <div className="service-summary"><h3>{group.title}</h3><p>{group.text}</p></div>
                <ul>{group.items.map((item) => <li key={item}><ArrowRight aria-hidden="true" size={15} />{item}</li>)}</ul>
              </article>
            ))}
          </div>
          <p className="service-note">{t.services.immigrationNote}</p>
        </section>

        <section className="process-section" id="proceso">
          <div className="process-intro">
            <p className="eyebrow eyebrow-gold">{t.process.kicker}</p>
            <h2>{t.process.title}</h2>
            <p>{t.process.body}</p>
          </div>
          <ol className="process-steps">
            {t.process.steps.map((step, index) => <li key={step}><span>0{index + 1}</span><p>{step}</p></li>)}
          </ol>
        </section>

        <section className="section talent-section" id="talento">
          <header className="talent-heading"><p className="eyebrow">{t.talent.kicker}</p><h2>{t.talent.title}</h2><p>{t.talent.body}</p></header>
          <div className="talent-categories">
            {t.talent.categories.map((category, index) => (
              <article key={category.title}><span>0{index + 1}</span><h3>{category.title}</h3><ul>{category.items.map((item) => <li key={item}>{item}</li>)}</ul></article>
            ))}
          </div>
          <div className="transport-callout">
            <div><p className="eyebrow">Laredo + selected projects</p><h3>{t.talent.transportTitle}</h3><p>{t.talent.transportText}</p></div>
            <div className="transport-actions"><ArrowLink href="#solicitud">{t.talent.candidateCta}</ArrowLink><ArrowLink href={employerWhatsApp} external>{t.talent.employerCta}</ArrowLink></div>
          </div>
        </section>

        <ApplicationForm language={language} />

        <section className="local-section">
          <div className="local-image">
            <Image src="/images/multiservices-office.webp" alt={t.local.imageAlt} fill sizes="(max-width: 800px) 100vw, 43vw" />
            <span>27.5064° N · 99.5075° W</span>
          </div>
          <div className="local-copy">
            <p className="eyebrow">{t.local.kicker}</p><h2>{t.local.title}</h2><p>{t.local.body}</p>
            <ul>{t.local.points.map((point) => <li key={point}>{point}</li>)}</ul>
            <ArrowLink href={mapsUrl} external>{t.local.address}</ArrowLink>
          </div>
        </section>

        <section className="contact-section" id="contacto">
          <header><p className="eyebrow eyebrow-gold">{t.contact.kicker}</p><h2>{t.contact.title}</h2><p>{t.contact.body}</p></header>
          <div className="contact-paths">
            <article>
              <span>01</span><h3>{t.contact.employerTitle}</h3><p>{t.contact.employerText}</p>
              <a className="contact-primary" href={employerWhatsApp} target="_blank" rel="noreferrer"><MessageCircle aria-hidden="true" size={20} />{t.contact.employerCta}</a>
              <a className="contact-secondary" href={operationsEmail}><Mail aria-hidden="true" size={17} />{t.contact.employerEmail}</a>
            </article>
            <article>
              <span>02</span><h3>{t.contact.candidateTitle}</h3><p>{t.contact.candidateText}</p>
              <a className="contact-primary" href="#solicitud"><ArrowRight aria-hidden="true" size={20} />{t.contact.candidateCta}</a>
              <a className="contact-secondary" href={candidateEmail}><Mail aria-hidden="true" size={17} />{t.contact.candidateEmail}</a>
            </article>
          </div>
          <div className="contact-details">
            <a href={mapsUrl} target="_blank" rel="noreferrer"><MapPin aria-hidden="true" size={18} /><span><small>{t.contact.office}</small>1316 Zaragoza St, Laredo, TX 78040</span></a>
            <a href="tel:+19564411292"><Phone aria-hidden="true" size={18} /><span><small>Phone</small>+1 (956) 441-1292</span></a>
            <a href="https://www.instagram.com/multiservicesldo/" target="_blank" rel="noreferrer"><ArrowUpRight aria-hidden="true" size={18} /><span><small>{t.contact.follow}</small>@multiservicesldo</span></a>
            <a href="https://www.facebook.com/people/Multiservices-Laredo/61557726029987/" target="_blank" rel="noreferrer"><ArrowUpRight aria-hidden="true" size={18} /><span><small>{t.contact.followFacebook}</small>Multiservices Laredo</span></a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand"><Image src="/images/multiservices-logo.png" alt="" width={66} height={66} /><div><strong>Multiservices Laredo LLC</strong><span>{t.footer}</span></div></div>
        <p>© {new Date().getFullYear()} Multiservices Laredo LLC</p>
      </footer>

      <div className="mobile-actionbar" aria-label="Quick actions"><a href="#solicitud">{t.mobileCandidate}</a><a href={employerWhatsApp} target="_blank" rel="noreferrer">{t.mobileEmployer}</a></div>
    </>
  );
}
