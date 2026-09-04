'use client';

import { CheckCircle2, FileText, LoaderCircle, Send } from 'lucide-react';
import Link from '@/app/site-link';
import { FormEvent, useEffect, useRef, useState } from 'react';
import type { PublicJob } from '@/lib/portal-types';

export default function ApplicationForm({ job, language }: { job: PublicJob; language: 'es' | 'en' }) {
  const [state, setState] = useState<{ kind: 'idle' | 'sending' | 'success' | 'error'; message?: string; reference?: string }>({ kind: 'idle' });
  const startedAt = useRef(0);
  const submissionKey = useRef('');
  const es = language === 'es';
  useEffect(() => { startedAt.current = Date.now(); submissionKey.current = crypto.randomUUID(); }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ kind: 'sending' });
    const form = new FormData(event.currentTarget);
    if (!startedAt.current) startedAt.current = Date.now() - 1500;
    if (!submissionKey.current) submissionKey.current = crypto.randomUUID();
    form.set('jobId', job.id);
    form.set('role', es ? job.titleEs : job.titleEn);
    form.set('startedAt', String(startedAt.current));
    form.set('submissionKey', submissionKey.current);
    try {
      const result = await fetch('/api/applications', { method: 'POST', body: form });
      const data = await result.json() as { error?: string; reference?: string };
      if (!result.ok) throw new Error(data.error || (es ? 'No pudimos enviar tu solicitud.' : 'We could not submit your application.'));
      setState({ kind: 'success', reference: data.reference });
    } catch (error) {
      setState({ kind: 'error', message: error instanceof Error ? error.message : (es ? 'Inténtalo nuevamente.' : 'Please try again.') });
    }
  }

  if (state.kind === 'success') return <div className="application-success" role="status"><CheckCircle2 size={38} /><h3>{es ? 'Recibimos tu solicitud.' : 'We received your application.'}</h3><p>{es ? 'El equipo revisará tu información y se pondrá en contacto contigo si tu perfil coincide.' : 'The team will review your information and contact you if your profile is a match.'}</p><strong>{es ? 'Folio' : 'Reference'}: {state.reference}</strong><Link href="/vacantes">{es ? 'Ver otras vacantes' : 'View other openings'}</Link></div>;

  return <form className="real-application-form" onSubmit={submit}>
    <div className="application-field-pair"><label>{es ? 'Nombre completo' : 'Full name'}<input name="name" autoComplete="name" required maxLength={120} /></label><label>{es ? 'Teléfono' : 'Phone'}<input name="phone" type="tel" autoComplete="tel" required maxLength={40} /></label></div>
    <label>{es ? 'Correo electrónico' : 'Email'}<input name="email" type="email" autoComplete="email" required maxLength={160} /></label>
    <div className="application-field-pair"><label>{es ? 'Ciudad' : 'City'}<input name="city" autoComplete="address-level2" maxLength={100} /></label><label>{es ? 'Disponibilidad' : 'Availability'}<input name="availability" placeholder={es ? 'Ej. Inmediata, turno flexible' : 'E.g. Immediate, flexible shift'} maxLength={160} /></label></div>
    <label>{es ? 'Mensaje adicional' : 'Additional message'}<textarea name="message" rows={4} maxLength={1200} /></label>
    <label className="resume-upload"><FileText size={22} /><span><strong>{es ? 'Adjunta tu CV' : 'Attach your résumé'}</strong><small>PDF · {es ? 'máximo' : 'maximum'} 8 MB</small></span><input name="resume" type="file" accept="application/pdf,.pdf" /></label>
    <label className="application-consent"><input name="consent" type="checkbox" value="yes" required /><span>{es ? 'Autorizo a Multiservices Laredo a usar estos datos para evaluar mi solicitud y contactarme.' : 'I authorize Multiservices Laredo to use this information to evaluate my application and contact me.'}</span></label>
    <input className="application-honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
    {state.kind === 'error' && <p className="application-error" role="alert">{state.message}</p>}
    <button type="submit" disabled={state.kind === 'sending'}>{state.kind === 'sending' ? <><LoaderCircle className="spin" size={18} />{es ? 'Enviando…' : 'Submitting…'}</> : <>{es ? 'Enviar solicitud' : 'Submit application'}<Send size={17} /></>}</button>
    <small className="application-privacy">{es ? 'Tu CV se guarda de forma privada y solo el equipo autorizado puede verlo.' : 'Your résumé is stored privately and can only be viewed by authorized staff.'}</small>
  </form>;
}
