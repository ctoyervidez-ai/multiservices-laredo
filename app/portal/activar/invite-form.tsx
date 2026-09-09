'use client';
import { FormEvent,useEffect,useState } from 'react';
import Link from '@/app/site-link';
export default function InviteForm(){const [token,setToken]=useState(''),[message,setMessage]=useState(''),[done,setDone]=useState(false),[busy,setBusy]=useState(false);
  useEffect(()=>{
    // The invitation fragment is available only after browser hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToken(new URLSearchParams(window.location.hash.slice(1)).get('token')||'');window.history.replaceState(null,'',window.location.pathname);
  },[]);
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setMessage('');const form=new FormData(e.currentTarget);try{const r=await fetch('/api/portal/auth/invite',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token,displayName:form.get('name'),password:form.get('password'),confirmPassword:form.get('confirm')})});const result=await r.json() as {error?:string};if(!r.ok)throw new Error(result.error);setDone(true);setToken('');setMessage('Cuenta activada. Ya puedes iniciar sesión con el correo de la invitación.');}catch(error){setMessage(error instanceof Error?error.message:'No pudimos activar la cuenta.');}finally{setBusy(false);}}
  return <>{!done&&<form onSubmit={submit} className="portal-auth-form"><label className="portal-auth-field">Tu nombre<input name="name" autoComplete="name" required minLength={2} maxLength={80}/></label><label className="portal-auth-field">Contraseña<input name="password" type="password" autoComplete="new-password" required minLength={15} maxLength={128}/></label><label className="portal-auth-field">Repetir contraseña<input name="confirm" type="password" autoComplete="new-password" required minLength={15} maxLength={128}/></label><p>El enlace vence en 48 horas. Usa una contraseña de al menos 15 caracteres.</p><button className="portal-auth-submit" disabled={!token||busy}>{busy?'Activando…':'Activar mi cuenta'}</button>{!token&&<p>Abre el enlace completo que te compartió tu administrador.</p>}</form>}{message&&<p role="status">{message}</p>}<Link href="/portal">Iniciar sesión</Link></>;
}
