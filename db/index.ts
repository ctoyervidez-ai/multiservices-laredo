import { env } from 'cloudflare:workers';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';
import { schemaStatements } from './schema-sql';

export const DEFAULT_TENANT_ID = 'multiservices-laredo';

type RuntimeEnv = {
  DB?: D1Database;
  FILES?: R2Bucket;
  PORTAL_SETUP_CODE?: string;
  PORTAL_SETUP_EXPIRES_AT?: string;
  PORTAL_PASSWORD_PEPPER_V1?: string;
  PORTAL_AUTH_LOOKUP_KEY_V1?: string;
  SITE_TENANT_ID?: string;
  SITE_NAME?: string;
};

function runtimeEnv() {
  return env as unknown as RuntimeEnv;
}

export function getD1() {
  const database = runtimeEnv().DB;
  if (!database) throw new Error('La base de datos del sitio no está disponible.');
  return database;
}

export function getFilesBucket() {
  const bucket = runtimeEnv().FILES;
  if (!bucket) throw new Error('El almacenamiento de archivos no está disponible.');
  return bucket;
}

export function getDb() {
  return drizzle(getD1(), { schema });
}

function getRequiredSecret(name: 'PORTAL_SETUP_CODE' | 'PORTAL_SETUP_EXPIRES_AT' | 'PORTAL_PASSWORD_PEPPER_V1' | 'PORTAL_AUTH_LOOKUP_KEY_V1') {
  const value = runtimeEnv()[name];
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Falta configurar el secreto ${name}.`);
  }
  return value;
}

export function getPortalSetupCode() {
  return getRequiredSecret('PORTAL_SETUP_CODE');
}

export function getPortalSetupExpiresAt() {
  return getRequiredSecret('PORTAL_SETUP_EXPIRES_AT');
}

export function getPortalPasswordPepper() {
  return getRequiredSecret('PORTAL_PASSWORD_PEPPER_V1');
}

export function getPortalAuthLookupKey() {
  return getRequiredSecret('PORTAL_AUTH_LOOKUP_KEY_V1');
}

export function getSiteTenantId() {
  const configured = String(runtimeEnv().SITE_TENANT_ID || '').trim().toLowerCase();
  return /^[a-z0-9][a-z0-9-]{0,62}$/.test(configured) ? configured : DEFAULT_TENANT_ID;
}

export function getSiteName() {
  return String(runtimeEnv().SITE_NAME || '').trim().slice(0, 120) || 'Multiservices Laredo';
}

let initialization: Promise<void> | null = null;

export function ensureDatabase() {
  if (!initialization) {
    initialization = initializeDatabase().catch((error) => {
      initialization = null;
      throw error;
    });
  }
  return initialization;
}

async function initializeDatabase() {
  const database = getD1();
  await database.batch(schemaStatements.map((statement) => database.prepare(statement)));
  await seedSiteTenant(database);
}

async function seedSiteTenant(database: D1Database) {
  const tenantId = getSiteTenantId();
  const siteName = getSiteName();
  const now = new Date().toISOString();
  await database.batch([
    database.prepare(`INSERT OR IGNORE INTO tenants (id, slug, name, status, created_at, updated_at) VALUES (?, ?, ?, 'active', ?, ?)`)
      .bind(tenantId, tenantId, siteName, now, now),
    database.prepare(`INSERT OR IGNORE INTO site_settings (
      tenant_id, hero_line_1_es, hero_accent_es, hero_line_2_es, hero_lead_es,
      hero_line_1_en, hero_accent_en, hero_line_2_en, hero_lead_en,
      contact_phone, contact_whatsapp, contact_email, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(
        tenantId,
        'La gente correcta.', 'En el momento', 'que la operación la necesita.',
        'Conectamos empresas exigentes con personas listas para integrarse, aportar y mantener cada turno en movimiento.',
        'The right people.', 'Right when', 'the operation needs them.',
        'We connect demanding businesses with people ready to contribute, integrate, and keep every shift moving.',
        '+1 956 441 1292', '19566069956', 'operations@multiservicesldo.com', now,
      ),
  ]);

  const count = await database.prepare('SELECT COUNT(*) AS total FROM jobs WHERE tenant_id = ?').bind(tenantId).first<{ total: number }>();
  if (tenantId !== DEFAULT_TENANT_ID || Number(count?.total || 0) > 0) return;

  const jobSeeds = [
    ['team-lead', 'Team Lead', 'Team Lead', 'Lidera un equipo operativo y mantén cada turno coordinado, seguro y productivo.', 'Lead an operations team and keep every shift coordinated, safe, and productive.', 17, 'published'],
    ['labor-general', 'Labor general', 'General Labor', 'Apoyo operativo para almacén, distribución y proyectos especiales.', 'Operations support for warehouse, distribution, and special projects.', null, 'draft'],
    ['control-de-calidad', 'Revisión / control de calidad', 'Quality Inspection', 'Inspección, clasificación y seguimiento de calidad para proyectos operativos.', 'Inspection, sorting, and quality tracking for operations projects.', null, 'draft'],
    ['guardia-de-caseta', 'Guardia de caseta', 'Gate Guard', 'Control de accesos y apoyo al flujo seguro de instalaciones.', 'Access control and support for a safe facility flow.', null, 'draft'],
    ['operador-de-patio', 'Mulero / operador de patio', 'Yard Mule Operator', 'Movimiento seguro de unidades y remolques dentro del patio.', 'Safe movement of units and trailers throughout the yard.', null, 'draft'],
    ['ejecutivo-de-trafico', 'Ejecutivo de tráfico', 'Traffic Coordinator', 'Coordinación de unidades, documentación y comunicación operativa.', 'Coordination of units, documentation, and operations communication.', null, 'draft'],
    ['servicio-al-cliente', 'CSR / servicio al cliente', 'CSR / Customer Service', 'Atención bilingüe y seguimiento puntual a clientes y operaciones.', 'Bilingual service and reliable follow-up for customers and operations.', null, 'draft'],
    ['meseros', 'Meseros', 'Servers', 'Servicio atento para eventos y operaciones de hospitalidad.', 'Attentive service for events and hospitality operations.', null, 'draft'],
    ['cocineros', 'Cocineros', 'Cooks', 'Preparación de alimentos con orden, calidad y enfoque en seguridad.', 'Food preparation with organization, quality, and a safety mindset.', null, 'draft'],
    ['proyectos-foraneos', 'Proyectos fuera de la ciudad', 'Out-of-town Projects', 'Cuadrillas disponibles para proyectos seleccionados fuera de Laredo.', 'Crews available for selected projects outside Laredo.', null, 'draft'],
    ['data-entry', 'Data Entry', 'Data Entry', 'Captura y revisión precisa de información operativa.', 'Accurate entry and review of operations information.', null, 'draft'],
    ['montacarguista', 'Montacarguistas', 'Forklift Operators', 'Manejo seguro de materiales y apoyo al flujo de almacén.', 'Safe material handling and warehouse flow support.', null, 'draft'],
    ['auditor-de-bodega', 'Auditor de bodega', 'Warehouse Auditor', 'Validación de inventario, procesos y documentación de almacén.', 'Validation of warehouse inventory, processes, and documentation.', null, 'draft'],
    ['plancheros', 'Plancheros', 'Griddle Cooks', 'Preparación rápida y consistente en entornos de alto volumen.', 'Fast, consistent preparation in high-volume environments.', null, 'draft'],
    ['asociados-de-almacen', 'Asociados de almacén', 'Warehouse Associates', 'Carga, descarga, surtido, empaque e inventario.', 'Loading, unloading, picking, packing, and inventory.', null, 'draft'],
    ['clerks-de-trafico', 'Clerks de tráfico', 'Traffic Clerks', 'Documentación y soporte administrativo para operaciones de transporte.', 'Documentation and administrative support for transportation operations.', null, 'draft'],
    ['asistentes-administrativos', 'Asistentes administrativos', 'Administrative Assistants', 'Organización, comunicación y soporte diario a equipos de trabajo.', 'Organization, communication, and day-to-day team support.', null, 'draft'],
    ['supervisores', 'Supervisores', 'Supervisors', 'Seguimiento de personal, métricas, seguridad y resultados.', 'People, metrics, safety, and performance follow-up.', null, 'draft'],
    ['coordinadores-de-seguridad', 'Coordinadores de seguridad', 'Safety Coordinators', 'Apoyo a protocolos, capacitación y cumplimiento operativo.', 'Support for protocols, training, and operational compliance.', null, 'draft'],
    ['personal-de-contabilidad', 'Personal de contabilidad', 'Accounting Personnel', 'Soporte contable y administrativo con atención al detalle.', 'Accounting and administrative support with attention to detail.', null, 'draft'],
  ] as const;

  await database.batch(jobSeeds.map(([slug, titleEs, titleEn, summaryEs, summaryEn, payMin, status], index) =>
    database.prepare(`INSERT INTO jobs (
      id, tenant_id, slug, title_es, title_en, summary_es, summary_en,
      description_es, description_en, requirements_es, requirements_en,
      location, shift, employment_type, pay_min, pay_unit, openings, status,
      featured, sort_order, published_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Laredo, TX', 'Por confirmar', 'Temporal / proyecto', ?, 'hora', 1, ?, ?, ?, ?, ?, ?)`)
      .bind(
        crypto.randomUUID(), tenantId, slug, titleEs, titleEn, summaryEs, summaryEn,
        summaryEs, summaryEn,
        'Disponibilidad para trabajar, identificación vigente y cumplimiento de los requisitos específicos del proyecto.',
        'Work availability, valid identification, and ability to meet the project-specific requirements.',
        payMin, status, slug === 'team-lead' ? 1 : 0, index,
        status === 'published' ? now : null, now, now,
      ),
  ));
}
