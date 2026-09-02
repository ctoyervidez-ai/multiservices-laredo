import { sql } from 'drizzle-orm';
import { index, integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const tenants = sqliteTable('tenants', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  status: text('status').notNull().default('active'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const memberships = sqliteTable('memberships', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  userId: text('user_id'),
  email: text('email').notNull(),
  role: text('role').notNull().default('editor'),
  createdAt: text('created_at').notNull(),
}, (table) => [
  uniqueIndex('idx_memberships_tenant_email').on(table.tenantId, table.email),
  uniqueIndex('idx_memberships_tenant_user').on(table.tenantId, table.userId).where(sql`${table.userId} is not null`),
  index('idx_memberships_user_id').on(table.userId),
]);

export const mediaAssets = sqliteTable('media_assets', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  objectKey: text('object_key').notNull().unique(),
  filename: text('filename').notNull(),
  contentType: text('content_type').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  altEs: text('alt_es').notNull().default(''),
  altEn: text('alt_en').notNull().default(''),
  visibility: text('visibility').notNull().default('public'),
  createdBy: text('created_by'),
  createdAt: text('created_at').notNull(),
}, (table) => [index('idx_media_tenant_created').on(table.tenantId, table.createdAt)]);

export const siteSettings = sqliteTable('site_settings', {
  tenantId: text('tenant_id').primaryKey().references(() => tenants.id),
  heroLine1Es: text('hero_line_1_es').notNull(),
  heroAccentEs: text('hero_accent_es').notNull(),
  heroLine2Es: text('hero_line_2_es').notNull(),
  heroLeadEs: text('hero_lead_es').notNull(),
  heroLine1En: text('hero_line_1_en').notNull(),
  heroAccentEn: text('hero_accent_en').notNull(),
  heroLine2En: text('hero_line_2_en').notNull(),
  heroLeadEn: text('hero_lead_en').notNull(),
  contactPhone: text('contact_phone').notNull(),
  contactWhatsapp: text('contact_whatsapp').notNull(),
  contactEmail: text('contact_email').notNull(),
  heroMediaId: text('hero_media_id').references(() => mediaAssets.id),
  transportMediaId: text('transport_media_id').references(() => mediaAssets.id),
  operationsMediaId: text('operations_media_id').references(() => mediaAssets.id),
  updatedAt: text('updated_at').notNull(),
  updatedBy: text('updated_by'),
});

export const jobs = sqliteTable('jobs', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  slug: text('slug').notNull(),
  titleEs: text('title_es').notNull(),
  titleEn: text('title_en').notNull(),
  summaryEs: text('summary_es').notNull().default(''),
  summaryEn: text('summary_en').notNull().default(''),
  descriptionEs: text('description_es').notNull().default(''),
  descriptionEn: text('description_en').notNull().default(''),
  requirementsEs: text('requirements_es').notNull().default(''),
  requirementsEn: text('requirements_en').notNull().default(''),
  location: text('location').notNull().default('Laredo, TX'),
  shift: text('shift').notNull().default('Por confirmar'),
  employmentType: text('employment_type').notNull().default('Temporal / proyecto'),
  payMin: real('pay_min'),
  payMax: real('pay_max'),
  payUnit: text('pay_unit').notNull().default('hora'),
  openings: integer('openings').notNull().default(1),
  status: text('status').notNull().default('draft'),
  featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  publishedAt: text('published_at'),
  closesAt: text('closes_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
}, (table) => [
  uniqueIndex('idx_jobs_tenant_slug').on(table.tenantId, table.slug),
  index('idx_jobs_tenant_status_order').on(table.tenantId, table.status, table.sortOrder),
  index('idx_jobs_status_published').on(table.status, table.publishedAt),
]);

export const applications = sqliteTable('applications', {
  id: text('id').primaryKey(),
  reference: text('reference').notNull().unique(),
  submissionKey: text('submission_key').notNull(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  jobId: text('job_id').references(() => jobs.id),
  roleInterest: text('role_interest').notNull(),
  fullName: text('full_name').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  city: text('city').notNull().default(''),
  availability: text('availability').notNull().default(''),
  message: text('message').notNull().default(''),
  resumeKey: text('resume_key'),
  resumeFilename: text('resume_filename'),
  status: text('status').notNull().default('new'),
  source: text('source').notNull().default('website'),
  consentAt: text('consent_at').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  uniqueIndex('idx_applications_tenant_submission').on(table.tenantId, table.submissionKey),
  index('idx_applications_tenant_status_created').on(table.tenantId, table.status, table.createdAt),
  index('idx_applications_job_created').on(table.jobId, table.createdAt),
]);

export const rateLimits = sqliteTable('rate_limits', {
  key: text('key').primaryKey(),
  hits: integer('hits').notNull().default(0),
  expiresAt: text('expires_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [index('idx_rate_limits_expires').on(table.expiresAt)]);

export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  actorId: text('actor_id'),
  actorEmail: text('actor_email').notNull(),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  summary: text('summary').notNull(),
  createdAt: text('created_at').notNull(),
}, (table) => [index('idx_audit_tenant_created').on(table.tenantId, table.createdAt)]);
