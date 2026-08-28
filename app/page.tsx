'use client';

import { FormEvent, useState } from 'react';

const copy = {
  es: {
    nav: ['Servicios', 'Cómo funciona', 'Empleos'], talk: 'Hablemos', eyebrow: 'Staffing · Reclutamiento · Talent Solutions',
    titleA: 'El talento correcto.', titleB: 'Justo cuando lo necesitas.', lead: 'Conectamos empresas de Laredo con personas listas para hacer que la operación avance.',
    employer: 'Necesito personal', candidate: 'Busco empleo', trust: ['Respuesta rápida', 'Equipo bilingüe', 'Conocimiento local'],
    ready: 'Talento listo.', roles: 'Operativo · Administrativo · Liderazgo', strip: 'Soluciones que mueven la operación',
    choose: 'Dos caminos. Un mismo objetivo:', chooseEm: 'hacer crecer a Laredo.',
    bizKicker: 'Para empresas', bizTitle: 'Tu operación no puede esperar.', bizText: 'Entendemos tu entorno, reclutamos con intención y damos seguimiento después de cada colocación.', bizCta: 'Solicitar talento',
    peopleKicker: 'Para candidatos', peopleTitle: 'Tu siguiente oportunidad empieza aquí.', peopleText: 'Aplica en línea, comparte tu CV y descubre posiciones que se ajustan a tu experiencia.', peopleCta: 'Aplicar ahora',
    processKicker: 'Nuestro proceso', processTitle: 'De la necesidad al equipo correcto.', steps: [['01','Conocemos','Tu operación, cultura y urgencia.'],['02','Reclutamos','Buscamos y evaluamos talento.'],['03','Conectamos','Presentamos candidatos preparados.'],['04','Acompañamos','Seguimos cerca después del inicio.']],
    jobKicker: 'Vacante destacada', jobTitle: 'Team Lead', jobPay: 'Desde $17/hora · según experiencia', jobText: 'Una oportunidad reciente para perfiles con liderazgo, enfoque operativo y ganas de crecer.', jobTags: ['Liderazgo','Crecimiento','Laredo, TX'], jobCta: 'Quiero aplicar', jobNote: 'Publicada en Instagram · 27 ago 2026',
    servicesKicker: 'Más que staffing', servicesTitle: 'Un aliado para toda la operación.', serviceText: 'Servicios flexibles que se adaptan al ritmo, temporada y objetivos de cada empresa.',
    services: [['Staffing','Temporal, por proyecto, temp-to-hire y contratación directa.'],['Cuadrillas temporales','Inventarios, sorteos de calidad, escaneo de series, retrabajos, carga y limpieza de patios.'],['Renta de equipo','Yard spotter trucks, montacargas y soporte de reparación.'],['Etiquetado NOM-050','Termosellado, adhesivo, cosido textil y plastiflecha.'],['Apoyo migratorio','Preparación y gestión de trámites con atención personalizada.'],['Eventos corporativos','Planeación, ambientación, montajes e inauguraciones.']],
    formKicker: 'Demos el siguiente paso', formTitle: 'Cuéntanos qué necesitas.', formIntro: 'Elige tu camino y completa el formulario. También puedes enviarnos tu CV por correo o escribirnos por WhatsApp.',
    tabCandidate: 'Busco empleo', tabEmployer: 'Busco personal', name: 'Nombre completo', email: 'Correo', phone: 'Teléfono', role: 'Puesto de interés', company: 'Empresa', need: '¿Qué tipo de personal necesitas?', resume: 'CV o résumé', resumeHint: 'PDF, DOC o DOCX · máximo 10 MB', message: 'Mensaje', send: 'Preparar solicitud', sentTitle: '¡Listo!', sentText: 'Tu información quedó preparada en esta demostración. Para enviarla hoy, usa correo o WhatsApp.', emailCta: 'Enviar por correo', waCta: 'Abrir WhatsApp', privacy: 'Esta propuesta no almacena ni transmite datos.',
    footerLine: 'Conectamos talento. Fortalecemos equipos.', follow: 'Síguenos', visit: 'Visítanos', contact: 'Contacto', rights: 'Multiservices Laredo LLC',
  },
  en: {
    nav: ['Services', 'How it works', 'Jobs'], talk: 'Let’s talk', eyebrow: 'Staffing · Recruitment · Talent Solutions',
    titleA: 'The right talent.', titleB: 'Right when you need it.', lead: 'We connect Laredo businesses with people ready to keep operations moving.',
    employer: 'I need staff', candidate: 'I need a job', trust: ['Fast response', 'Bilingual team', 'Local knowledge'],
    ready: 'Talent, ready.', roles: 'Operations · Administration · Leadership', strip: 'Solutions that keep operations moving',
    choose: 'Two paths. One shared goal:', chooseEm: 'helping Laredo grow.',
    bizKicker: 'For employers', bizTitle: 'Your operation cannot wait.', bizText: 'We learn your environment, recruit with intention, and stay involved after every placement.', bizCta: 'Request talent',
    peopleKicker: 'For candidates', peopleTitle: 'Your next opportunity starts here.', peopleText: 'Apply online, share your résumé, and discover roles that fit your experience.', peopleCta: 'Apply now',
    processKicker: 'Our process', processTitle: 'From a business need to the right team.', steps: [['01','Discover','Your operation, culture, and urgency.'],['02','Recruit','We source and evaluate talent.'],['03','Connect','We present prepared candidates.'],['04','Support','We stay close after day one.']],
    jobKicker: 'Featured opportunity', jobTitle: 'Team Lead', jobPay: 'Starting at $17/hour · based on experience', jobText: 'A recent opening for candidates with leadership skills, an operational mindset, and room to grow.', jobTags: ['Leadership','Growth','Laredo, TX'], jobCta: 'Apply for this role', jobNote: 'Posted on Instagram · Aug 27, 2026',
    servicesKicker: 'More than staffing', servicesTitle: 'One partner for the whole operation.', serviceText: 'Flexible services that adapt to each company’s pace, seasons, and goals.',
    services: [['Staffing','Temporary, project-based, temp-to-hire, and direct hire.'],['Temporary crews','Inventory, quality sorting, serial scanning, rework, loading, and yard cleanup.'],['Equipment rental','Yard spotter trucks, forklifts, and repair support.'],['NOM-050 labeling','Heat seal, adhesive, sewn labels, and tag fasteners.'],['Immigration support','Document preparation and process guidance with personal attention.'],['Corporate events','Planning, environments, installations, and grand openings.']],
    formKicker: 'Take the next step', formTitle: 'Tell us what you need.', formIntro: 'Choose your path and complete the form. You can also email your résumé or reach us on WhatsApp.',
    tabCandidate: 'I need a job', tabEmployer: 'I need staff', name: 'Full name', email: 'Email', phone: 'Phone', role: 'Role of interest', company: 'Company', need: 'What kind of staff do you need?', resume: 'Résumé or CV', resumeHint: 'PDF, DOC, or DOCX · 10 MB max', message: 'Message', send: 'Prepare request', sentTitle: 'All set!', sentText: 'Your information is prepared in this demo. To send it today, use email or WhatsApp.', emailCta: 'Send by email', waCta: 'Open WhatsApp', privacy: 'This proposal does not store or transmit data.',
    footerLine: 'Connecting talent. Strengthening teams.', follow: 'Follow us', visit: 'Visit us', contact: 'Contact', rights: 'Multiservices Laredo LLC',
  }
};

export default function Home() {
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [audience, setAudience] = useState<'candidate' | 'employer'>('candidate');
  const [sent, setSent] = useState(false);
  const t = copy[lang];
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSent(true); };

  return (
    <main>
      <div className="topline"><span>1316 Zaragoza St. · Laredo, TX</span><a href="tel:+19564411292">+1 (956) 441-1292</a></div>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Multiservices Laredo"><img src="/logo.png" alt="" /><span>Multiservices <b>Laredo</b></span></a>
        <nav aria-label={lang === 'es' ? 'Principal' : 'Main'}>
          <a href="#servicios">{t.nav[0]}</a><a href="#proceso">{t.nav[1]}</a><a href="#empleos">{t.nav[2]}</a>
        </nav>
        <div className="header-actions"><button className="lang" onClick={() => setLang(lang === 'es' ? 'en' : 'es')} aria-label="Cambiar idioma">{lang === 'es' ? 'EN' : 'ES'}</button><a className="header-cta" href="#contacto">{t.talk}</a></div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">{t.eyebrow}</p><h1>{t.titleA}<br /><em>{t.titleB}</em></h1><p className="hero-lead">{t.lead}</p>
          <div className="hero-actions"><a className="button primary" href="#contacto" onClick={() => setAudience('employer')}>{t.employer}</a><a className="button secondary" href="#contacto" onClick={() => setAudience('candidate')}>{t.candidate}</a></div>
          <div className="trust-row">{t.trust.map(item => <span key={item}>{item}</span>)}</div>
        </div>
        <div className="hero-visual" aria-label={lang === 'es' ? 'Equipo profesional colaborando' : 'Professional team collaborating'}><div className="image-frame"><img src="/team.jpg" alt={lang === 'es' ? 'Dos profesionales colaborando frente a una computadora' : 'Two professionals collaborating at a computer'} /></div><div className="floating-card"><strong>{t.ready}</strong><span>{t.roles}</span></div><div className="gold-dot" /></div>
      </section>

      <section className="ticker" aria-label={t.strip}><div>{['Staffing','Recruitment','Talent solutions','Equipment rental','NOM-050','Servicios migratorios'].map(item => <span key={item}>{item}</span>)}</div></section>

      <section className="pathways section" id="empresas">
        <div className="section-heading"><h2>{t.choose} <em>{t.chooseEm}</em></h2></div>
        <div className="path-grid">
          <article className="path-card business"><p className="eyebrow">{t.bizKicker}</p><h3>{t.bizTitle}</h3><p>{t.bizText}</p><ul><li>Temporary & project staffing</li><li>Temp-to-hire</li><li>Direct placement</li></ul><a href="#contacto" onClick={() => setAudience('employer')}>{t.bizCta} <span>→</span></a></article>
          <article className="path-card people"><p className="eyebrow">{t.peopleKicker}</p><h3>{t.peopleTitle}</h3><p>{t.peopleText}</p><div className="role-pills"><span>Warehouse</span><span>Forklift</span><span>Admin</span><span>Leadership</span></div><a href="#contacto" onClick={() => setAudience('candidate')}>{t.peopleCta} <span>→</span></a></article>
        </div>
      </section>

      <section className="process-section" id="proceso"><div className="section process-inner"><div className="process-heading"><p className="eyebrow gold">{t.processKicker}</p><h2>{t.processTitle}</h2></div><div className="steps">{t.steps.map(([n,title,text]) => <article key={n}><span>{n}</span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>

      <section className="job-section section" id="empleos"><div className="job-card"><div><p className="eyebrow gold">{t.jobKicker}</p><h2>{t.jobTitle}</h2><p className="job-pay">{t.jobPay}</p><p>{t.jobText}</p><div className="role-pills light">{t.jobTags.map(tag => <span key={tag}>{tag}</span>)}</div><a className="button primary" href="#contacto" onClick={() => setAudience('candidate')}>{t.jobCta}</a><small>{t.jobNote}</small></div><div className="job-mark" aria-hidden="true"><span>17</span><b>$/HR</b></div></div></section>

      <section className="services section" id="servicios"><div className="services-intro"><p className="eyebrow">{t.servicesKicker}</p><h2>{t.servicesTitle}</h2><p>{t.serviceText}</p></div><div className="service-grid">{t.services.map(([title,text], index) => <article key={title}><span>0{index+1}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>

      <section className="contact-section" id="contacto"><div className="section contact-grid"><div className="contact-copy"><p className="eyebrow gold">{t.formKicker}</p><h2>{t.formTitle}</h2><p>{t.formIntro}</p><div className="direct-links"><a href="https://wa.me/19566069956" target="_blank" rel="noreferrer"><b>WhatsApp</b><span>+1 (956) 606-9956</span></a><a href="mailto:operations@multiservicesldo.com"><b>Email</b><span>operations@multiservicesldo.com</span></a></div></div><div className="form-card"><div className="form-tabs" role="tablist"><button className={audience==='candidate'?'active':''} onClick={() => {setAudience('candidate');setSent(false)}}>{t.tabCandidate}</button><button className={audience==='employer'?'active':''} onClick={() => {setAudience('employer');setSent(false)}}>{t.tabEmployer}</button></div>{sent ? <div className="success" role="status"><span>✓</span><h3>{t.sentTitle}</h3><p>{t.sentText}</p><div><a className="button primary" href="mailto:operations@multiservicesldo.com">{t.emailCta}</a><a className="button secondary" href="https://wa.me/19566069956" target="_blank" rel="noreferrer">{t.waCta}</a></div></div> : <form onSubmit={submit}><div className="field-row"><label>{t.name}<input required name="name" autoComplete="name" /></label><label>{t.phone}<input required name="phone" type="tel" autoComplete="tel" /></label></div><label>{t.email}<input required name="email" type="email" autoComplete="email" /></label>{audience === 'candidate' ? <><label>{t.role}<input name="role" /></label><label className="upload">{t.resume}<input name="resume" type="file" accept=".pdf,.doc,.docx" /><small>{t.resumeHint}</small></label></> : <><label>{t.company}<input required name="company" autoComplete="organization" /></label><label>{t.need}<textarea name="need" rows={4} required /></label></>}<label>{t.message}<textarea name="message" rows={3} /></label><button className="button primary submit" type="submit">{t.send} →</button><small className="privacy">{t.privacy}</small></form>}</div></div></section>

      <footer><div className="footer-main section"><div className="footer-brand"><img src="/logo.png" alt="Multiservices Laredo" /><h2>{t.footerLine}</h2></div><div><b>{t.contact}</b><a href="tel:+19564411292">+1 (956) 441-1292</a><a href="mailto:operations@multiservicesldo.com">operations@multiservicesldo.com</a></div><div><b>{t.visit}</b><a href="https://maps.google.com/?q=1316+Zaragoza+St+Laredo+TX+78040" target="_blank" rel="noreferrer">1316 Zaragoza St.<br />Laredo, TX 78040</a></div><div><b>{t.follow}</b><a href="https://www.instagram.com/multiservicesldo" target="_blank" rel="noreferrer">Instagram ↗</a><span>Facebook</span></div></div><div className="footer-bottom section"><span>© 2026 {t.rights}</span><span>Staffing · Recruitment · Talent Solutions</span></div></footer>
    </main>
  );
}
