'use client';
import { useCallback, useEffect, useState } from 'react';
import { Building2, Clock3, Mail, MessageCircle, Phone, Search, UserRound } from 'lucide-react';

type Inquiry = { id: string; reference: string; fullName: string; company: string; phone: string; email: string; need: string; message: string; status: string; updatedAt: string; createdAt: string };
type Operations = { inquiries: Inquiry[]; metrics: { event: string; total: number }[]; submissions: { kind: string; total: number }[]; notifications: { status: string; total: number }[]; emailConfigured: boolean; since: string };
const labels: Record<string, string> = { new: 'Nuevo', contacted: 'Contactado', proposal: 'Propuesta enviada', won: 'Cliente', lost: 'No continúa', archived: 'Archivado' };

export default function OperationsPanel() {
  const [data, setData] = useState<Operations | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const inquiries = data?.inquiries.filter(x => (filter === 'all' || x.status === filter) && `${x.company} ${x.fullName} ${x.reference} ${x.email}`.toLowerCase().includes(query.trim().toLowerCase())) || [];
  const refresh = useCallback(async () => {
    const response = await fetch('/api/portal/operations');
    const result = await response.json() as Operations & { error?: string };
    if (!response.ok) throw new Error(result.error || 'No pudimos cargar los datos.');
    setData(result);
  }, []);
  useEffect(() => {
    let active = true;
    fetch('/api/portal/operations').then(async response => {
      const result = await response.json() as Operations & { error?: string };
      if (!response.ok) throw new Error(result.error || 'No pudimos cargar los datos.');
      if (active) setData(result);
    }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (busy) return;
    const update = () => { if (document.visibilityState === 'visible') void refresh().catch(e => setError(e.message)); };
    const timer = window.setInterval(update, 60000);
    window.addEventListener('focus', update);
    return () => { clearInterval(timer); window.removeEventListener('focus', update); };
  }, [busy, refresh]);
  const action = async (payload: object) => {
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/portal/operations', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error(((await response.json()) as { error?: string }).error);
      await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : 'Inténtalo nuevamente.'); }
    finally { setBusy(false); }
  };
  return <>
    <div className="portal-page-heading compact"><div><p>Empresas y resultados</p><h1>Solicitudes que generan trabajo.</h1><span>Consulta prospectos, actividad de la página y avisos por correo.</span></div><button className="portal-secondary" disabled={busy} onClick={() => { setError(''); void refresh().catch(e => setError(e.message)); }}>Actualizar</button></div>
    {error && <p role="alert" className="application-error">{error}</p>}
    {!data ? <p role="status">Cargando…</p> : <>
      <section className="inquiries-section" aria-labelledby="inquiries-title">
        <div className="portal-panel-head"><div><h2 id="inquiries-title">Solicitudes de empresas</h2><span>Las 200 solicitudes más recientes, listas para darles seguimiento.</span></div><span className="inquiry-count" aria-live="polite">{inquiries.length} {inquiries.length === 1 ? 'solicitud' : 'solicitudes'}</span></div>
        <div className="portal-list-toolbar inquiry-toolbar">
          <label><Search size={18} aria-hidden="true" /><span className="sr-only">Buscar empresa, contacto, correo o folio</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar empresa, contacto o folio" /></label>
          <label className="inquiry-filter"><span className="sr-only">Filtrar solicitudes por estado</span><select value={filter} onChange={e => setFilter(e.target.value)}><option value="all">Todas las etapas</option>{Object.entries(labels).map(([id, label]) => <option value={id} key={id}>{label}</option>)}</select></label>
        </div>
        <div className="candidate-list inquiry-list">
          {inquiries.map(item => <article key={item.id}>
            <div className="candidate-main"><div className="candidate-avatar" aria-hidden="true"><Building2 size={19} /></div><div><span>{item.reference}</span><h2>{item.company}</h2><p><UserRound size={13} aria-hidden="true" />{item.fullName}</p></div></div>
            <div className="candidate-contact"><a href={`tel:${item.phone.replace(/[^+\d]/g, '')}`}><Phone size={15} aria-hidden="true" />{item.phone}</a><a href={`mailto:${item.email}`}><Mail size={15} aria-hidden="true" />{item.email}</a></div>
            <div className="candidate-message"><strong>Personal que necesita</strong>{item.need.length > 160 ? <details><summary>Ver solicitud completa</summary><p>{item.need}</p></details> : <p className="preserve-lines">{item.need}</p>}{item.message && <details><summary>Mensaje adicional</summary><p>{item.message}</p></details>}<small><Clock3 size={14} aria-hidden="true" /><time dateTime={item.createdAt}>Recibida el {new Date(item.createdAt).toLocaleDateString('es-US')}</time></small></div>
            <div className="candidate-actions"><label><span className="sr-only">Seguimiento de {item.company}</span><select value={item.status} disabled={busy} onChange={e => void action({ action: 'inquiry_status', id: item.id, expectedUpdatedAt: item.updatedAt, status: e.target.value })}>{Object.entries(labels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label><a href={`mailto:${item.email}`}><Mail size={16} aria-hidden="true" />Enviar correo</a><a href={`https://wa.me/${item.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"><MessageCircle size={16} aria-hidden="true" />WhatsApp</a></div>
          </article>)}
          {!inquiries.length && <div className="inquiry-empty"><Building2 size={32} aria-hidden="true" /><h3>{data.inquiries.length ? 'No hay coincidencias' : 'Aún no hay solicitudes de empresas'}</h3><p>{data.inquiries.length ? 'Prueba otro nombre o cambia el filtro de estado.' : 'Cuando una empresa solicite personal, sus datos aparecerán aquí.'}</p>{data.inquiries.length > 0 && <button className="portal-secondary" onClick={() => { setQuery(''); setFilter('all'); }}>Limpiar filtros</button>}</div>}
        </div>
      </section>
      <section className="portal-panel operations-panel"><h2>Últimos 30 días</h2><p>Desde {data.since} · fechas en UTC</p><div className="operations-metrics">
        {[['Vistas de páginas', data.metrics.find(x => x.event === 'page_view')?.total || 0], ['Solicitudes de candidatos', data.submissions.find(x => x.kind === 'applications')?.total || 0], ['Solicitudes de empresas', data.submissions.find(x => x.kind === 'inquiries')?.total || 0], ['Clics de contacto', data.metrics.filter(x => x.event !== 'page_view').reduce((sum, x) => sum + x.total, 0)]].map(([label, value]) => <article key={label}><strong>{value}</strong><span>{label}</span></article>)}
      </div><p>Las vistas no representan visitantes únicos. Un clic no confirma una conversación. La medición respeta las señales de no rastreo del navegador.</p></section>
      <section className="portal-panel operations-panel"><h2>Avisos por correo</h2><p>{data.emailConfigured ? 'Servicio conectado. Cada solicitud intenta enviar un aviso al equipo y una confirmación al solicitante.' : 'El servicio de correo aún no está conectado. Las solicitudes están guardadas y los avisos quedan pendientes.'}</p>
        <div className="operations-counts">{[['pending', 'Pendientes'], ['sending', 'En proceso o por reintentar'], ['accepted', 'Aceptados por el proveedor'], ['review', 'Requieren revisión']].map(([status, label]) => <span key={status}>{label}: <b>{data.notifications.find(x => x.status === status)?.total || 0}</b></span>)}</div>
        <p>La aceptación del proveedor no garantiza la llegada a la bandeja de entrada. Los envíos con resultado incierto de más de 23 horas requieren revisión para evitar duplicados.</p>
        <button className="portal-secondary" disabled={busy || !data.emailConfigured} onClick={() => void action({ action: 'retry_notifications' })}>{busy ? 'Procesando…' : 'Procesar hasta 4 avisos pendientes'}</button>
      </section>

    </>}
  </>;
}
