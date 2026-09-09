import { acceptPortalInvite,PortalAuthError } from '@/lib/portal-auth';
import { jsonWithLimit,validateBrowserMutation } from '@/lib/request-security';
export const dynamic='force-dynamic';
export async function POST(request:Request){const headers={'cache-control':'no-store'};if(!validateBrowserMutation(request,'application/json'))return Response.json({error:'Solicitud no permitida.'},{status:403,headers});try{const data=await jsonWithLimit<Record<string,unknown>>(request,4096);await acceptPortalInvite(request,data);return Response.json({ok:true},{headers});}catch(e){return Response.json({error:e instanceof PortalAuthError?e.message:'No pudimos activar la cuenta.'},{status:e instanceof PortalAuthError?e.status:400,headers});}}
