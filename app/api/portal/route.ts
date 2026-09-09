import { ensureDatabase, getD1 } from '@/db';
import { can } from '@/lib/portal-access';
import { getPortalIdentityFromCookie } from '@/lib/portal-auth';
import type { ApplicationStatus, JobStatus } from '@/lib/portal-types';
import { getPortalContext, getPortalSnapshot, slugify } from '@/lib/site-repository';
import { jsonWithLimit, PayloadTooLargeError, validateBrowserMutation } from '@/lib/request-security';

export const dynamic = 'force-dynamic';

const editableJobStatuses: JobStatus[] = ['draft', 'published', 'closed'];
const applicationStatuses: ApplicationStatus[] = ['new', 'reviewing', 'contacted', 'interview', 'hired', 'rejected', 'archived'];

function clean(value: unknown, max = 500) {
  return String(value ?? '').trim().slice(0, max);
}

function numberOrNull(value: unknown) {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 10000 ? Math.round(parsed * 100) / 100 : null;
}

function integerBetween(value: unknown, min: number, max: number, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
}

function response(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { 'cache-control': 'no-store' } });
}

async function authorize(request: Request) {
  await ensureDatabase();
  const context = await getPortalContext(await getPortalIdentityFromCookie(request.headers.get('cookie'), new URL(request.url).host));
  if (!context) return { error: response({ error: 'Inicia sesión para continuar.' }, 401) } as const;
  if (!context.authorized) return { error: response({ error: 'Tu cuenta no tiene acceso a este portal.' }, 403) } as const;
  return { context } as const;
}

export async function GET(request: Request) {
  const auth = await authorize(request);
  if ('error' in auth) return auth.error;
  return response({ snapshot: await getPortalSnapshot(auth.context) });
}

export async function POST(request: Request) {
  if (!validateBrowserMutation(request, 'application/json')) {
    return response({ error: 'Solicitud no permitida.' }, 403);
  }
  let payload: Record<string, unknown>;
  try {
    payload = await jsonWithLimit<Record<string, unknown>>(request, 128 * 1024);
  } catch (error) {
    if (error instanceof PayloadTooLargeError) return response({ error: 'La solicitud es demasiado grande.' }, 413);
    return response({ error: 'El formato de la solicitud no es válido.' }, 400);
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return response({ error: 'El formato de la solicitud no es válido.' }, 400);
  }
  const auth = await authorize(request);
  if ('error' in auth) return auth.error;
  const { context } = auth;

  try {
    const action = clean(payload.action, 60);
    const database = getD1();
    const now = new Date().toISOString();

    if (action === 'save_job') {
      if (!can(context.role, 'manageJobs')) return response({ error: 'No tienes permiso para editar vacantes.' }, 403);
      const data = (payload.job || {}) as Record<string, unknown>;
      const id = clean(data.id, 80) || crypto.randomUUID();
      const titleEs = clean(data.titleEs, 120);
      const titleEn = clean(data.titleEn, 120) || titleEs;
      if (titleEs.length < 2) return response({ error: 'Escribe el título de la vacante.' }, 400);
      const requestedStatus = clean(data.status, 20) as JobStatus;
      const status = editableJobStatuses.includes(requestedStatus) ? requestedStatus : 'draft';
      let slug = slugify(clean(data.slug, 90) || titleEs);
      const conflict = await database.prepare('SELECT id FROM jobs WHERE tenant_id = ? AND slug = ? AND id != ? LIMIT 1')
        .bind(context.tenantId, slug, id).first<{ id: string }>();
      if (conflict) slug = `${slug}-${id.slice(0, 5)}`;

      const existing = await database.prepare('SELECT id, status, published_at AS publishedAt FROM jobs WHERE tenant_id = ? AND id = ? LIMIT 1')
        .bind(context.tenantId, id).first<{ id: string; status: JobStatus; publishedAt: string | null }>();
      if (existing?.status === 'archived') return response({ error: 'La vacante está archivada y no puede editarse.' }, 409);
      const closesAtRaw = clean(data.closesAt, 40);
      if (closesAtRaw && !/^\d{4}-\d{2}-\d{2}$/.test(closesAtRaw)) return response({ error: 'La fecha de cierre no es válida.' }, 400);
      const values = {
        slug,
        titleEs,
        titleEn,
        summaryEs: clean(data.summaryEs, 300),
        summaryEn: clean(data.summaryEn, 300),
        descriptionEs: clean(data.descriptionEs, 5000),
        descriptionEn: clean(data.descriptionEn, 5000),
        requirementsEs: clean(data.requirementsEs, 3000),
        requirementsEn: clean(data.requirementsEn, 3000),
        location: clean(data.location, 140) || 'Laredo, TX',
        shift: clean(data.shift, 120) || 'Por confirmar',
        employmentType: clean(data.employmentType, 100) || 'Temporal / proyecto',
        payMin: numberOrNull(data.payMin),
        payMax: numberOrNull(data.payMax),
        payUnit: clean(data.payUnit, 30) || 'hora',
        openings: integerBetween(data.openings, 1, 500, 1),
        featured: data.featured === true ? 1 : 0,
        closesAt: closesAtRaw || null,
      };
      if (values.payMin !== null && values.payMax !== null && values.payMax < values.payMin) {
        return response({ error: 'El sueldo máximo no puede ser menor que el mínimo.' }, 400);
      }

      if (existing) {
        const mutation = database.prepare(`UPDATE jobs SET slug = ?, title_es = ?, title_en = ?, summary_es = ?, summary_en = ?,
          description_es = ?, description_en = ?, requirements_es = ?, requirements_en = ?, location = ?, shift = ?,
          employment_type = ?, pay_min = ?, pay_max = ?, pay_unit = ?, openings = ?, status = ?, featured = ?,
          closes_at = ?, published_at = ?, updated_at = ?, updated_by = ? WHERE tenant_id = ? AND id = ? AND updated_at = ?`)
          .bind(values.slug, values.titleEs, values.titleEn, values.summaryEs, values.summaryEn,
            values.descriptionEs, values.descriptionEn, values.requirementsEs, values.requirementsEn,
            values.location, values.shift, values.employmentType, values.payMin, values.payMax, values.payUnit,
            values.openings, status, values.featured, values.closesAt,
            status === 'published' ? existing.publishedAt || now : existing.publishedAt,
            now, context.user.userId, context.tenantId, id, clean(data.updatedAt, 40));
        const [result] = await database.batch([mutation, auditStatement(database, context, 'job.updated', 'job', id, `Actualizó la vacante ${titleEs}`, now)]);
        if (!result.meta.changes) return response({ error: 'La vacante cambió en otro dispositivo. Cierra el editor, actualiza y vuelve a intentarlo.' }, 409);
      } else {
        const mutation = database.prepare(`INSERT INTO jobs (
          id, tenant_id, slug, title_es, title_en, summary_es, summary_en, description_es, description_en,
          requirements_es, requirements_en, location, shift, employment_type, pay_min, pay_max, pay_unit,
          openings, status, featured, sort_order, published_at, closes_at, created_at, updated_at, created_by, updated_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?)`)
          .bind(id, context.tenantId, values.slug, values.titleEs, values.titleEn, values.summaryEs, values.summaryEn,
            values.descriptionEs, values.descriptionEn, values.requirementsEs, values.requirementsEn,
            values.location, values.shift, values.employmentType, values.payMin, values.payMax, values.payUnit,
            values.openings, status, values.featured, status === 'published' ? now : null, values.closesAt,
            now, now, context.user.userId, context.user.userId);
        await database.batch([mutation, auditStatement(database, context, 'job.created', 'job', id, `Creó la vacante ${titleEs}`, now)]);
      }
    } else if (action === 'archive') {
      if (!can(context.role, 'archiveJobs')) return response({ error: 'No tienes permiso para archivar vacantes.' }, 403);
      const id = clean(payload.id, 80);
      const existing = await database.prepare(`SELECT id FROM jobs WHERE tenant_id = ? AND id = ? AND status != 'archived' LIMIT 1`)
        .bind(context.tenantId, id).first<{ id: string }>();
      if (!existing) return response({ error: 'No encontramos esa vacante.' }, 404);
      const [archived] = await database.batch([
        database.prepare(`UPDATE jobs SET status = 'archived', updated_at = ?, updated_by = ? WHERE tenant_id = ? AND id = ? AND status != 'archived' AND updated_at = ?`).bind(now, context.user.userId, context.tenantId, id, clean(payload.expectedUpdatedAt,40)),
        auditStatement(database, context, 'job.archived', 'job', id, 'Archivó una vacante', now),
      ]);
      if (!archived.meta.changes) return response({ error: 'La vacante cambió. Actualiza el portal.' }, 409);
    } else if (action === 'application_status') {
      if (!can(context.role, 'manageApplications')) return response({ error: 'No tienes permiso para actualizar candidatos.' }, 403);
      const id = clean(payload.id, 80);
      const status = clean(payload.status, 30) as ApplicationStatus;
      if (!applicationStatuses.includes(status)) return response({ error: 'Estado inválido.' }, 400);
      const existing = await database.prepare('SELECT id FROM applications WHERE tenant_id = ? AND id = ? LIMIT 1')
        .bind(context.tenantId, id).first<{ id: string }>();
      if (!existing) return response({ error: 'No encontramos esa solicitud.' }, 404);
      const [updated] = await database.batch([
        database.prepare('UPDATE applications SET status = ?, updated_at = ? WHERE tenant_id = ? AND id = ? AND updated_at = ?')
          .bind(status, now, context.tenantId, id, clean(payload.expectedUpdatedAt,40)),
        auditStatement(database, context, 'application.status_changed', 'application', id, `Cambió una solicitud a ${status}`, now),
      ]);
      if (!updated.meta.changes) return response({ error: 'La solicitud cambió. Actualiza el portal.' }, 409);
    } else if (action === 'save_settings') {
      if (!can(context.role, 'editContent')) return response({ error: 'No tienes permiso para editar el sitio.' }, 403);
      const data = (payload.settings || {}) as Record<string, unknown>;
      const settings = {
        heroLine1Es: clean(data.heroLine1Es, 80), heroAccentEs: clean(data.heroAccentEs, 80),
        heroLine2Es: clean(data.heroLine2Es, 100), heroLeadEs: clean(data.heroLeadEs, 320),
        heroLine1En: clean(data.heroLine1En, 80), heroAccentEn: clean(data.heroAccentEn, 80),
        heroLine2En: clean(data.heroLine2En, 100), heroLeadEn: clean(data.heroLeadEn, 320),
        contactPhone: clean(data.contactPhone, 40), contactWhatsapp: clean(data.contactWhatsapp, 40).replace(/\D/g, ''),
        contactEmail: clean(data.contactEmail, 160).toLowerCase(),
      };
      if (!settings.heroLine1Es || !settings.heroLine1En || !/^\S+@\S+\.\S+$/.test(settings.contactEmail)) {
        return response({ error: 'Completa los textos principales y escribe un correo válido.' }, 400);
      }
      const [updated] = await database.batch([database.prepare(`UPDATE site_settings SET hero_line_1_es = ?, hero_accent_es = ?, hero_line_2_es = ?,
        hero_lead_es = ?, hero_line_1_en = ?, hero_accent_en = ?, hero_line_2_en = ?, hero_lead_en = ?,
        contact_phone = ?, contact_whatsapp = ?, contact_email = ?, updated_at = ?, updated_by = ? WHERE tenant_id = ? AND updated_at = ?`)
        .bind(settings.heroLine1Es, settings.heroAccentEs, settings.heroLine2Es, settings.heroLeadEs,
          settings.heroLine1En, settings.heroAccentEn, settings.heroLine2En, settings.heroLeadEn,
          settings.contactPhone, settings.contactWhatsapp, settings.contactEmail, now, context.user.userId, context.tenantId, clean(data.updatedAt,40)),
        auditStatement(database, context, 'site.updated', 'site_settings', context.tenantId, 'Actualizó el contenido principal del sitio', now),
      ]);
      if (!updated.meta.changes) return response({ error: 'Otra persona actualizó el contenido. Tu borrador se conserva; recarga la página para ver la versión actual.' }, 409);
    } else {
      return response({ error: 'Acción desconocida.' }, 400);
    }

    return response({ ok: true, snapshot: await getPortalSnapshot(context) });
  } catch (error) {
    console.error('portal_action_failed', error);
    return response({ error: 'No fue posible guardar los cambios.' }, 500);
  }
}

function auditStatement(
  database: D1Database,
  context: Extract<Awaited<ReturnType<typeof getPortalContext>>, { authorized: true }>,
  action: string,
  entityType: string,
  entityId: string,
  summary: string,
  createdAt: string,
) {
  return database.prepare(`INSERT INTO audit_logs
    (id, tenant_id, actor_id, actor_email, action, entity_type, entity_id, summary, created_at)
    SELECT ?, ?, ?, ?, ?, ?, ?, ?, ? WHERE changes() > 0`)
    .bind(crypto.randomUUID(), context.tenantId, context.user.userId, context.user.email, action, entityType, entityId, summary, createdAt);
}
