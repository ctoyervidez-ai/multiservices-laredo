import { ensureDatabase,getD1 } from '@/db';
import { createPortalInvite,getPortalIdentityFromCookie,PortalAuthError } from '@/lib/portal-auth';
import { getPortalContext } from '@/lib/site-repository';
import { jsonWithLimit,validateBrowserMutation } from '@/lib/request-security';
export const dynamic='force-dynamic';
const respond=(data:unknown,status=200)=>Response.json(data,{status,headers:{'cache-control':'no-store'}});
async function authorize(request:Request){await ensureDatabase();const c=await getPortalContext(await getPortalIdentityFromCookie(request.headers.get('cookie'),new URL(request.url).host));return c?.authorized&&c.role==='owner'?c:null;}
export async function GET(request:Request){const c=await authorize(request);if(!c)return respond({error:'Solo el administrador puede gestionar el equipo.'},403);const db=getD1();const [users,invites,activity,pending]=await Promise.all([
  db.prepare('SELECT u.id,u.email,u.display_name AS displayName,u.status,u.auth_version AS version,m.role FROM portal_users u JOIN memberships m ON m.user_id=u.id AND m.tenant_id=u.tenant_id WHERE u.tenant_id=? ORDER BY u.created_at').bind(c.tenantId).all(),
  db.prepare('SELECT id,email,role,expires_at AS expiresAt FROM portal_invites WHERE tenant_id=? AND used_at IS NULL AND expires_at>? ORDER BY created_at DESC').bind(c.tenantId,new Date().toISOString()).all(),
  db.prepare('SELECT actor_email AS actorEmail,summary,created_at AS createdAt FROM audit_logs WHERE tenant_id=? ORDER BY created_at DESC LIMIT 100').bind(c.tenantId).all(),
  db.prepare("SELECT (SELECT COUNT(*) FROM applications WHERE tenant_id=? AND status='new') AS candidates,(SELECT COUNT(*) FROM inquiries WHERE tenant_id=? AND status='new') AS companies").bind(c.tenantId,c.tenantId).first(),
]);return respond({users:users.results,invites:invites.results,activity:activity.results,pending});}
export async function POST(request:Request){if(!validateBrowserMutation(request,'application/json'))return respond({error:'Solicitud no permitida.'},403);const c=await authorize(request);if(!c)return respond({error:'Solo el administrador puede gestionar el equipo.'},403);
  try{const data=await jsonWithLimit<Record<string,unknown>>(request,4096),db=getD1(),now=new Date().toISOString();let result:unknown={};let summary='';let entityId=String(data.id||'');
    if(data.action==='invite'){const invite=await createPortalInvite(c.tenantId,data.email,String(data.role));result=invite;entityId=invite.id;summary='Creó una invitación de acceso';}
    else if(data.action==='revoke_invite'){await db.prepare('UPDATE portal_invites SET used_at=? WHERE id=? AND tenant_id=? AND used_at IS NULL').bind(now,entityId,c.tenantId).run();summary='Revocó una invitación';}
    else if(data.action==='update_user'){
      if(!['editor','recruiter'].includes(String(data.role))||!['active','disabled'].includes(String(data.status))||!Number.isSafeInteger(data.version))return respond({error:'Permisos inválidos.'},400);
      // Owner accounts cannot be demoted or disabled from this interface.
      const [updated]=await db.batch([
        db.prepare(`UPDATE portal_users SET status=?,auth_version=auth_version+1,updated_at=? WHERE id=? AND tenant_id=? AND auth_version=?
          AND EXISTS (SELECT 1 FROM memberships WHERE user_id=portal_users.id AND tenant_id=portal_users.tenant_id AND role!='owner')`)
          .bind(data.status,now,entityId,c.tenantId,data.version),
        db.prepare(`UPDATE memberships SET role=? WHERE user_id=? AND tenant_id=? AND role!='owner'
          AND changes() > 0 AND EXISTS (SELECT 1 FROM portal_users WHERE id=? AND tenant_id=? AND updated_at=? AND auth_version=?)`).bind(data.role,entityId,c.tenantId,entityId,c.tenantId,now,Number(data.version)+1),
      ]);if(!updated.meta.changes)return respond({error:'La cuenta cambió o está protegida. Actualiza la lista.'},409);summary='Actualizó permisos o acceso de un colaborador';
    }else return respond({error:'Acción inválida.'},400);
    await db.prepare(`INSERT INTO audit_logs (id,tenant_id,actor_id,actor_email,action,entity_type,entity_id,summary,created_at) VALUES (?,?,?,?,'team.updated','team',?,?,?)`).bind(crypto.randomUUID(),c.tenantId,c.user.userId,c.user.email,entityId,summary,now).run();return respond({ok:true,...result as object});
  }catch(e){return respond({error:e instanceof PortalAuthError?e.message:'No pudimos completar el cambio.'},e instanceof PortalAuthError?e.status:400);}
}
