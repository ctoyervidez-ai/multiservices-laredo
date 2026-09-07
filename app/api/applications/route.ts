import { ensureDatabase, getD1, getFilesBucket, getSiteTenantId } from '@/db';
import { withinSubmissionLimits } from '@/lib/submission-limits';
import { notificationStatements, tryNotifications } from '@/lib/notifications';
import { businessDate } from '@/lib/site-repository';
import { formDataWithLimit, PayloadTooLargeError, validateBrowserMutation } from '@/lib/request-security';

export const dynamic = 'force-dynamic';

const MAX_RESUME_BYTES = 8 * 1024 * 1024;
const MAX_REQUEST_BYTES = MAX_RESUME_BYTES + 256 * 1024;

function value(form: FormData, key: string, max = 500) {
  return String(form.get(key) || '').trim().slice(0, max);
}

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { 'cache-control': 'no-store' } });
}

export async function POST(request: Request) {
  let resumeKey: string | null = null;
  try {
    if (!validateBrowserMutation(request, 'multipart/form-data')) {
      return json({ error: 'Solicitud no permitida.' }, 403);
    }
    let form: FormData;
    try {
      form = await formDataWithLimit(request, MAX_REQUEST_BYTES);
    } catch (error) {
      if (error instanceof PayloadTooLargeError) return json({ error: 'La solicitud es demasiado grande.' }, 413);
      return json({ error: 'El formulario no tiene un formato válido.' }, 400);
    }
    if (value(form, 'website', 120)) return json({ ok: true, reference: 'RECIBIDA' });

    const startedAt = Number(value(form, 'startedAt', 20));
    if (!Number.isFinite(startedAt) || Date.now() - startedAt < 1200) {
      return json({ error: 'Espera un momento y vuelve a enviar la solicitud.' }, 400);
    }

    const submissionKey = value(form, 'submissionKey', 80) || crypto.randomUUID();
    const fullName = value(form, 'name', 120);
    const phone = value(form, 'phone', 40);
    const email = value(form, 'email', 160).toLowerCase();
    const jobId = value(form, 'jobId', 80) || null;
    let roleInterest = value(form, 'role', 140);
    const city = value(form, 'city', 100);
    const availability = value(form, 'availability', 160);
    const message = value(form, 'message', 1200);
    const consent = value(form, 'consent', 10) === 'yes';

    if (fullName.length < 2 || phone.length < 7 || !/^\S+@\S+\.\S+$/.test(email) || !consent) {
      return json({ error: 'Revisa tu nombre, teléfono, correo y consentimiento.' }, 400);
    }

    await ensureDatabase();
    const database = getD1();
    const tenantId = getSiteTenantId();
    if (jobId) {
      const job = await database.prepare(`SELECT title_es AS titleEs FROM jobs
        WHERE id = ? AND tenant_id = ? AND status = 'published'
          AND (closes_at IS NULL OR substr(closes_at, 1, 10) >= ?) LIMIT 1`)
        .bind(jobId, tenantId, businessDate()).first<{ titleEs: string }>();
      if (!job) return json({ error: 'Esta vacante ya no está disponible.' }, 409);
      roleInterest = job.titleEs;
    }
    if (roleInterest.length < 2) return json({ error: 'Selecciona la vacante o posición de interés.' }, 400);

    const duplicate = await database.prepare('SELECT reference FROM applications WHERE tenant_id = ? AND submission_key = ? LIMIT 1')
      .bind(tenantId, submissionKey).first<{ reference: string }>();
    if (duplicate) return json({ ok: true, reference: duplicate.reference });

    if (!await withinSubmissionLimits(request, database, tenantId, email)) {
      return json({ error: 'Recibimos varios intentos. Espera unos minutos antes de volver a enviar.' }, 429);
    }

    const resume = form.get('resume');
    let resumeFilename: string | null = null;
    if (resume instanceof File && resume.size > 0) {
      const pdf = resume.type === 'application/pdf' && resume.name.toLowerCase().endsWith('.pdf');
      if (!pdf || resume.size > MAX_RESUME_BYTES) {
        return json({ error: 'El CV debe ser un archivo PDF de máximo 8 MB.' }, 400);
      }
      const resumeBytes = await resume.arrayBuffer();
      const signature = new TextDecoder().decode(resumeBytes.slice(0, 5));
      const trailer = new TextDecoder().decode(resumeBytes.slice(Math.max(0, resumeBytes.byteLength - 2048)));
      if (signature !== '%PDF-' || !trailer.includes('%%EOF')) return json({ error: 'El archivo seleccionado no es un PDF válido.' }, 400);
      resumeFilename = resume.name.replace(/[^a-zA-Z0-9._ -]/g, '').slice(0, 100) || 'curriculum.pdf';
      resumeKey = `tenants/${tenantId}/resumes/${crypto.randomUUID()}.pdf`;
      await getFilesBucket().put(resumeKey, resumeBytes, {
        httpMetadata: { contentType: 'application/pdf' },
        customMetadata: { source: 'website-application' },
      });
    }

    const id = crypto.randomUUID();
    const date = new Date();
    const reference = `MSL-${date.toISOString().slice(0, 10).replaceAll('-', '')}-${id.slice(0, 6).toUpperCase()}`;
    const now = date.toISOString();
    try {
      await database.batch([database.prepare(`INSERT INTO applications (
      id, reference, submission_key, tenant_id, job_id, role_interest, full_name, phone,
      email, city, availability, message, resume_key, resume_filename, status,
      source, consent_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', 'website', ?, ?, ?)`)
      .bind(id, reference, submissionKey, tenantId, jobId, roleInterest, fullName, phone,
        email, city, availability, message, resumeKey, resumeFilename, now, now, now),
      ...notificationStatements(tenantId, id, reference, 'application', email, value(form, 'language', 2), now),
      ]);
    } catch (error) {
      const raced = await database.prepare('SELECT id, reference FROM applications WHERE tenant_id = ? AND submission_key = ? LIMIT 1')
        .bind(tenantId, submissionKey).first<{ id: string; reference: string }>();
      if (!raced) throw error;
      if (resumeKey && raced.id !== id) {
        try { await getFilesBucket().delete(resumeKey); } catch { /* unreferenced file cleanup */ }
      }
      resumeKey = null;
      return json({ ok: true, reference: raced.reference });
    }
    resumeKey = null; // The committed application now owns the uploaded file.
    await tryNotifications(tenantId, id);

    return json({ ok: true, reference }, 201);
  } catch (error) {
    if (resumeKey) {
      try { await getFilesBucket().delete(resumeKey); } catch { /* best-effort cleanup */ }
    }
    if (error instanceof PayloadTooLargeError) return json({ error: 'La solicitud es demasiado grande.' }, 413);
    console.error('application_submission_failed', error);
    return json({ error: 'No pudimos guardar tu solicitud. Inténtalo nuevamente.' }, 500);
  }
}
