import { ensureDatabase, getD1, getSiteTenantId } from '@/db';
import { formDataWithLimit, PayloadTooLargeError, validateBrowserMutation } from '@/lib/request-security';
import { withinSubmissionLimits } from '@/lib/submission-limits';
import { notificationStatements, tryNotifications } from '@/lib/notifications';

export const dynamic = 'force-dynamic';
const respond = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'cache-control': 'no-store' } });

export async function POST(request: Request) {
  if (!validateBrowserMutation(request, 'multipart/form-data')) return respond({ error: 'Solicitud no permitida.' }, 403);
  try {
    const form = await formDataWithLimit(request, 16 * 1024);
    const value = (key: string, max: number) => String(form.get(key) || '').trim().slice(0, max);
    if (value('website', 120)) return respond({ ok: true, reference: 'RECIBIDA' });
    const startedAt = Number(value('startedAt', 20));
    if (!Number.isFinite(startedAt) || startedAt <= 0 || Date.now() - startedAt < 1200) return respond({ error: 'Espera un momento y vuelve a intentar.' }, 400);
    const name = value('name', 120), company = value('company', 160), phone = value('phone', 40);
    const email = value('email', 160).toLowerCase(), need = value('need', 2000), message = value('message', 1200);
    const submissionKey = value('submissionKey', 80);
    if (name.length < 2 || company.length < 2 || phone.replace(/\D/g, '').length < 7 || !/^\S+@\S+\.\S+$/.test(email) || need.length < 5 || value('consent', 10) !== 'yes' || !/^[\w-]{16,80}$/.test(submissionKey)) {
      return respond({ error: 'Revisa tus datos, describe tu necesidad y acepta el uso de tus datos.' }, 400);
    }
    await ensureDatabase();
    const database = getD1(), tenantId = getSiteTenantId();
    const existing = () => database.prepare('SELECT reference FROM inquiries WHERE tenant_id = ? AND submission_key = ?').bind(tenantId, submissionKey).first<{ reference: string }>();
    const duplicate = await existing();
    if (duplicate) return respond({ ok: true, reference: duplicate.reference });
    if (!await withinSubmissionLimits(request, database, tenantId, email)) return respond({ error: 'Demasiados intentos. Inténtalo más tarde.' }, 429);
    const id = crypto.randomUUID(), now = new Date().toISOString();
    const reference = `EMP-${now.slice(0, 10).replaceAll('-', '')}-${id.slice(0, 8).toUpperCase()}`;
    try {
      await database.batch([
        database.prepare(`INSERT INTO inquiries (id, tenant_id, reference, submission_key, full_name, company, phone, email, need, message, consent_at, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
          .bind(id, tenantId, reference, submissionKey, name, company, phone, email, need, message, now, now, now),
        ...notificationStatements(tenantId, id, reference, 'inquiry', email, value('language', 2), now),
      ]);
    } catch (error) {
      const raced = await existing();
      if (raced) return respond({ ok: true, reference: raced.reference });
      throw error;
    }
    await tryNotifications(tenantId, id);
    return respond({ ok: true, reference }, 201);
  } catch (error) {
    if (error instanceof PayloadTooLargeError) return respond({ error: 'La solicitud es demasiado grande.' }, 413);
    console.error('inquiry_submission_failed');
    return respond({ error: 'No pudimos guardar tu solicitud. Inténtalo nuevamente.' }, 500);
  }
}
