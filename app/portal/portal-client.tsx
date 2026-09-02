'use client';

import {
  Archive, ArrowUpRight, BriefcaseBusiness, Check, ChevronRight, CircleGauge, Clock3,
  ExternalLink, FileText, Image as ImageIcon, LayoutDashboard, LoaderCircle, LogOut,
  Mail, MapPin, Menu, MessageCircle, Pencil, Phone, Plus, Save, Search, Upload, UserRound,
  UsersRound, X,
} from 'lucide-react';
import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import type { ApplicationRecord, ApplicationStatus, JobRecord, JobStatus, PortalSnapshot, SiteSettings } from '@/lib/portal-types';

type Section = 'overview' | 'jobs' | 'applications' | 'content';
type EditableJob = Omit<JobRecord, 'createdAt' | 'updatedAt'>;

const navigation: Array<{ id: Section; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'overview', label: 'Inicio', icon: LayoutDashboard },
  { id: 'jobs', label: 'Vacantes', icon: BriefcaseBusiness },
  { id: 'applications', label: 'Candidatos', icon: UsersRound },
  { id: 'content', label: 'Contenido y fotos', icon: ImageIcon },
];

const jobLabels: Record<JobStatus, string> = { draft: 'Borrador', published: 'Publicada', closed: 'Cerrada', archived: 'Archivada' };
const applicationLabels: Record<ApplicationStatus, string> = { new: 'Nuevo', reviewing: 'En revisión', contacted: 'Contactado', interview: 'Entrevista', hired: 'Contratado', rejected: 'No continúa', archived: 'Archivado' };
const settingsFields = [
  'heroLine1Es', 'heroAccentEs', 'heroLine2Es', 'heroLeadEs',
  'heroLine1En', 'heroAccentEn', 'heroLine2En', 'heroLeadEn',
  'contactPhone', 'contactWhatsapp', 'contactEmail',
] as const satisfies ReadonlyArray<keyof SiteSettings>;

export default function PortalClient({ initialSnapshot, signOutPath }: { initialSnapshot: PortalSnapshot; signOutPath: string }) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [section, setSection] = useState<Section>('overview');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [jobDraft, setJobDraft] = useState<EditableJob | null>(null);
  const [jobQuery, setJobQuery] = useState('');
  const [jobFilter, setJobFilter] = useState<'all' | JobStatus>('all');
  const [applicationQuery, setApplicationQuery] = useState('');
  const [applicationFilter, setApplicationFilter] = useState<'all' | ApplicationStatus>('all');
  const [settingsDraft, setSettingsDraft] = useState(snapshot.settings);
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const { capabilities } = snapshot;
  const availableNavigation = navigation.filter(({ id }) =>
    (id !== 'applications' || capabilities.viewApplications) && (id !== 'content' || capabilities.editContent));

  const filteredJobs = useMemo(() => snapshot.jobs.filter((job) => {
    const matchesText = `${job.titleEs} ${job.titleEn} ${job.location}`.toLowerCase().includes(jobQuery.toLowerCase());
    return matchesText && (jobFilter === 'all' || job.status === jobFilter);
  }), [snapshot.jobs, jobFilter, jobQuery]);

  const filteredApplications = useMemo(() => snapshot.applications.filter((application) => {
    const matchesText = `${application.fullName} ${application.email} ${application.reference} ${application.jobTitle || application.roleInterest}`.toLowerCase().includes(applicationQuery.toLowerCase());
    return matchesText && (applicationFilter === 'all' || application.status === applicationFilter);
  }), [snapshot.applications, applicationFilter, applicationQuery]);
  const settingsDirty = useMemo(() => settingsFields.some((field) => settingsDraft[field] !== snapshot.settings[field]), [settingsDraft, snapshot.settings]);

  async function portalAction(payload: Record<string, unknown>, progress: string, success: string, syncSettings = false) {
    setBusy(progress); setNotice(null);
    try {
      const request = await fetch('/api/portal', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await request.json() as { error?: string; snapshot?: PortalSnapshot };
      if (!request.ok || !result.snapshot) throw new Error(result.error || 'No fue posible guardar los cambios.');
      setSnapshot(result.snapshot);
      if (syncSettings) setSettingsDraft(result.snapshot.settings);
      setNotice({ kind: 'success', text: success });
      return true;
    } catch (error) {
      setNotice({ kind: 'error', text: error instanceof Error ? error.message : 'No fue posible guardar los cambios.' });
      return false;
    } finally { setBusy(''); }
  }

  async function saveJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!jobDraft) return;
    const saved = await portalAction({ action: 'save_job', job: jobDraft }, 'job', jobDraft.id ? 'Vacante actualizada.' : 'Vacante creada.');
    if (saved) setJobDraft(null);
  }

  async function archiveJob(job: JobRecord) {
    if (!window.confirm(`¿Archivar “${job.titleEs}”? Ya no aparecerá en las listas del portal.`)) return;
    await portalAction({ action: 'archive', id: job.id }, `archive-${job.id}`, 'Vacante archivada.');
  }

  async function updateApplication(application: ApplicationRecord, status: ApplicationStatus) {
    await portalAction({ action: 'application_status', id: application.id, status }, `application-${application.id}`, 'Estado del candidato actualizado.');
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await portalAction({ action: 'save_settings', settings: settingsDraft }, 'settings', 'Contenido principal actualizado.', true);
  }

  async function uploadImage(slot: 'hero' | 'transport' | 'operations', file: File) {
    setBusy(`image-${slot}`); setNotice(null);
    try {
      const optimized = await optimizeImage(file);
      const form = new FormData();
      form.set('file', optimized);
      form.set('slot', slot);
      form.set('altEs', slot === 'hero' ? 'Equipo de Multiservices Laredo en operación' : slot === 'transport' ? 'Transporte coordinado para colaboradores' : 'Equipo operativo trabajando en un proyecto');
      form.set('altEn', slot === 'hero' ? 'Multiservices Laredo team at work' : slot === 'transport' ? 'Coordinated employee transportation' : 'Operations team working on a project');
      const request = await fetch('/api/portal/media', { method: 'POST', body: form });
      const result = await request.json() as { error?: string; snapshot?: PortalSnapshot };
      if (!request.ok || !result.snapshot) throw new Error(result.error || 'No fue posible subir la fotografía.');
      setSnapshot(result.snapshot);
      setSettingsDraft((current) => ({
        ...current,
        heroMediaId: result.snapshot!.settings.heroMediaId,
        transportMediaId: result.snapshot!.settings.transportMediaId,
        operationsMediaId: result.snapshot!.settings.operationsMediaId,
        heroImageUrl: result.snapshot!.settings.heroImageUrl,
        transportImageUrl: result.snapshot!.settings.transportImageUrl,
        operationsImageUrl: result.snapshot!.settings.operationsImageUrl,
        updatedAt: result.snapshot!.settings.updatedAt,
      }));
      setNotice({ kind: 'success', text: 'Fotografía optimizada y publicada.' });
    } catch (error) {
      setNotice({ kind: 'error', text: error instanceof Error ? error.message : 'No fue posible subir la fotografía.' });
    } finally { setBusy(''); }
  }

  const go = (next: Section) => { setSection(next); setMobileMenu(false); setNotice(null); };

  return <main className="portal-shell">
    <aside className={`portal-sidebar ${mobileMenu ? 'is-open' : ''}`}>
      <div className="portal-logo"><img src="/logo-optimized.webp" alt="" /><span>MULTISERVICES<small>PORTAL DE EMPRESA</small></span><button type="button" onClick={() => setMobileMenu(false)} aria-label="Cerrar menú"><X size={20} /></button></div>
      <nav aria-label="Navegación del portal">{availableNavigation.map(({ id, label, icon: Icon }) => <button type="button" className={section === id ? 'active' : ''} onClick={() => go(id)} key={id}><Icon size={19} /><span>{label}</span>{id === 'applications' && snapshot.metrics.newApplications > 0 && <b>{snapshot.metrics.newApplications}</b>}</button>)}</nav>
      <div className="portal-sidebar-bottom"><Link href="/" target="_blank"><ExternalLink size={17} />Ver página pública</Link><a href={signOutPath} target="_top"><LogOut size={17} />Cerrar sesión</a></div>
    </aside>

    <section className="portal-workspace">
      <header className="portal-topbar"><button type="button" className="portal-menu-button" onClick={() => setMobileMenu(true)} aria-label="Abrir menú"><Menu size={21} /></button><div><span>{snapshot.tenant.name}</span>{snapshot.user.localPreview && <small>Vista local segura</small>}</div><div className="portal-user"><span>{initials(snapshot.user.displayName)}</span><div><b>{snapshot.user.displayName}</b><small>{snapshot.user.role === 'owner' ? 'Propietario' : snapshot.user.role === 'editor' ? 'Editor de contenido' : 'Reclutamiento'}</small></div></div></header>
      {notice && <div className={`portal-notice ${notice.kind}`} role="status">{notice.kind === 'success' ? <Check size={17} /> : <span>!</span>}{notice.text}<button type="button" onClick={() => setNotice(null)} aria-label="Cerrar"><X size={15} /></button></div>}
      <div className="portal-content">
        {section === 'overview' && <Overview snapshot={snapshot} onNavigate={go} onNewJob={() => setJobDraft(emptyJob())} />}
        {section === 'jobs' && <JobsSection jobs={filteredJobs} query={jobQuery} setQuery={setJobQuery} filter={jobFilter} setFilter={setJobFilter} onEdit={(job) => setJobDraft(toEditableJob(job))} onNew={() => setJobDraft(emptyJob())} onArchive={archiveJob} busy={busy} canManage={capabilities.manageJobs} canArchive={capabilities.archiveJobs} />}
        {section === 'applications' && capabilities.viewApplications && <ApplicationsSection applications={filteredApplications} query={applicationQuery} setQuery={setApplicationQuery} filter={applicationFilter} setFilter={setApplicationFilter} onStatus={updateApplication} busy={busy} />}
        {section === 'content' && capabilities.editContent && <ContentSection settings={settingsDraft} setSettings={setSettingsDraft} onSave={saveSettings} onUpload={uploadImage} busy={busy} dirty={settingsDirty} />}
      </div>
    </section>
    {jobDraft && capabilities.manageJobs && <JobEditor job={jobDraft} setJob={setJobDraft} onClose={() => setJobDraft(null)} onSave={saveJob} busy={busy === 'job'} />}
  </main>;
}

function Overview({ snapshot, onNavigate, onNewJob }: { snapshot: PortalSnapshot; onNavigate: (section: Section) => void; onNewJob: () => void }) {
  const metrics = ([
    ['Vacantes activas', snapshot.metrics.activeJobs, BriefcaseBusiness, 'published'],
    ['Borradores', snapshot.metrics.draftJobs, FileText, 'draft'],
    ...(snapshot.capabilities.viewApplications ? [
      ['Candidatos nuevos', snapshot.metrics.newApplications, UsersRound, 'new'] as const,
      ['Solicitudes totales', snapshot.metrics.totalApplications, CircleGauge, 'total'] as const,
    ] : []),
  ] as const);
  return <><div className="portal-page-heading"><div><p>Panel principal</p><h1>Todo lo importante, en un solo lugar.</h1><span>Administra únicamente las áreas permitidas para tu función.</span></div>{snapshot.capabilities.manageJobs && <button type="button" className="portal-primary" onClick={onNewJob}><Plus size={18} />Nueva vacante</button>}</div>
    <div className="portal-metrics">{metrics.map(([label, value, Icon, tone]) => <article key={label} className={tone}><div><span>{label}</span><strong>{value}</strong></div><Icon size={22} /></article>)}</div>
    <div className="portal-overview-grid">{snapshot.capabilities.viewApplications && <section className="portal-panel"><div className="portal-panel-head"><div><p>Solicitudes recientes</p><span>Los últimos candidatos que aplicaron</span></div><button type="button" onClick={() => onNavigate('applications')}>Ver todos<ChevronRight size={16} /></button></div>{snapshot.applications.length ? <div className="recent-applications">{snapshot.applications.slice(0, 5).map((item) => <article key={item.id}><div className="candidate-avatar">{initials(item.fullName)}</div><div><strong>{item.fullName}</strong><span>{item.jobTitle || item.roleInterest}</span></div><small>{relativeDate(item.createdAt)}</small><Status kind={item.status} label={applicationLabels[item.status]} /></article>)}</div> : <Empty icon={UsersRound} title="Aún no hay solicitudes" text="Cuando alguien aplique, aparecerá aquí automáticamente." />}</section>}
      <aside className="portal-quick-panel"><p>Accesos rápidos</p>{snapshot.capabilities.manageJobs && <button type="button" onClick={onNewJob}><span><Plus size={18} /></span><div><strong>Crear una vacante</strong><small>Guárdala como borrador o publícala</small></div><ChevronRight size={17} /></button>}{snapshot.capabilities.viewApplications && <button type="button" onClick={() => onNavigate('applications')}><span><UsersRound size={18} /></span><div><strong>Revisar candidatos</strong><small>Consulta solicitudes y currículums</small></div><ChevronRight size={17} /></button>}{snapshot.capabilities.editContent && <button type="button" onClick={() => onNavigate('content')}><span><ImageIcon size={18} /></span><div><strong>Editar página</strong><small>Textos, contacto y fotografías</small></div><ChevronRight size={17} /></button>}<Link href="/vacantes" target="_blank"><span><ExternalLink size={18} /></span><div><strong>Ver vacantes públicas</strong><small>Comprueba lo que ven los candidatos</small></div><ChevronRight size={17} /></Link></aside></div></>;
}

function JobsSection({ jobs, query, setQuery, filter, setFilter, onEdit, onNew, onArchive, busy, canManage, canArchive }: {
  jobs: JobRecord[]; query: string; setQuery: (value: string) => void; filter: 'all' | JobStatus; setFilter: (value: 'all' | JobStatus) => void;
  onEdit: (job: JobRecord) => void; onNew: () => void; onArchive: (job: JobRecord) => void; busy: string; canManage: boolean; canArchive: boolean;
}) {
  return <><div className="portal-page-heading compact"><div><p>Administración</p><h1>Vacantes</h1><span>{canManage ? 'Crea, publica o cierra oportunidades sin tocar la página.' : 'Consulta las oportunidades y su estado de publicación.'}</span></div>{canManage && <button type="button" className="portal-primary" onClick={onNew}><Plus size={18} />Nueva vacante</button>}</div>
    <div className="portal-list-toolbar"><label><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar vacante" /></label><div>{(['all', 'published', 'draft', 'closed', 'archived'] as const).map((status) => <button type="button" className={filter === status ? 'active' : ''} onClick={() => setFilter(status)} key={status}>{status === 'all' ? 'Todas' : jobLabels[status]}</button>)}</div></div>
    <section className="portal-panel portal-table-panel">{jobs.length ? <div className="portal-jobs-table"><div className="portal-table-head"><span>Vacante</span><span>Estado</span><span>Condiciones</span><span>Solicitudes</span><span>Actualización</span><span /></div>{jobs.map((job) => <article key={job.id}><div><strong>{job.titleEs}</strong><span><MapPin size={13} />{job.location}</span></div><Status kind={job.status} label={jobLabels[job.status]} /><div><strong>{job.payMin === null ? 'Sueldo por confirmar' : `$${job.payMin}${job.payMax ? `–$${job.payMax}` : ''} / ${job.payUnit}`}</strong><span>{job.shift}</span></div><b>{job.applicationCount || 0}</b><small>{relativeDate(job.updatedAt)}</small><div className="portal-row-actions">{isPublicJob(job) && <Link href={`/vacantes/${job.slug}`} target="_blank" aria-label="Ver vacante publicada"><ExternalLink size={16} /></Link>}{canManage && job.status !== 'archived' && <button type="button" onClick={() => onEdit(job)} aria-label="Editar vacante"><Pencil size={16} /></button>}{canArchive && job.status !== 'archived' && <button type="button" disabled={busy === `archive-${job.id}`} onClick={() => onArchive(job)} aria-label="Archivar vacante">{busy === `archive-${job.id}` ? <LoaderCircle className="spin" size={16} /> : <Archive size={16} />}</button>}</div></article>)}</div> : <Empty icon={BriefcaseBusiness} title="No hay vacantes con ese filtro" text="Cambia la búsqueda o crea una nueva oportunidad." action={canManage ? 'Crear vacante' : undefined} onAction={canManage ? onNew : undefined} />}</section></>;
}

function ApplicationsSection({ applications, query, setQuery, filter, setFilter, onStatus, busy }: {
  applications: ApplicationRecord[]; query: string; setQuery: (value: string) => void; filter: 'all' | ApplicationStatus; setFilter: (value: 'all' | ApplicationStatus) => void;
  onStatus: (application: ApplicationRecord, status: ApplicationStatus) => void; busy: string;
}) {
  return <><div className="portal-page-heading compact"><div><p>Seguimiento</p><h1>Candidatos</h1><span>Solicitudes guardadas directamente desde la página.</span></div></div>
    <div className="portal-list-toolbar application-toolbar"><label><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar nombre, correo o folio" /></label><select value={filter} onChange={(event) => setFilter(event.target.value as 'all' | ApplicationStatus)}><option value="all">Todas las etapas</option>{Object.entries(applicationLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></div>
    <section className="candidate-list">{applications.length ? applications.map((application) => <article key={application.id}><div className="candidate-main"><div className="candidate-avatar">{initials(application.fullName)}</div><div><span>{application.reference}</span><h2>{application.fullName}</h2><p>{application.jobTitle || application.roleInterest}</p></div></div><div className="candidate-contact"><a href={`tel:${application.phone}`}><Phone size={15} />{application.phone}</a><a href={`mailto:${application.email}`}><Mail size={15} />{application.email}</a>{application.city && <span><MapPin size={15} />{application.city}</span>}</div><div className="candidate-message">{application.availability && <strong><Clock3 size={14} />Disponibilidad: {application.availability}</strong>}{application.message.length > 180 ? <details><summary>Leer mensaje completo</summary><p>{application.message}</p></details> : <p>{application.message || 'Sin mensaje adicional.'}</p>}<small><Clock3 size={14} />Aplicó {relativeDate(application.createdAt)}</small></div><div className="candidate-actions"><label><span className="sr-only">Estado de {application.fullName}</span><select value={application.status} disabled={busy === `application-${application.id}`} onChange={(event) => onStatus(application, event.target.value as ApplicationStatus)}>{Object.entries(applicationLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>{application.resumeFilename ? <a href={`/api/portal/resume/${application.id}`}><FileText size={16} />Descargar CV</a> : <span><FileText size={16} />Sin CV</span>}<a href={`https://wa.me/${application.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"><MessageCircle size={16} />WhatsApp</a></div></article>) : <Empty icon={UserRound} title="Aún no hay candidatos aquí" text="Las nuevas solicitudes aparecerán automáticamente con sus datos y CV." />}</section></>;
}

function ContentSection({ settings, setSettings, onSave, onUpload, busy, dirty }: {
  settings: SiteSettings; setSettings: (settings: SiteSettings) => void; onSave: (event: FormEvent<HTMLFormElement>) => void;
  onUpload: (slot: 'hero' | 'transport' | 'operations', file: File) => void; busy: string; dirty: boolean;
}) {
  const set = (field: keyof SiteSettings, value: string) => setSettings({ ...settings, [field]: value });
  return <><div className="portal-page-heading compact"><div><p>Editor protegido</p><h1>Contenido y fotografías</h1><span>Actualiza lo primordial sin afectar el diseño ni el funcionamiento.</span></div><Link className="portal-secondary" href="/" target="_blank">Vista pública<ArrowUpRight size={17} /></Link></div>
    <form className="content-editor" onSubmit={onSave}><section className="portal-panel editor-panel"><div className="editor-section-head"><span>01</span><div><h2>Portada en español</h2><p>El mensaje principal que ven primero tus visitantes.</p></div></div><div className="editor-grid"><label>Primera línea<input value={settings.heroLine1Es} onChange={(event) => set('heroLine1Es', event.target.value)} maxLength={80} required /></label><label>Texto destacado<input value={settings.heroAccentEs} onChange={(event) => set('heroAccentEs', event.target.value)} maxLength={80} required /></label><label className="wide">Última línea<input value={settings.heroLine2Es} onChange={(event) => set('heroLine2Es', event.target.value)} maxLength={100} required /></label><label className="wide">Descripción<textarea rows={4} value={settings.heroLeadEs} onChange={(event) => set('heroLeadEs', event.target.value)} maxLength={320} required /></label></div></section>
      <section className="portal-panel editor-panel"><div className="editor-section-head"><span>02</span><div><h2>Portada en inglés</h2><p>Mantén la experiencia bilingüe actualizada.</p></div></div><div className="editor-grid"><label>First line<input value={settings.heroLine1En} onChange={(event) => set('heroLine1En', event.target.value)} maxLength={80} required /></label><label>Highlighted text<input value={settings.heroAccentEn} onChange={(event) => set('heroAccentEn', event.target.value)} maxLength={80} required /></label><label className="wide">Last line<input value={settings.heroLine2En} onChange={(event) => set('heroLine2En', event.target.value)} maxLength={100} required /></label><label className="wide">Description<textarea rows={4} value={settings.heroLeadEn} onChange={(event) => set('heroLeadEn', event.target.value)} maxLength={320} required /></label></div></section>
      <section className="portal-panel editor-panel"><div className="editor-section-head"><span>03</span><div><h2>Contacto</h2><p>Estos datos aparecen en los botones y formularios.</p></div></div><div className="editor-grid three"><label>Teléfono<input value={settings.contactPhone} onChange={(event) => set('contactPhone', event.target.value)} required /></label><label>WhatsApp<input value={settings.contactWhatsapp} onChange={(event) => set('contactWhatsapp', event.target.value)} inputMode="numeric" required /></label><label>Correo<input value={settings.contactEmail} onChange={(event) => set('contactEmail', event.target.value)} type="email" required /></label></div></section>
      <div className="content-save-bar"><span className={dirty ? 'is-dirty' : ''}><Check size={17} />{dirty ? 'Tienes cambios de texto sin guardar.' : 'Todos los cambios de texto están guardados.'}</span><button type="submit" className="portal-primary" disabled={busy === 'settings' || !dirty}>{busy === 'settings' ? <LoaderCircle className="spin" size={18} /> : <Save size={18} />}Guardar textos</button></div></form>
    <section className="portal-panel photo-editor"><div className="editor-section-head"><span>04</span><div><h2>Fotografías principales</h2><p>Las imágenes se optimizan automáticamente para que la página siga rápida.</p></div></div><div className="photo-slot-grid"><PhotoSlot title="Portada" hint="Vertical o cuadrada · equipo o personal" url={settings.heroImageUrl || '/media/ms-hero-960.webp'} busy={busy === 'image-hero'} onFile={(file) => onUpload('hero', file)} /><PhotoSlot title="Transporte" hint="Horizontal · vans o llegada de personal" url={settings.transportImageUrl || '/media/transport-main-960.webp'} busy={busy === 'image-transport'} onFile={(file) => onUpload('transport', file)} /><PhotoSlot title="Operaciones" hint="Horizontal · almacén o proyecto" url={settings.operationsImageUrl || '/media/service-labeling-960.webp'} busy={busy === 'image-operations'} onFile={(file) => onUpload('operations', file)} /></div></section></>;
}

function PhotoSlot({ title, hint, url, busy, onFile }: { title: string; hint: string; url: string; busy: boolean; onFile: (file: File) => void }) {
  return <article className="photo-slot"><div><img src={url} alt="" /></div><h3>{title}</h3><p>{hint}</p><label className={busy ? 'disabled' : ''}>{busy ? <LoaderCircle className="spin" size={17} /> : <Upload size={17} />}{busy ? 'Optimizando…' : 'Reemplazar foto'}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={busy} onChange={(event) => { const file = event.target.files?.[0]; if (file) onFile(file); event.currentTarget.value = ''; }} /></label></article>;
}

function JobEditor({ job, setJob, onClose, onSave, busy }: { job: EditableJob; setJob: (job: EditableJob) => void; onClose: () => void; onSave: (event: FormEvent<HTMLFormElement>) => void; busy: boolean }) {
  const set = <K extends keyof EditableJob>(field: K, value: EditableJob[K]) => setJob({ ...job, [field]: value });
  return <div className="portal-modal-backdrop" role="presentation"><section className="job-editor-modal" role="dialog" aria-modal="true" aria-labelledby="job-editor-title"><header><div><p>{job.id ? 'Editar vacante' : 'Nueva vacante'}</p><h2 id="job-editor-title">{job.titleEs || 'Información del puesto'}</h2></div><button type="button" onClick={onClose} aria-label="Cerrar editor"><X size={21} /></button></header><form onSubmit={onSave}><div className="job-editor-body"><fieldset><legend><span>01</span>Información básica</legend><div className="editor-grid"><label>Título en español<input value={job.titleEs} onChange={(event) => set('titleEs', event.target.value)} maxLength={120} autoFocus required /></label><label>Title in English<input value={job.titleEn} onChange={(event) => set('titleEn', event.target.value)} maxLength={120} required /></label><label className="wide">Resumen en español<textarea rows={3} value={job.summaryEs} onChange={(event) => set('summaryEs', event.target.value)} maxLength={300} /></label><label className="wide">Summary in English<textarea rows={3} value={job.summaryEn} onChange={(event) => set('summaryEn', event.target.value)} maxLength={300} /></label></div></fieldset><fieldset><legend><span>02</span>Condiciones</legend><div className="editor-grid three"><label>Ubicación<input value={job.location} onChange={(event) => set('location', event.target.value)} /></label><label>Turno<input value={job.shift} onChange={(event) => set('shift', event.target.value)} /></label><label>Tipo de empleo<select value={job.employmentType} onChange={(event) => set('employmentType', event.target.value)}><option>Temporal / proyecto</option><option>Temp-to-hire</option><option>Tiempo completo</option><option>Medio tiempo</option><option>Contratación directa</option></select></label><label>Sueldo mínimo<input type="number" min="0" step="0.25" value={job.payMin ?? ''} onChange={(event) => set('payMin', event.target.value ? Number(event.target.value) : null)} /></label><label>Sueldo máximo<input type="number" min="0" step="0.25" value={job.payMax ?? ''} onChange={(event) => set('payMax', event.target.value ? Number(event.target.value) : null)} /></label><label>Vacantes disponibles<input type="number" min="1" max="500" value={job.openings} onChange={(event) => set('openings', Number(event.target.value))} /></label><label>Fecha de cierre<input type="date" value={job.closesAt?.slice(0, 10) || ''} onChange={(event) => set('closesAt', event.target.value || null)} /></label><label className="check-field"><input type="checkbox" checked={job.featured} onChange={(event) => set('featured', event.target.checked)} /><span>Mostrar como destacada</span></label></div></fieldset><fieldset><legend><span>03</span>Descripción y requisitos</legend><div className="editor-grid"><label className="wide">Descripción en español<textarea rows={5} value={job.descriptionEs} onChange={(event) => set('descriptionEs', event.target.value)} maxLength={5000} /></label><label className="wide">Description in English<textarea rows={5} value={job.descriptionEn} onChange={(event) => set('descriptionEn', event.target.value)} maxLength={5000} /></label><label>Requisitos en español <small>Uno por línea</small><textarea rows={6} value={job.requirementsEs} onChange={(event) => set('requirementsEs', event.target.value)} maxLength={3000} /></label><label>Requirements in English <small>One per line</small><textarea rows={6} value={job.requirementsEn} onChange={(event) => set('requirementsEn', event.target.value)} maxLength={3000} /></label></div></fieldset></div><footer><button type="button" className="portal-secondary" onClick={onClose}>Cancelar</button><label>Estado<select value={job.status} onChange={(event) => set('status', event.target.value as JobStatus)}><option value="draft">Guardar como borrador</option><option value="published">Publicar en la página</option><option value="closed">Cerrar vacante</option></select></label><button type="submit" className="portal-primary" disabled={busy}>{busy ? <LoaderCircle className="spin" size={18} /> : <Save size={18} />}{job.status === 'published' ? 'Guardar y publicar' : 'Guardar vacante'}</button></footer></form></section></div>;
}

function Status({ kind, label }: { kind: string; label: string }) { return <span className={`portal-status ${kind}`}><i />{label}</span>; }
function Empty({ icon: Icon, title, text, action, onAction }: { icon: typeof UsersRound; title: string; text: string; action?: string; onAction?: () => void }) { return <div className="portal-empty"><span><Icon size={25} /></span><h3>{title}</h3><p>{text}</p>{action && onAction && <button type="button" onClick={onAction}>{action}</button>}</div>; }
function initials(value: string) { return value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'MS'; }
function relativeDate(value: string) { const days = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86400000)); return days === 0 ? 'hoy' : days === 1 ? 'ayer' : `hace ${days} días`; }
function isPublicJob(job: JobRecord) {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  return job.status === 'published' && (!job.closesAt || job.closesAt.slice(0, 10) >= today);
}

function emptyJob(): EditableJob {
  return { id: '', slug: '', titleEs: '', titleEn: '', summaryEs: '', summaryEn: '', descriptionEs: '', descriptionEn: '', requirementsEs: '', requirementsEn: '', location: 'Laredo, TX', shift: 'Por confirmar', employmentType: 'Temporal / proyecto', payMin: null, payMax: null, payUnit: 'hora', openings: 1, status: 'draft', featured: false, sortOrder: 0, publishedAt: null, closesAt: null };
}
function toEditableJob(job: JobRecord): EditableJob {
  return {
    id: job.id, slug: job.slug, titleEs: job.titleEs, titleEn: job.titleEn,
    summaryEs: job.summaryEs, summaryEn: job.summaryEn, descriptionEs: job.descriptionEs,
    descriptionEn: job.descriptionEn, requirementsEs: job.requirementsEs, requirementsEn: job.requirementsEn,
    location: job.location, shift: job.shift, employmentType: job.employmentType, payMin: job.payMin,
    payMax: job.payMax, payUnit: job.payUnit, openings: job.openings, status: job.status,
    featured: job.featured, sortOrder: job.sortOrder, publishedAt: job.publishedAt, closesAt: job.closesAt,
  };
}

async function optimizeImage(file: File) {
  if (!file.type.startsWith('image/')) throw new Error('Selecciona una imagen válida.');
  if (file.size > 25 * 1024 * 1024) throw new Error('La fotografía original no puede superar 25 MB.');
  let bitmap: ImageBitmap;
  try { bitmap = await createImageBitmap(file); } catch { throw new Error('No pudimos leer esa imagen. Usa JPG, PNG, WebP o AVIF.'); }
  if (bitmap.width * bitmap.height > 80_000_000) { bitmap.close(); throw new Error('La fotografía tiene demasiados píxeles para procesarse de forma segura.'); }
  const maxWidth = 2200; const maxHeight = 1800;
  const scale = Math.min(1, maxWidth / bitmap.width, maxHeight / bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('No pudimos procesar esta imagen.');
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.86));
  if (!blob) throw new Error('No pudimos optimizar esta imagen.');
  return new File([blob], `${file.name.replace(/\.[^.]+$/, '') || 'foto'}.webp`, { type: 'image/webp' });
}
