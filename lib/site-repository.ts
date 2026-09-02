import type { ChatGPTUser } from '@/app/chatgpt-auth';
import { allowsLocalPortalPreview, ensureDatabase, getD1, getOwnerEmails, getSiteName, getSiteTenantId } from '@/db';
import { can, isPortalRole, roleCapabilities } from '@/lib/portal-access';
import type { ApplicationRecord, JobRecord, MediaAsset, PortalRole, PortalSnapshot, PublicJob, SiteSettings } from '@/lib/portal-types';

const JOB_COLUMNS = `
  id, slug, title_es AS titleEs, title_en AS titleEn,
  summary_es AS summaryEs, summary_en AS summaryEn,
  description_es AS descriptionEs, description_en AS descriptionEn,
  requirements_es AS requirementsEs, requirements_en AS requirementsEn,
  location, shift, employment_type AS employmentType,
  pay_min AS payMin, pay_max AS payMax, pay_unit AS payUnit,
  openings, status, featured, sort_order AS sortOrder,
  published_at AS publishedAt, closes_at AS closesAt,
  created_at AS createdAt, updated_at AS updatedAt`;

const SETTINGS_COLUMNS = `
  s.hero_line_1_es AS heroLine1Es, s.hero_accent_es AS heroAccentEs,
  s.hero_line_2_es AS heroLine2Es, s.hero_lead_es AS heroLeadEs,
  s.hero_line_1_en AS heroLine1En, s.hero_accent_en AS heroAccentEn,
  s.hero_line_2_en AS heroLine2En, s.hero_lead_en AS heroLeadEn,
  s.contact_phone AS contactPhone, s.contact_whatsapp AS contactWhatsapp,
  s.contact_email AS contactEmail, s.hero_media_id AS heroMediaId,
  s.transport_media_id AS transportMediaId, s.operations_media_id AS operationsMediaId,
  s.updated_at AS updatedAt`;

type RawJob = Omit<JobRecord, 'featured'> & { featured: number };

export const defaultSettings: SiteSettings = {
  heroLine1Es: 'La gente correcta.',
  heroAccentEs: 'En el momento',
  heroLine2Es: 'que la operación la necesita.',
  heroLeadEs: 'Conectamos empresas exigentes con personas listas para integrarse, aportar y mantener cada turno en movimiento.',
  heroLine1En: 'The right people.',
  heroAccentEn: 'Right when',
  heroLine2En: 'the operation needs them.',
  heroLeadEn: 'We connect demanding businesses with people ready to contribute, integrate, and keep every shift moving.',
  contactPhone: '+1 956 441 1292',
  contactWhatsapp: '19566069956',
  contactEmail: 'operations@multiservicesldo.com',
  heroMediaId: null,
  transportMediaId: null,
  operationsMediaId: null,
  heroImageUrl: null,
  transportImageUrl: null,
  operationsImageUrl: null,
  updatedAt: new Date(0).toISOString(),
};

export function businessDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value || '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export async function getPublicJobs(tenantId = getSiteTenantId()): Promise<PublicJob[]> {
  await ensureDatabase();
  const result = await getD1().prepare(`SELECT ${JOB_COLUMNS}
    FROM jobs
    WHERE tenant_id = ? AND status = 'published'
      AND (closes_at IS NULL OR substr(closes_at, 1, 10) >= ?)
    ORDER BY featured DESC, sort_order ASC, published_at DESC`)
    .bind(tenantId, businessDate()).all<RawJob>();
  return result.results.map(normalizeJob);
}

export async function getPublicJobBySlug(slug: string, tenantId = getSiteTenantId()): Promise<PublicJob | null> {
  await ensureDatabase();
  const row = await getD1().prepare(`SELECT ${JOB_COLUMNS}
    FROM jobs
    WHERE tenant_id = ? AND slug = ? AND status = 'published'
      AND (closes_at IS NULL OR substr(closes_at, 1, 10) >= ?)
    LIMIT 1`)
    .bind(tenantId, slug, businessDate()).first<RawJob>();
  return row ? normalizeJob(row) : null;
}

export async function getSiteSettings(tenantId = getSiteTenantId()): Promise<SiteSettings> {
  await ensureDatabase();
  const row = await getD1().prepare(`SELECT ${SETTINGS_COLUMNS}
    FROM site_settings s WHERE s.tenant_id = ? LIMIT 1`)
    .bind(tenantId).first<Omit<SiteSettings, 'heroImageUrl' | 'transportImageUrl' | 'operationsImageUrl'>>();
  if (!row) return defaultSettings;
  return {
    ...row,
    heroImageUrl: row.heroMediaId ? `/media/${row.heroMediaId}` : null,
    transportImageUrl: row.transportMediaId ? `/media/${row.transportMediaId}` : null,
    operationsImageUrl: row.operationsMediaId ? `/media/${row.operationsMediaId}` : null,
  };
}

export async function getPortalContext(user: ChatGPTUser | null, requestHost = '') {
  await ensureDatabase();
  const hostname = requestHost.split(':')[0].toLowerCase();
  const loopback = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
  const localPreview = !user && process.env.NODE_ENV !== 'production' && loopback && allowsLocalPortalPreview();
  const effectiveUser: ChatGPTUser | null = user ?? (localPreview ? {
    userId: 'local-preview-owner',
    email: 'preview@multiservices.local',
    displayName: 'Vista local',
    fullName: 'Vista local',
  } : null);
  if (!effectiveUser) return null;

  const database = getD1();
  const tenantId = getSiteTenantId();
  if (localPreview) {
    return {
      authorized: true as const,
      tenantId,
      role: 'owner' as const,
      user: effectiveUser,
      localPreview: true,
    };
  }

  const normalizedEmail = effectiveUser.email.toLowerCase();
  const configuredOwner = getOwnerEmails().includes(normalizedEmail);
  if (configuredOwner) {
    await database.prepare(`INSERT INTO memberships (id, tenant_id, user_id, email, role, created_at)
      VALUES (?, ?, ?, ?, 'owner', ?)
      ON CONFLICT(tenant_id, email) DO UPDATE SET
        user_id = CASE WHEN memberships.user_id IS NULL OR memberships.user_id = excluded.user_id THEN excluded.user_id ELSE memberships.user_id END,
        role = 'owner'`)
      .bind(crypto.randomUUID(), tenantId, effectiveUser.userId, normalizedEmail, new Date().toISOString()).run();
  } else {
    await database.prepare(`UPDATE memberships SET user_id = ?
      WHERE tenant_id = ? AND lower(email) = ? AND user_id IS NULL
        AND NOT EXISTS (SELECT 1 FROM memberships claimed WHERE claimed.tenant_id = ? AND claimed.user_id = ?)`)
      .bind(effectiveUser.userId, tenantId, normalizedEmail, tenantId, effectiveUser.userId).run();
  }

  const membership = await database.prepare(`SELECT m.tenant_id AS tenantId, m.role
    FROM memberships m JOIN tenants t ON t.id = m.tenant_id
    WHERE m.tenant_id = ? AND m.user_id = ? AND t.status = 'active' LIMIT 1`)
    .bind(tenantId, effectiveUser.userId)
    .first<{ tenantId: string; role: string }>();
  if (!membership || !isPortalRole(membership.role)) return { authorized: false as const, user: effectiveUser, localPreview: false };

  return {
    authorized: true as const,
    tenantId: membership.tenantId,
    role: membership.role as PortalRole,
    user: effectiveUser,
    localPreview: false,
  };
}

export async function getPortalSnapshot(context: Extract<Awaited<ReturnType<typeof getPortalContext>>, { authorized: true }>): Promise<PortalSnapshot> {
  const database = getD1();
  const mayViewApplications = can(context.role, 'viewApplications');
  const mayEditContent = can(context.role, 'editContent');
  const [tenant, jobRows, applicationRows, applicationTotal, settings, mediaRows] = await Promise.all([
    database.prepare('SELECT id, name, slug FROM tenants WHERE id = ?').bind(context.tenantId).first<{ id: string; name: string; slug: string }>(),
    database.prepare(`SELECT ${JOB_COLUMNS},
      (SELECT COUNT(*) FROM applications a WHERE a.job_id = jobs.id AND a.tenant_id = jobs.tenant_id) AS applicationCount
      FROM jobs WHERE tenant_id = ?
      ORDER BY CASE status WHEN 'published' THEN 0 WHEN 'draft' THEN 1 WHEN 'closed' THEN 2 ELSE 3 END, updated_at DESC`)
      .bind(context.tenantId).all<RawJob & { applicationCount: number }>(),
    mayViewApplications ? database.prepare(`SELECT a.id, a.reference, a.job_id AS jobId, j.title_es AS jobTitle,
      a.role_interest AS roleInterest, a.full_name AS fullName, a.phone, a.email,
      a.city, a.availability, a.message, a.resume_filename AS resumeFilename,
      a.status, a.created_at AS createdAt, a.updated_at AS updatedAt
      FROM applications a LEFT JOIN jobs j ON j.id = a.job_id AND j.tenant_id = a.tenant_id
      WHERE a.tenant_id = ?
      ORDER BY a.created_at DESC LIMIT 500`)
      .bind(context.tenantId).all<ApplicationRecord>() : Promise.resolve({ results: [] as ApplicationRecord[] }),
    mayViewApplications ? database.prepare('SELECT COUNT(*) AS total FROM applications WHERE tenant_id = ?')
      .bind(context.tenantId).first<{ total: number }>() : Promise.resolve({ total: 0 }),
    getSiteSettings(context.tenantId),
    mayEditContent ? database.prepare(`SELECT id, filename, content_type AS contentType, size_bytes AS sizeBytes,
      alt_es AS altEs, alt_en AS altEn, created_at AS createdAt
      FROM media_assets WHERE tenant_id = ? AND visibility = 'public'
      ORDER BY created_at DESC LIMIT 100`)
      .bind(context.tenantId).all<Omit<MediaAsset, 'url'>>() : Promise.resolve({ results: [] as Omit<MediaAsset, 'url'>[] }),
  ]);

  const jobs = jobRows.results.map((row) => ({ ...normalizeJob(row), applicationCount: Number(row.applicationCount || 0) }));
  const applications = applicationRows.results;
  return {
    tenant: tenant ?? { id: context.tenantId, name: getSiteName(), slug: context.tenantId },
    user: {
      userId: context.user.userId,
      email: context.user.email,
      displayName: context.user.displayName,
      role: context.role,
      localPreview: context.localPreview,
    },
    jobs,
    applications,
    settings,
    media: mediaRows.results.map((asset) => ({ ...asset, url: `/media/${asset.id}` })),
    capabilities: roleCapabilities[context.role],
    metrics: {
      activeJobs: jobs.filter((job) => job.status === 'published' && (!job.closesAt || job.closesAt.slice(0, 10) >= businessDate())).length,
      draftJobs: jobs.filter((job) => job.status === 'draft').length,
      newApplications: applications.filter((application) => application.status === 'new').length,
      totalApplications: Number(applicationTotal?.total || 0),
    },
  };
}

export function normalizeJob(row: RawJob): JobRecord {
  return { ...row, featured: Boolean(row.featured) };
}

export function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72) || 'vacante';
}

export async function writeAuditLog(input: {
  tenantId: string;
  actorId: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
}) {
  await getD1().prepare(`INSERT INTO audit_logs
    (id, tenant_id, actor_id, actor_email, action, entity_type, entity_id, summary, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(crypto.randomUUID(), input.tenantId, input.actorId, input.actorEmail, input.action, input.entityType, input.entityId, input.summary, new Date().toISOString())
    .run();
}
