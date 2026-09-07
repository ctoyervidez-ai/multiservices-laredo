'use client';
import { useEffect, useState } from 'react';
type Content = { defaults: Record<string,string>; values: Record<string,string>; revision: number };
const groups: Record<string,string> = { services: 'Servicios', industries:'Industrias', process:'Proceso', faq:'Preguntas frecuentes', transport:'Transporte', employer:'Empresas', candidate:'Candidatos', hero:'Portada', footer:'Pie de página' };
export default function TextEditor({onDirty}:{onDirty:(dirty:boolean)=>void}) {
  const [data,setData] = useState<Content|null>(null), [values,setValues] = useState<Record<string,string>>({});
  const [language,setLanguage] = useState('es'), [query,setQuery] = useState(''), [message,setMessage] = useState(''), [busy,setBusy] = useState(false);
  const dirty = !!data && JSON.stringify(data.values) !== JSON.stringify(values);
  useEffect(()=>{onDirty(dirty);return()=>onDirty(false);},[dirty,onDirty]);
  async function reload() {
    if (dirty && !window.confirm('Hay textos sin guardar. ¿Descartar el borrador y cargar la versión actual?')) return;
    const response = await fetch('/api/portal/content');
    const result = await response.json() as Content & { error?: string };
    if (!response.ok) { setMessage(result.error || 'No pudimos cargar.'); return; }
    setData(result); setValues(result.values); setMessage('');
  }
  useEffect(() => { fetch('/api/portal/content').then(async response => {
    const result = await response.json() as Content & {error?:string};
    if (!response.ok) throw new Error(result.error); setData(result);setValues(result.values);
  }).catch(e=>setMessage(e.message)); }, []);
  useEffect(() => { const warn=(e:BeforeUnloadEvent)=>{if(dirty){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn); },[dirty]);
  async function save() {
    if (!data) return;setBusy(true);setMessage('');
    try {const response=await fetch('/api/portal/content',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({values,revision:data.revision})});const result=await response.json() as {error?:string;revision:number};if(!response.ok)throw new Error(result.error);setData({...data,values,revision:result.revision});setMessage('Textos guardados. Ya están disponibles en la página pública.');}catch(e){setMessage(e instanceof Error?e.message:'No pudimos guardar.');}finally{setBusy(false);}
  }
  return <section className="portal-panel operations-panel"><h1>Textos de la página</h1><p>Edita servicios, preguntas, transporte y demás secciones en ambos idiomas. La portada principal y los datos de contacto se administran en Contenido y fotos.</p><div className="operations-filters"><label>Idioma<select value={language} onChange={e=>setLanguage(e.target.value)}><option value="es">Español</option><option value="en">English</option></select></label><label>Buscar texto<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ej. Staffing, transporte…" /></label></div>
    {message && <p role="status">{message}</p>}{!data && <p>Cargando textos…</p>}
    {data && Object.entries(data.defaults).filter(([key,value])=>key.startsWith(`${language}.`) && !/\.(heroLine1|heroAccent|heroLine2|heroLead)$/.test(key) && `${key} ${values[key]||value}`.toLowerCase().includes(query.toLowerCase())).map(([key,value])=><label className="content-field" key={key}><span>{Object.entries(groups).find(([prefix])=>key.split('.')[1].startsWith(prefix))?.[1] || 'Información y botones'} · {value.slice(0,70)}</span><textarea rows={value.length>120?3:2} maxLength={5000} value={values[key]??value} onChange={e=>setValues({...values,[key]:e.target.value})} /></label>)}
    <div className="portal-sticky-actions"><span>{dirty?'Cambios sin guardar':'Sin cambios pendientes'}</span><button className="portal-secondary" disabled={busy} onClick={()=>void reload()}>Recargar textos</button><button className="portal-primary" disabled={!dirty||busy} onClick={()=>void save()}>{busy?'Guardando…':'Guardar textos'}</button></div>
  </section>;
}
