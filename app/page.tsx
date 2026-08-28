'use client';

import { FormEvent, useState } from 'react';

type Language = 'es' | 'en';
type Audience = 'candidate' | 'employer';

const content = {
  es: {
    utility: 'Staffing bilingüe + soluciones operativas',
    nav: ['Servicios', 'Proceso', 'Vacantes'],
    contact: 'Empezar ahora',
    heroKicker: 'Laredo, Texas · Respuesta local',
    heroLine1: 'Talento que',
    heroAccent: 'mantiene todo',
    heroLine2: 'en movimiento.',
    heroLead: 'Conectamos operaciones exigentes con personas listas para llegar, integrarse y hacer que el trabajo avance.',
    employerCta: 'Necesito personal',
    candidateCta: 'Busco empleo',
    heroCard: 'Una extensión de tu equipo',
    heroCardSub: 'Staffing · Fuerza laboral · Soporte operativo',
    signals: [['ES / EN','Equipo bilingüe'],['TEMP → HIRE','Contratación flexible'],['LAREDO, TX','Conocimiento local']],
    statementKicker: 'Más que cubrir una vacante',
    statement: 'Cuando falta una persona, toda la operación lo siente. Nosotros respondemos con talento preparado y seguimiento cercano.',
    pathsKicker: 'Elige tu camino',
    pathsTitle: 'Dos necesidades. Una sola puerta.',
    employerPath: { index:'01', label:'Para empresas', title:'El equipo que necesitas, sin perder el ritmo.', text:'Cuéntanos el puesto, el turno y la urgencia. Diseñamos una solución de personal alrededor de tu operación.', points:['Temporal y por proyecto','Temp-to-hire','Contratación directa'], cta:'Solicitar talento' },
    candidatePath: { index:'02', label:'Para candidatos', title:'Una oportunidad que sí encaja contigo.', text:'Comparte tu experiencia, aplica en línea y descubre posiciones operativas, administrativas y de liderazgo.', points:['Aplicación en línea','CV o résumé','Apoyo bilingüe'], cta:'Aplicar ahora' },
    servicesKicker: 'Soluciones integrales',
    servicesTitle: 'Una operación tiene muchas piezas. Cubrimos las que importan.',
    services: [
      ['01','Staffing','Reclutamiento y selección para posiciones temporales, por proyecto, temp-to-hire y contratación directa.'],
      ['02','Cuadrillas temporales','Inventarios, sorteos de calidad, escaneo de series, retrabajos, carga, descarga y limpieza de patios.'],
      ['03','Renta de equipo','Yard spotter trucks, montacargas y apoyo mientras tu equipo se encuentra en reparación.'],
      ['04','Etiquetado NOM-050','Termosellado, adhesivo, cosido textil y plastiflecha para distintas necesidades de producto.'],
      ['05','Apoyo migratorio','Preparación y gestión de trámites con un proceso claro, organizado y personalizado.'],
      ['06','Eventos corporativos','Planeación, ambientación, montaje, inauguraciones y experiencias para equipos y empresas.']
    ],
    operationsKicker: 'Soporte que sale de la oficina',
    operationsTitleA: 'Movemos personas.',
    operationsTitleB: 'También movemos operaciones.',
    operationsText: 'Para proyectos seleccionados ofrecemos transporte coordinado, equipo de patio y soluciones que ayudan a mantener el flujo de trabajo.',
    operationsPoints: ['Transporte sujeto a proyecto y ubicación','Yard spotter trucks y montacargas','Atención directa desde Laredo'],
    processKicker: 'Nuestro proceso',
    processTitle: 'Entender primero. Conectar mejor.',
    process: [['01','Conocemos','La operación, el ambiente, el turno y lo que hace exitosa a la posición.'],['02','Reclutamos','Buscamos y evaluamos perfiles con intención, no solo por disponibilidad.'],['03','Conectamos','Presentamos talento preparado para incorporarse con claridad.'],['04','Acompañamos','Damos seguimiento después del inicio para cuidar la relación y el resultado.']],
    jobKicker: 'Vacante destacada · Agosto 2026',
    jobTitle: 'Team Lead',
    jobPay: '$17',
    jobPayUnit: 'por hora · según experiencia',
    jobText: 'Buscamos liderazgo práctico, enfoque operativo y ganas de crecer junto a un equipo en movimiento.',
    jobTags: ['Liderazgo','Operaciones','Laredo, TX'],
    jobCta: 'Aplicar a esta vacante',
    rolesTitle: 'También conectamos talento para',
    roles: ['Warehouse Associates','Forklift Operators','Traffic Clerks','Administrative Assistants','Customer Service','Supervisors','Safety Coordinators','Accounting Personnel'],
    proofKicker: 'Lo que nos distingue',
    proofTitle: 'Cerca de la operación. Cerca de las personas.',
    proofText: 'Somos un equipo bilingüe con conocimiento local, comunicación constante y la flexibilidad para responder a temporadas, nuevos proyectos y cambios de producción.',
    proofPills: ['Equipo bilingüe','Respuesta rápida','Seguimiento continuo','Conocimiento local'],
    formKicker: 'El siguiente movimiento empieza aquí',
    formTitle: 'Cuéntanos qué necesitas.',
    formIntro: 'Elige tu camino. Esta propuesta prepara tu información; para enviarla hoy puedes continuar por correo o WhatsApp.',
    candidateTab: 'Busco empleo',
    employerTab: 'Busco personal',
    name: 'Nombre completo', phone: 'Teléfono', email: 'Correo', role: 'Puesto de interés', resume: 'CV o résumé', resumeHint: 'PDF, DOC o DOCX · máximo 10 MB', company: 'Empresa', need: '¿Qué tipo de personal necesitas?', message: 'Mensaje adicional', submit: 'Preparar solicitud',
    successTitle: 'Tu siguiente paso está listo.',
    successText: 'Esta demostración no envía ni almacena datos. Elige correo o WhatsApp para contactar al equipo de Multiservices.',
    emailCta: 'Continuar por correo', whatsappCta: 'Continuar por WhatsApp', privacy: 'Tus datos no se transmiten desde esta propuesta.',
    footerLine1: 'Conectamos talento.', footerLine2: 'Fortalecemos operaciones.',
    footerContact: 'Contacto', footerVisit: 'Visítanos', footerSocial: 'Síguenos', footerLegal: 'Multiservices Laredo LLC'
  },
  en: {
    utility: 'Bilingual staffing + operational solutions',
    nav: ['Services', 'Process', 'Open roles'],
    contact: 'Start now',
    heroKicker: 'Laredo, Texas · Local response',
    heroLine1: 'Talent that',
    heroAccent: 'keeps everything',
    heroLine2: 'moving.',
    heroLead: 'We connect demanding operations with people ready to show up, plug in, and keep the work moving.',
    employerCta: 'I need staff',
    candidateCta: 'I need a job',
    heroCard: 'An extension of your team',
    heroCardSub: 'Staffing · Workforce · Operational support',
    signals: [['ES / EN','Bilingual team'],['TEMP → HIRE','Flexible hiring'],['LAREDO, TX','Local knowledge']],
    statementKicker: 'More than filling a role',
    statement: 'When one person is missing, the whole operation feels it. We respond with prepared talent and close follow-through.',
    pathsKicker: 'Choose your path',
    pathsTitle: 'Two needs. One clear door.',
    employerPath: { index:'01', label:'For employers', title:'The team you need, without losing momentum.', text:'Tell us the role, shift, and urgency. We shape a workforce solution around your operation.', points:['Temporary & project','Temp-to-hire','Direct placement'], cta:'Request talent' },
    candidatePath: { index:'02', label:'For candidates', title:'An opportunity that fits where you are going.', text:'Share your experience, apply online, and explore operational, administrative, and leadership roles.', points:['Online application','Résumé or CV','Bilingual support'], cta:'Apply now' },
    servicesKicker: 'Integrated solutions',
    servicesTitle: 'Every operation has moving parts. We cover the ones that matter.',
    services: [
      ['01','Staffing','Recruiting and selection for temporary, project-based, temp-to-hire, and direct-hire roles.'],
      ['02','Temporary crews','Inventory, quality sorting, serial scanning, rework, loading, unloading, and yard cleanup.'],
      ['03','Equipment rental','Yard spotter trucks, forklifts, and support while your equipment is being repaired.'],
      ['04','NOM-050 labeling','Heat seal, adhesive, sewn labels, and tag fasteners for different product needs.'],
      ['05','Immigration support','Document preparation and process guidance through a clear, organized, personal experience.'],
      ['06','Corporate events','Planning, environments, installations, grand openings, and experiences for teams and businesses.']
    ],
    operationsKicker: 'Support that leaves the office',
    operationsTitleA: 'We move people.',
    operationsTitleB: 'We move operations, too.',
    operationsText: 'Selected projects can include coordinated transportation, yard equipment, and practical solutions that help keep work flowing.',
    operationsPoints: ['Transportation varies by project and location','Yard spotter trucks and forklifts','Direct support from Laredo'],
    processKicker: 'Our process',
    processTitle: 'Understand first. Connect better.',
    process: [['01','Discover','The operation, environment, shift, and what makes the role successful.'],['02','Recruit','We source and evaluate people with intention, not just availability.'],['03','Connect','We introduce prepared talent with clear expectations.'],['04','Support','We follow up after day one to protect the relationship and the result.']],
    jobKicker: 'Featured opening · August 2026',
    jobTitle: 'Team Lead',
    jobPay: '$17',
    jobPayUnit: 'per hour · based on experience',
    jobText: 'We are looking for practical leadership, an operational mindset, and the drive to grow with a team in motion.',
    jobTags: ['Leadership','Operations','Laredo, TX'],
    jobCta: 'Apply for this role',
    rolesTitle: 'We also connect talent for',
    roles: ['Warehouse Associates','Forklift Operators','Traffic Clerks','Administrative Assistants','Customer Service','Supervisors','Safety Coordinators','Accounting Personnel'],
    proofKicker: 'What sets us apart',
    proofTitle: 'Close to the operation. Close to the people.',
    proofText: 'We are a bilingual team with local knowledge, constant communication, and the flexibility to respond to seasons, new projects, and production changes.',
    proofPills: ['Bilingual team','Fast response','Ongoing support','Local knowledge'],
    formKicker: 'Your next move starts here',
    formTitle: 'Tell us what you need.',
    formIntro: 'Choose your path. This proposal prepares your information; to send it today, continue by email or WhatsApp.',
    candidateTab: 'I need a job',
    employerTab: 'I need staff',
    name: 'Full name', phone: 'Phone', email: 'Email', role: 'Role of interest', resume: 'Résumé or CV', resumeHint: 'PDF, DOC, or DOCX · 10 MB max', company: 'Company', need: 'What kind of staff do you need?', message: 'Additional message', submit: 'Prepare request',
    successTitle: 'Your next step is ready.',
    successText: 'This demo does not send or store data. Choose email or WhatsApp to contact the Multiservices team.',
    emailCta: 'Continue by email', whatsappCta: 'Continue on WhatsApp', privacy: 'Your data is not transmitted by this proposal.',
    footerLine1: 'Connecting talent.', footerLine2: 'Strengthening operations.',
    footerContact: 'Contact', footerVisit: 'Visit us', footerSocial: 'Follow us', footerLegal: 'Multiservices Laredo LLC'
  }
};

export default function Home() {
  const [lang, setLang] = useState<Language>('es');
  const [audience, setAudience] = useState<Audience>('candidate');
  const [sent, setSent] = useState(false);
  const t = content[lang];

  const selectAudience = (next: Audience) => {
    setAudience(next);
    setSent(false);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <main>
      <div className="utility-bar">
        <span>{t.utility}</span>
        <span>1316 Zaragoza St. · Laredo, TX</span>
        <a href="tel:+19564411292">+1 956 441 1292</a>
      </div>

      <header className="nav-shell">
        <a className="brand-lockup" href="#top" aria-label="Multiservices Laredo home">
          <img src="/logo.png" alt="" />
          <span>MULTISERVICES<small>LAREDO</small></span>
        </a>
        <nav aria-label={lang === 'es' ? 'Navegación principal' : 'Main navigation'}>
          <a href="#servicios">{t.nav[0]}</a>
          <a href="#proceso">{t.nav[1]}</a>
          <a href="#vacantes">{t.nav[2]}</a>
        </nav>
        <div className="nav-actions">
          <div className="language-switch" aria-label="Language">
            <button className={lang === 'es' ? 'active' : ''} onClick={() => setLang('es')}>ES</button>
            <span>/</span>
            <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
          </div>
          <a className="square-cta dark" href="#contacto">{t.contact}<span>↗</span></a>
        </div>
      </header>

      <section className="hero-editorial" id="top">
        <div className="hero-copy">
          <p className="micro-label"><span />{t.heroKicker}</p>
          <h1><span>{t.heroLine1}</span><em>{t.heroAccent}</em><span>{t.heroLine2}</span></h1>
          <p className="hero-lead">{t.heroLead}</p>
          <div className="hero-actions">
            <a className="square-cta gold" href="#contacto" onClick={() => selectAudience('employer')}>{t.employerCta}<span>↗</span></a>
            <a className="text-cta" href="#contacto" onClick={() => selectAudience('candidate')}>{t.candidateCta}<span>↓</span></a>
          </div>
        </div>
        <div className="hero-image-wrap">
          <figure><img src="/hero-team.jpg" alt={lang === 'es' ? 'Profesionales colaborando en una operación' : 'Professionals collaborating in an operation'} /></figure>
          <div className="image-caption"><small>01 / TALENT SOLUTIONS</small><strong>{t.heroCard}</strong><span>{t.heroCardSub}</span></div>
          <div className="vertical-note">STAFFING / WORKFORCE / LAREDO</div>
        </div>
        <div className="hero-signals">
          {t.signals.map(([value,label]) => <div key={value}><strong>{value}</strong><span>{label}</span></div>)}
        </div>
      </section>

      <div className="moving-line" aria-hidden="true"><div>{['STAFFING','RECRUITMENT','TALENT SOLUTIONS','EQUIPMENT RENTAL','NOM-050','OPERATIONAL SUPPORT','STAFFING','RECRUITMENT','TALENT SOLUTIONS'].map((item,index) => <span key={`${item}-${index}`}>{item}<i>◆</i></span>)}</div></div>

      <section className="statement-section page-grid">
        <p className="section-index">01 / PURPOSE</p>
        <div><p className="micro-label"><span />{t.statementKicker}</p><h2>{t.statement}</h2></div>
      </section>

      <section className="path-section page-grid" id="caminos">
        <div className="section-head"><div><p className="micro-label"><span />{t.pathsKicker}</p><h2>{t.pathsTitle}</h2></div><p className="section-index">02 / PATHS</p></div>
        <div className="path-cards">
          {[['employer',t.employerPath,'/office.jpg'],['candidate',t.candidatePath,'/hero-team.jpg']].map(([kind,path,image]) => {
            const pathData = path as typeof t.employerPath;
            const next = kind as Audience;
            return <article className={`path-panel ${next}`} key={next}>
              <div className="panel-top"><span>{pathData.index}</span><b>{pathData.label}</b></div>
              <div className="path-photo"><img src={image as string} alt="" /></div>
              <h3>{pathData.title}</h3><p>{pathData.text}</p>
              <ul>{pathData.points.map(point => <li key={point}>{point}</li>)}</ul>
              <a href="#contacto" onClick={() => selectAudience(next)}>{pathData.cta}<span>↗</span></a>
            </article>;
          })}
        </div>
      </section>

      <section className="services-section" id="servicios">
        <div className="page-grid services-inner">
          <div className="section-head inverted"><div><p className="micro-label gold-line"><span />{t.servicesKicker}</p><h2>{t.servicesTitle}</h2></div><p className="section-index">03 / SERVICES</p></div>
          <div className="service-list">
            {t.services.map(([number,title,text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p><i>↗</i></article>)}
          </div>
        </div>
      </section>

      <section className="operations-story page-grid">
        <div className="ops-gallery">
          <figure className="transport-photo"><img src="/transport.jpg" alt={lang === 'es' ? 'Transporte disponible para proyectos seleccionados' : 'Transportation available for selected projects'} /><figcaption>01 / TRANSPORT</figcaption></figure>
          <figure className="equipment-photo"><img src="/equipment.jpg" alt={lang === 'es' ? 'Equipo de patio y montacargas' : 'Yard equipment and forklift'} /><figcaption>02 / EQUIPMENT</figcaption></figure>
        </div>
        <div className="ops-copy"><p className="micro-label"><span />{t.operationsKicker}</p><h2>{t.operationsTitleA}<em>{t.operationsTitleB}</em></h2><p>{t.operationsText}</p><ul>{t.operationsPoints.map(point => <li key={point}>{point}</li>)}</ul><a className="text-cta" href="#contacto" onClick={() => selectAudience('employer')}>{t.employerCta}<span>↗</span></a></div>
      </section>

      <section className="process-section-new" id="proceso">
        <div className="page-grid">
          <div className="section-head"><div><p className="micro-label"><span />{t.processKicker}</p><h2>{t.processTitle}</h2></div><p className="section-index">04 / PROCESS</p></div>
          <div className="process-track">{t.process.map(([number,title,text]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
        </div>
      </section>

      <section className="jobs-section" id="vacantes">
        <div className="page-grid job-layout">
          <div className="job-copy"><p className="micro-label gold-line"><span />{t.jobKicker}</p><h2>{t.jobTitle}</h2><p>{t.jobText}</p><div className="tag-row">{t.jobTags.map(tag => <span key={tag}>{tag}</span>)}</div><a className="square-cta gold" href="#contacto" onClick={() => selectAudience('candidate')}>{t.jobCta}<span>↗</span></a></div>
          <div className="pay-block"><strong>{t.jobPay}</strong><span>{t.jobPayUnit}</span><i> / HR</i></div>
          <div className="role-cloud"><p>{t.rolesTitle}</p>{t.roles.map(role => <span key={role}>{role}</span>)}</div>
        </div>
      </section>

      <section className="proof-section page-grid">
        <div className="proof-copy"><p className="micro-label"><span />{t.proofKicker}</p><h2>{t.proofTitle}</h2><p>{t.proofText}</p><div>{t.proofPills.map(pill => <span key={pill}>{pill}</span>)}</div></div>
        <figure><img src="/office.jpg" alt={lang === 'es' ? 'Oficina de Multiservices Laredo' : 'Multiservices Laredo office'} /><figcaption>1316 ZARAGOZA ST. / LAREDO, TX</figcaption></figure>
      </section>

      <section className="contact-section-new" id="contacto">
        <div className="page-grid contact-layout">
          <div className="contact-intro"><p className="micro-label gold-line"><span />{t.formKicker}</p><h2>{t.formTitle}</h2><p>{t.formIntro}</p><div className="contact-direct"><a href="https://wa.me/19566069956" target="_blank" rel="noreferrer"><small>WHATSAPP</small><b>+1 956 606 9956</b><span>↗</span></a><a href="mailto:operations@multiservicesldo.com"><small>EMAIL</small><b>operations@multiservicesldo.com</b><span>↗</span></a></div></div>
          <div className="form-shell">
            <div className="form-tabs" role="tablist"><button className={audience === 'candidate' ? 'active' : ''} onClick={() => selectAudience('candidate')}>{t.candidateTab}</button><button className={audience === 'employer' ? 'active' : ''} onClick={() => selectAudience('employer')}>{t.employerTab}</button></div>
            {sent ? <div className="form-success" role="status"><span>✓</span><h3>{t.successTitle}</h3><p>{t.successText}</p><div><a className="square-cta gold" href="mailto:operations@multiservicesldo.com">{t.emailCta}<span>↗</span></a><a className="text-cta light" href="https://wa.me/19566069956" target="_blank" rel="noreferrer">{t.whatsappCta}<span>↗</span></a></div></div> : <form onSubmit={submit}>
              <div className="field-pair"><label>{t.name}<input name="name" required autoComplete="name" /></label><label>{t.phone}<input name="phone" required type="tel" autoComplete="tel" /></label></div>
              <label>{t.email}<input name="email" required type="email" autoComplete="email" /></label>
              {audience === 'candidate' ? <><label>{t.role}<input name="role" /></label><label className="file-field">{t.resume}<input name="resume" type="file" accept=".pdf,.doc,.docx" /><small>{t.resumeHint}</small></label></> : <><label>{t.company}<input name="company" required autoComplete="organization" /></label><label>{t.need}<textarea name="need" rows={4} required /></label></>}
              <label>{t.message}<textarea name="message" rows={3} /></label>
              <button className="square-cta gold form-submit" type="submit">{t.submit}<span>↗</span></button><small className="privacy-note">{t.privacy}</small>
            </form>}
          </div>
        </div>
      </section>

      <footer>
        <div className="page-grid footer-grid"><div className="footer-brand"><img src="/logo.png" alt="Multiservices Laredo" /><h2>{t.footerLine1}<em>{t.footerLine2}</em></h2></div><div><b>{t.footerContact}</b><a href="tel:+19564411292">+1 956 441 1292</a><a href="https://wa.me/19566069956" target="_blank" rel="noreferrer">WhatsApp ↗</a><a href="mailto:operations@multiservicesldo.com">operations@multiservicesldo.com</a></div><div><b>{t.footerVisit}</b><a href="https://maps.google.com/?q=1316+Zaragoza+St+Laredo+TX+78040" target="_blank" rel="noreferrer">1316 Zaragoza St.<br />Laredo, TX 78040 ↗</a></div><div><b>{t.footerSocial}</b><a href="https://www.instagram.com/multiservicesldo" target="_blank" rel="noreferrer">Instagram ↗</a><span>Facebook</span></div></div>
        <div className="page-grid footer-bottom"><span>© 2026 {t.footerLegal}</span><span>STAFFING / RECRUITMENT / TALENT SOLUTIONS</span><a href="#top">TOP ↑</a></div>
      </footer>

      <a className="floating-whatsapp" href="https://wa.me/19566069956" target="_blank" rel="noreferrer" aria-label="WhatsApp"><span>WA</span><i>↗</i></a>
    </main>
  );
}
