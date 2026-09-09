import type { Metadata } from 'next';
import InviteForm from './invite-form';
export const metadata:Metadata={title:'Activar cuenta | Multiservices Laredo',robots:{index:false,follow:false},referrer:'no-referrer'};
export default function Page(){return <main className="portal-access-page"><section><p>Invitación del administrador</p><h1>Activa tu cuenta.</h1><InviteForm /></section></main>;}
