import {
  ensureDatabase,
  getD1,
  getPortalAuthLookupKey,
  getPortalPasswordPepper,
  getPortalSetupCode,
  getPortalSetupExpiresAt,
  getSiteTenantId,
  getEmailConfig,
} from '@/db';
import { deliverEmail } from '@/lib/email-delivery';
import { SITE_ORIGIN } from '@/lib/site-origin';

const PASSWORD_ALGORITHM = 'pbkdf2-hmac-sha256-v1';
const PASSWORD_ITERATIONS = 600_000;
const PASSWORD_SALT_BYTES = 16;
const PASSWORD_HASH_BYTES = 32;
const SESSION_TOKEN_BYTES = 32;
const SESSION_ABSOLUTE_MS = 12 * 60 * 60_000;
const SESSION_IDLE_MS = 30 * 60_000;
const SESSION_REFRESH_MS = 5 * 60_000;
const PRODUCTION_COOKIE = '__Host-msl_portal';
const DEVELOPMENT_COOKIE = 'msl_portal_dev';

const encoder = new TextEncoder();

export async function requestPasswordReset(request: Request, input: { email?: unknown }) {
  assertSecureAuthTransport(request);
  const config = getEmailConfig();
  if (!config) throw new PortalAuthError('email_unavailable', 'La recuperación por correo aún no está activada. Contacta a Ethrov.', 503);
  const email = normalizeEmail(input.email);
  await ensureDatabase();
  const database = getD1(), tenant = getSiteTenantId();
  if (!await reserveAuthLimits(request, database, tenant, 'login', `reset:${email}`)) throw new PortalAuthError('rate_limited', 'Espera 15 minutos antes de volver a intentar.', 429);
  const user = await database.prepare(`SELECT u.id, u.auth_version AS authVersion FROM portal_users u
    JOIN memberships m ON m.user_id = u.id AND m.tenant_id = u.tenant_id
    JOIN tenants t ON t.id = u.tenant_id
    WHERE u.tenant_id = ? AND u.email = ? AND u.status = 'active' AND t.status = 'active' LIMIT 1`)
    .bind(tenant, email).first<{ id: string; authVersion: number }>();
  if (!user) return;
  const token = toBase64Url(randomBytes(32)), hash = await keyedDigest(`reset:${tenant}:${token}`);
  const expires = new Date(Date.now() + 30 * 60_000).toISOString();
  await database.batch([
    database.prepare('DELETE FROM password_resets WHERE expires_at < ?').bind(new Date().toISOString()),
    database.prepare('INSERT INTO password_resets (token_hash, tenant_id, user_id, auth_version, expires_at) VALUES (?, ?, ?, ?, ?)').bind(hash, tenant, user.id, user.authVersion, expires),
  ]);
  // Keep the bearer token out of logs, stored message bodies, and query strings.
  try {
    await deliverEmail(config, { to: email, subject: 'Restablecer acceso a Multiservices Laredo', text: `Solicitaste restablecer tu contraseña. Este enlace vence en 30 minutos y funciona una vez:\n${SITE_ORIGIN}/portal/recuperar#token=${token}\nSi no lo solicitaste, ignora este correo. Tu contraseña no ha cambiado.` }, `reset-${hash}`);
  } catch { console.error('password_reset_email_failed'); }
}

export async function completePasswordReset(request: Request, input: { token?: unknown; password?: unknown; confirmPassword?: unknown }) {
  assertSecureAuthTransport(request);
  await ensureDatabase();
  const database = getD1(), tenant = getSiteTenantId();
  if (!await reserveAuthLimits(request, database, tenant, 'login', 'reset-complete')) throw new PortalAuthError('rate_limited', 'Espera 15 minutos antes de volver a intentar.', 429);
  const token = String(input.token || '');
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) throw new PortalAuthError('invalid_reset', 'El enlace no es válido o ya venció.', 400);
  const password = validatePassword(input.password);
  if (password !== input.confirmPassword) throw new PortalAuthError('password_mismatch', 'Las contraseñas no coinciden.', 400);
  const hash = await keyedDigest(`reset:${tenant}:${token}`), now = new Date().toISOString();
  const reset = await database.prepare(`SELECT r.user_id AS userId, r.auth_version AS authVersion FROM password_resets r
    JOIN portal_users u ON u.id = r.user_id AND u.tenant_id = r.tenant_id
    JOIN memberships m ON m.user_id = u.id AND m.tenant_id = u.tenant_id
    JOIN tenants t ON t.id = u.tenant_id
    WHERE r.token_hash = ? AND r.tenant_id = ? AND r.used_at IS NULL AND r.expires_at > ?
      AND u.auth_version = r.auth_version AND u.status = 'active' AND t.status = 'active' LIMIT 1`)
    .bind(hash, tenant, now).first<{ userId: string; authVersion: number }>();
  if (!reset) throw new PortalAuthError('invalid_reset', 'El enlace no es válido o ya venció.', 400);
  const salt = randomBytes(PASSWORD_SALT_BYTES), passwordHash = await derivePasswordHash(password, salt, PASSWORD_ITERATIONS);
  const [updated] = await database.batch([
    database.prepare(`UPDATE portal_users SET password_salt_b64 = ?, password_hash_b64 = ?, password_algorithm = ?, password_iterations = ?, pepper_version = 1,
      auth_version = auth_version + 1, password_changed_at = ?, updated_at = ?
      WHERE id = ? AND tenant_id = ? AND auth_version = ? AND status = 'active'
      AND EXISTS (SELECT 1 FROM password_resets WHERE token_hash = ? AND tenant_id = ? AND used_at IS NULL AND expires_at > ?)`)
      .bind(toBase64Url(salt), toBase64Url(passwordHash), PASSWORD_ALGORITHM, PASSWORD_ITERATIONS, now, now, reset.userId, tenant, reset.authVersion, hash, tenant, new Date().toISOString()),
    database.prepare(`UPDATE password_resets SET used_at = ? WHERE token_hash = ? AND tenant_id = ? AND used_at IS NULL`).bind(now, hash, tenant),
  ]);
  if (!updated.meta.changes) throw new PortalAuthError('invalid_reset', 'El enlace no es válido o ya se usó.', 400);
  // Existing sessions are rejected by the auth_version comparison in session lookup.
}

export type PortalIdentity = {
  userId: string;
  email: string;
  displayName: string;
};

export type PortalAuthInput = {
  email?: unknown;
  password?: unknown;
};

export type PortalSetupInput = PortalAuthInput & {
  displayName?: unknown;
  confirmPassword?: unknown;
  activationCode?: unknown;
};

export type PortalAuthSuccess = {
  identity: PortalIdentity;
  setCookie: string;
};

export class PortalAuthError extends Error {
  readonly status: number;
  readonly code: string;
  readonly retryAfter?: number;

  constructor(code: string, message: string, status: number, retryAfter?: number) {
    super(message);
    this.name = 'PortalAuthError';
    this.code = code;
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

type UserCredentialRow = PortalIdentity & {
  tenantId: string;
  passwordAlgorithm: string;
  passwordIterations: number;
  passwordSaltB64: string;
  passwordHashB64: string;
  pepperVersion: number;
  authVersion: number;
};

type SessionRow = PortalIdentity & {
  sessionId: string;
  authVersion: number;
  userAuthVersion: number;
  lastSeenAt: string;
  absoluteExpiresAt: string;
};

export type PortalAccessState = 'setup' | 'signin' | 'recovery';

export async function getPortalAccessState(): Promise<PortalAccessState> {
  await ensureDatabase();
  requireSecret(getPortalPasswordPepper(), 'PORTAL_PASSWORD_PEPPER_V1');
  requireSecret(getPortalAuthLookupKey(), 'PORTAL_AUTH_LOOKUP_KEY_V1');
  const database = getD1();
  const tenantId = getSiteTenantId();
  const owner = await database.prepare(`SELECT u.id
    FROM portal_users u
    JOIN memberships m ON m.tenant_id = u.tenant_id AND m.user_id = u.id
    JOIN tenants t ON t.id = u.tenant_id
    WHERE u.tenant_id = ? AND u.status = 'active' AND m.role = 'owner' AND t.status = 'active'
    LIMIT 1`).bind(tenantId).first<{ id: string }>();
  if (owner) return 'signin';

  const bootstrap = await database.prepare(`SELECT code_hash_b64 AS codeHash, used_at AS usedAt,
      expires_at AS expiresAt
    FROM auth_bootstrap WHERE tenant_id = ? LIMIT 1`)
    .bind(tenantId).first<{ codeHash: string | null; usedAt: string | null; expiresAt: string }>();
  if (bootstrap?.usedAt) return 'recovery';

  const setup = configuredSetup();
  const configuredExpiry = Date.parse(setup.expiresAt);
  if (!bootstrap) return configuredExpiry > Date.now() ? 'setup' : 'recovery';
  if (!bootstrap.codeHash) return 'recovery';

  const configuredHash = await keyedDigest(`setup:${tenantId}:${setup.code}`);
  if (constantTimeEqual(fromBase64Url(bootstrap.codeHash), fromBase64Url(configuredHash))) {
    const effectiveExpiry = Math.min(Date.parse(bootstrap.expiresAt), configuredExpiry);
    return effectiveExpiry > Date.now() ? 'setup' : 'recovery';
  }

  // A different code deliberately rotates the bootstrap credential. Reusing the
  // same code can never extend the expiry already persisted in the database.
  return configuredExpiry > Date.now() ? 'setup' : 'recovery';
}

export async function portalNeedsSetup() {
  return await getPortalAccessState() === 'setup';
}

export async function createInitialPortalAdmin(request: Request, input: PortalSetupInput): Promise<PortalAuthSuccess> {
  assertSecureAuthTransport(request);
  await ensureDatabase();
  const database = getD1();
  const tenantId = getSiteTenantId();

  const displayName = cleanDisplayName(input.displayName);
  const email = normalizeEmail(input.email);
  const password = validatePassword(input.password);
  if (String(input.confirmPassword ?? '') !== password) {
    throw new PortalAuthError('password_mismatch', 'Las contraseñas no coinciden.', 400);
  }
  const activationCode = normalizeActivationCode(input.activationCode);
  if (!activationCode) throw new PortalAuthError('invalid_setup', 'El código de activación no es válido.', 400);

  if (!await reserveAuthLimits(request, database, tenantId, 'setup', email)) {
    throw new PortalAuthError('rate_limited', 'Demasiados intentos. Espera una hora antes de volver a intentar.', 429, 3600);
  }

  const configured = configuredSetup();
  if (Date.parse(configured.expiresAt) <= Date.now()) {
    throw new PortalAuthError('setup_expired', 'El código de activación venció. Solicita uno nuevo a Ethrov.', 410);
  }
  const setupHash = await keyedDigest(`setup:${tenantId}:${activationCode}`);
  const configuredHash = await keyedDigest(`setup:${tenantId}:${configured.code}`);
  if (!constantTimeEqual(fromBase64Url(setupHash), fromBase64Url(configuredHash))) {
    throw new PortalAuthError('invalid_setup', 'El código de activación no es válido.', 400);
  }
  await ensureBootstrapRecord(database, tenantId, configured);

  const nowDate = new Date();
  const now = nowDate.toISOString();
  const salt = randomBytes(PASSWORD_SALT_BYTES);
  const passwordHash = await derivePasswordHash(password, salt, PASSWORD_ITERATIONS);
  const userId = crypto.randomUUID();
  const session = await newSessionValues(request, tenantId, userId, 1, nowDate);

  const createUser = database.prepare(`INSERT INTO portal_users (
      id, tenant_id, email, display_name, password_algorithm, password_iterations,
      password_salt_b64, password_hash_b64, pepper_version, auth_version, status,
      password_changed_at, last_login_at, created_at, updated_at
    )
    SELECT ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 'active', ?, ?, ?, ?
    FROM auth_bootstrap b
    WHERE b.tenant_id = ? AND b.used_at IS NULL AND b.expires_at > ? AND b.code_hash_b64 = ?
      AND NOT EXISTS (
        SELECT 1 FROM portal_users owner_user
        JOIN memberships owner_membership
          ON owner_membership.tenant_id = owner_user.tenant_id AND owner_membership.user_id = owner_user.id
        WHERE owner_user.tenant_id = ? AND owner_user.status = 'active' AND owner_membership.role = 'owner'
      )`)
    .bind(
      userId, tenantId, email, displayName, PASSWORD_ALGORITHM, PASSWORD_ITERATIONS,
      toBase64Url(salt), toBase64Url(passwordHash), now, now, now, now,
      tenantId, now, setupHash, tenantId,
    );

  const membership = database.prepare(`INSERT INTO memberships (id, tenant_id, user_id, email, role, created_at)
      SELECT ?, ?, ?, ?, 'owner', ?
      WHERE EXISTS (SELECT 1 FROM portal_users WHERE id = ? AND tenant_id = ?)
      ON CONFLICT(tenant_id, email) DO UPDATE SET
        user_id = excluded.user_id,
        email = excluded.email,
        role = 'owner'`)
    .bind(crypto.randomUUID(), tenantId, userId, email, now, userId, tenantId);

  const statements = [
    createUser,
    membership,
    database.prepare(`UPDATE auth_bootstrap SET code_hash_b64 = NULL, used_at = ?, used_by_user_id = ?, updated_at = ?
      WHERE tenant_id = ? AND used_at IS NULL AND expires_at > ? AND code_hash_b64 = ?
        AND EXISTS (SELECT 1 FROM portal_users WHERE id = ? AND tenant_id = ?)`)
      .bind(now, userId, now, tenantId, now, setupHash, userId, tenantId),
    database.prepare(`INSERT INTO auth_sessions (
      id, token_hash_b64, tenant_id, user_id, auth_version, created_at, last_seen_at,
      idle_expires_at, absolute_expires_at, revoked_at, revoked_reason, ip_hash_b64, user_agent_hash_b64
    ) SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, ?
      WHERE EXISTS (SELECT 1 FROM portal_users WHERE id = ? AND tenant_id = ?)`)
      .bind(
        session.id, session.tokenHash, tenantId, userId, 1, now, now,
        session.idleExpiresAt, session.absoluteExpiresAt, session.ipHash, session.userAgentHash,
        userId, tenantId,
      ),
    database.prepare(`INSERT INTO audit_logs
      (id, tenant_id, actor_id, actor_email, action, entity_type, entity_id, summary, created_at)
      SELECT ?, ?, ?, ?, 'auth.owner_created', 'portal_user', ?, 'Creó la cuenta administradora inicial', ?
      WHERE EXISTS (SELECT 1 FROM portal_users WHERE id = ? AND tenant_id = ?)`)
      .bind(crypto.randomUUID(), tenantId, userId, email, userId, now, userId, tenantId),
  ];

  try {
    const results = await database.batch(statements);
    if (!Number(results[0]?.meta.changes || 0) || !Number(results[1]?.meta.changes || 0) || !Number(results[2]?.meta.changes || 0)) {
      throw new PortalAuthError('setup_unavailable', 'El código no es válido, venció o el administrador ya fue creado.', 409);
    }
  } catch (error) {
    if (error instanceof PortalAuthError) throw error;
    console.error('portal_setup_failed');
    throw new PortalAuthError('setup_unavailable', 'No fue posible crear el administrador. Verifica el código e inténtalo nuevamente.', 409);
  }

  return {
    identity: { userId, email, displayName },
    setCookie: serializeSessionCookie(request.url, session.token),
  };
}

export async function authenticatePortalAdmin(request: Request, input: PortalAuthInput): Promise<PortalAuthSuccess> {
  assertSecureAuthTransport(request);
  await ensureDatabase();
  const database = getD1();
  const tenantId = getSiteTenantId();
  const email = normalizeEmail(input.email);
  const password = validatePasswordForLogin(input.password);
  requireSecret(getPortalPasswordPepper(), 'PORTAL_PASSWORD_PEPPER_V1');

  if (!await reserveAuthLimits(request, database, tenantId, 'login', email)) {
    throw new PortalAuthError('rate_limited', 'Demasiados intentos. Espera 15 minutos antes de volver a intentar.', 429, 900);
  }

  const user = await database.prepare(`SELECT
      u.id AS userId, u.tenant_id AS tenantId, u.email, u.display_name AS displayName,
      u.password_algorithm AS passwordAlgorithm, u.password_iterations AS passwordIterations,
      u.password_salt_b64 AS passwordSaltB64, u.password_hash_b64 AS passwordHashB64,
      u.pepper_version AS pepperVersion, u.auth_version AS authVersion
    FROM portal_users u
    JOIN memberships m ON m.tenant_id = u.tenant_id AND m.user_id = u.id
    JOIN tenants t ON t.id = u.tenant_id
    WHERE u.tenant_id = ? AND u.email = ? AND u.status = 'active' AND t.status = 'active'
      AND m.role IN ('owner', 'editor', 'recruiter')
    LIMIT 1`).bind(tenantId, email).first<UserCredentialRow>();

  let passwordMatches = false;
  if (
    user && user.passwordAlgorithm === PASSWORD_ALGORITHM && user.pepperVersion === 1
    && Number.isInteger(user.passwordIterations) && user.passwordIterations >= 100_000
    && user.passwordIterations <= 1_000_000
  ) {
    try {
      const actual = await derivePasswordHash(password, fromBase64Url(user.passwordSaltB64), user.passwordIterations);
      passwordMatches = constantTimeEqual(actual, fromBase64Url(user.passwordHashB64));
    } catch {
      passwordMatches = false;
    }
  } else {
    await performDummyPasswordWork(password, tenantId);
  }

  if (!user || !passwordMatches) {
    throw new PortalAuthError('invalid_credentials', 'Correo o contraseña incorrectos.', 401);
  }

  const nowDate = new Date();
  const now = nowDate.toISOString();
  const session = await newSessionValues(request, tenantId, user.userId, user.authVersion, nowDate);
  const emailLimitBucket = Math.floor(nowDate.getTime() / (15 * 60_000));
  const emailLimitKey = await keyedDigest(
    `${tenantId}:auth-login-email-ip-15m:${email}\n${clientAddress(request)}:${emailLimitBucket}`,
  );
  await database.batch([
    database.prepare(`INSERT INTO auth_sessions (
      id, token_hash_b64, tenant_id, user_id, auth_version, created_at, last_seen_at,
      idle_expires_at, absolute_expires_at, revoked_at, revoked_reason, ip_hash_b64, user_agent_hash_b64
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, ?)`)
      .bind(
        session.id, session.tokenHash, tenantId, user.userId, user.authVersion, now, now,
        session.idleExpiresAt, session.absoluteExpiresAt, session.ipHash, session.userAgentHash,
      ),
    database.prepare('UPDATE portal_users SET last_login_at = ?, updated_at = ? WHERE id = ? AND tenant_id = ?')
      .bind(now, now, user.userId, tenantId),
    database.prepare(`INSERT INTO audit_logs
      (id, tenant_id, actor_id, actor_email, action, entity_type, entity_id, summary, created_at)
      VALUES (?, ?, ?, ?, 'auth.login', 'portal_user', ?, 'Inició sesión en el portal', ?)`)
      .bind(crypto.randomUUID(), tenantId, user.userId, user.email, user.userId, now),
    database.prepare(`UPDATE auth_sessions SET revoked_at = ?, revoked_reason = 'session_limit'
      WHERE user_id = ? AND revoked_at IS NULL AND id != ? AND id NOT IN (
        SELECT id FROM auth_sessions WHERE user_id = ? AND revoked_at IS NULL AND id != ?
        ORDER BY created_at DESC, id DESC LIMIT 9
      )`).bind(now, user.userId, session.id, user.userId, session.id),
    database.prepare('DELETE FROM auth_sessions WHERE absolute_expires_at < ? OR (revoked_at IS NOT NULL AND revoked_at < ?)')
      .bind(now, new Date(nowDate.getTime() - 30 * 24 * 60 * 60_000).toISOString()),
    database.prepare('DELETE FROM rate_limits WHERE key = ?').bind(emailLimitKey),
  ]);

  return {
    identity: { userId: user.userId, email: user.email, displayName: user.displayName },
    setCookie: serializeSessionCookie(request.url, session.token),
  };
}

export async function getPortalIdentityFromCookie(cookieHeader: string | null, requestHost = ''): Promise<PortalIdentity | null> {
  const token = readSessionToken(cookieHeader, requestHost);
  if (!token) return null;

  try {
    await ensureDatabase();
    const database = getD1();
    const nowDate = new Date();
    const now = nowDate.toISOString();
    const tokenHash = await sessionTokenHash(token);
    const row = await database.prepare(`SELECT
        s.id AS sessionId, s.auth_version AS authVersion, s.last_seen_at AS lastSeenAt,
        s.absolute_expires_at AS absoluteExpiresAt, u.id AS userId, u.email,
        u.display_name AS displayName, u.auth_version AS userAuthVersion
      FROM auth_sessions s
      JOIN portal_users u ON u.id = s.user_id AND u.tenant_id = s.tenant_id
      JOIN tenants t ON t.id = s.tenant_id
      WHERE s.token_hash_b64 = ? AND s.tenant_id = ? AND s.revoked_at IS NULL
        AND s.idle_expires_at > ? AND s.absolute_expires_at > ?
        AND u.status = 'active' AND t.status = 'active'
      LIMIT 1`).bind(tokenHash, getSiteTenantId(), now, now).first<SessionRow>();

    if (!row || row.authVersion !== row.userAuthVersion) {
      if (row?.sessionId) {
        await database.prepare(`UPDATE auth_sessions SET revoked_at = ?, revoked_reason = 'auth_version'
          WHERE id = ? AND revoked_at IS NULL`).bind(now, row.sessionId).run();
      }
      return null;
    }

    const lastSeen = Date.parse(row.lastSeenAt);
    if (Number.isFinite(lastSeen) && nowDate.getTime() - lastSeen >= SESSION_REFRESH_MS) {
      const absoluteExpiry = Date.parse(row.absoluteExpiresAt);
      const idleExpiry = new Date(Math.min(nowDate.getTime() + SESSION_IDLE_MS, absoluteExpiry)).toISOString();
      await database.prepare(`UPDATE auth_sessions SET last_seen_at = ?, idle_expires_at = ?
        WHERE id = ? AND revoked_at IS NULL AND last_seen_at = ?`)
        .bind(now, idleExpiry, row.sessionId, row.lastSeenAt).run();
    }

    return { userId: row.userId, email: row.email, displayName: row.displayName };
  } catch {
    console.error('portal_session_lookup_failed');
    return null;
  }
}

export async function revokePortalSession(cookieHeader: string | null, requestHost = '') {
  const token = readSessionToken(cookieHeader, requestHost);
  if (!token) return;
  try {
    await ensureDatabase();
    const now = new Date().toISOString();
    await getD1().prepare(`UPDATE auth_sessions SET revoked_at = ?, revoked_reason = 'logout'
      WHERE token_hash_b64 = ? AND revoked_at IS NULL`)
      .bind(now, await sessionTokenHash(token)).run();
  } catch {
    console.error('portal_session_revocation_failed');
    // The browser cookie is still cleared even if the revocation store is unavailable.
  }
}

export function clearPortalSessionCookies() {
  return [
    `${PRODUCTION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`,
    `${DEVELOPMENT_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
  ];
}

async function ensureBootstrapRecord(
  database: D1Database,
  tenantId: string,
  setup: { code: string; expiresAt: string },
) {
  const codeHash = await keyedDigest(`setup:${tenantId}:${setup.code}`);
  const existing = await database.prepare(`SELECT code_hash_b64 AS codeHash, used_at AS usedAt, expires_at AS expiresAt
    FROM auth_bootstrap WHERE tenant_id = ? LIMIT 1`)
    .bind(tenantId).first<{ codeHash: string | null; usedAt: string | null; expiresAt: string }>();
  if (existing?.usedAt) return;

  const now = new Date().toISOString();
  if (!existing) {
    await database.prepare(`INSERT OR IGNORE INTO auth_bootstrap
      (tenant_id, code_hash_b64, code_key_version, expires_at, used_at, used_by_user_id, created_at, updated_at)
      VALUES (?, ?, 1, ?, NULL, NULL, ?, ?)`)
      .bind(tenantId, codeHash, setup.expiresAt, now, now).run();
    return;
  }
  if (existing.codeHash === codeHash) {
    if (Date.parse(setup.expiresAt) < Date.parse(existing.expiresAt)) {
      await database.prepare(`UPDATE auth_bootstrap SET expires_at = ?, updated_at = ?
        WHERE tenant_id = ? AND used_at IS NULL AND code_hash_b64 = ? AND expires_at > ?`)
        .bind(setup.expiresAt, now, tenantId, codeHash, setup.expiresAt).run();
    }
    return;
  }

  if (existing.codeHash !== codeHash) {
    await database.prepare(`UPDATE auth_bootstrap SET code_hash_b64 = ?, code_key_version = 1,
      expires_at = ?, updated_at = ?
      WHERE tenant_id = ? AND used_at IS NULL
        AND ((code_hash_b64 IS NULL AND ? IS NULL) OR code_hash_b64 = ?)`)
      .bind(codeHash, setup.expiresAt, now, tenantId, existing.codeHash, existing.codeHash).run();
  }
}

async function reserveAuthLimits(
  request: Request,
  database: D1Database,
  tenantId: string,
  flow: 'setup' | 'login',
  email: string,
) {
  const now = Date.now();
  const ip = clientAddress(request);
  const checks = flow === 'setup'
    ? [
        { scope: 'auth-setup-ip-hour', identity: ip, bucketMs: 60 * 60_000, limit: 5 },
        { scope: 'auth-setup-tenant-hour', identity: tenantId, bucketMs: 60 * 60_000, limit: 30 },
      ]
    : [
        { scope: 'auth-login-email-ip-15m', identity: `${email}\n${ip}`, bucketMs: 15 * 60_000, limit: 5 },
        { scope: 'auth-login-ip-15m', identity: ip, bucketMs: 15 * 60_000, limit: 20 },
        { scope: 'auth-login-tenant-5m', identity: tenantId, bucketMs: 5 * 60_000, limit: 100 },
      ];
  const candidates = await Promise.all(checks.map(async (check) => {
    const bucket = Math.floor(now / check.bucketMs);
    return {
      key: await keyedDigest(`${tenantId}:${check.scope}:${check.identity}:${bucket}`),
      maxHits: check.limit,
      expiresAt: new Date((bucket + 1) * check.bucketMs).toISOString(),
    };
  }));
  const rows = candidates.map(() => '(?, ?, ?, ?)').join(', ');
  const nowIso = new Date(now).toISOString();
  const bindings = candidates.flatMap((candidate) => [candidate.key, candidate.maxHits, candidate.expiresAt, nowIso]);
  const reservation = await database.prepare(`WITH candidates(key, max_hits, expires_at, updated_at) AS (
      VALUES ${rows}
    ), eligible AS (
      SELECT 1 AS allowed
      WHERE NOT EXISTS (
        SELECT 1 FROM candidates candidate
        LEFT JOIN rate_limits current ON current.key = candidate.key
        WHERE COALESCE(current.hits, 0) >= candidate.max_hits
      )
    )
    INSERT INTO rate_limits (key, hits, expires_at, updated_at)
    SELECT candidate.key, 1, candidate.expires_at, candidate.updated_at
    FROM candidates candidate CROSS JOIN eligible
    WHERE 1
    ON CONFLICT(key) DO UPDATE SET
      hits = rate_limits.hits + 1,
      expires_at = excluded.expires_at,
      updated_at = excluded.updated_at
    RETURNING key`).bind(...bindings).all<{ key: string }>();
  try {
    await database.prepare('DELETE FROM rate_limits WHERE expires_at < ?').bind(nowIso).run();
  } catch {
    // Rate-limit cleanup is best effort and never changes the current reservation.
  }
  return reservation.results.length === candidates.length;
}

async function newSessionValues(request: Request, tenantId: string, userId: string, authVersion: number, now: Date) {
  const rawToken = randomBytes(SESSION_TOKEN_BYTES);
  const token = `v1.${toBase64Url(rawToken)}`;
  const absoluteExpiresAt = new Date(now.getTime() + SESSION_ABSOLUTE_MS).toISOString();
  return {
    id: crypto.randomUUID(),
    token,
    tokenHash: await sessionTokenHash(token),
    idleExpiresAt: new Date(now.getTime() + SESSION_IDLE_MS).toISOString(),
    absoluteExpiresAt,
    ipHash: await keyedDigest(`session-ip:${tenantId}:${userId}:${clientAddress(request)}`),
    userAgentHash: await keyedDigest(`session-agent:${tenantId}:${userId}:${(request.headers.get('user-agent') || '').slice(0, 512)}`),
    authVersion,
  };
}

function serializeSessionCookie(requestUrl: string, token: string) {
  const secure = new URL(requestUrl).protocol === 'https:';
  const name = secure ? PRODUCTION_COOKIE : DEVELOPMENT_COOKIE;
  return `${name}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(SESSION_ABSOLUTE_MS / 1000)}${secure ? '; Secure' : ''}`;
}

function assertSecureAuthTransport(request: Request) {
  const url = new URL(request.url);
  if (url.protocol === 'https:' || isLoopbackHost(url.host)) return;
  throw new PortalAuthError(
    'secure_connection_required',
    'El acceso administrativo requiere una conexión segura.',
    403,
  );
}

function readSessionToken(cookieHeader: string | null, requestHost: string) {
  if (!cookieHeader) return null;
  const cookies = new Map(cookieHeader.split(';').map((part) => {
    const separator = part.indexOf('=');
    if (separator < 0) return [part.trim(), ''];
    return [part.slice(0, separator).trim(), part.slice(separator + 1).trim()];
  }));
  const value = cookies.get(PRODUCTION_COOKIE) || (isLoopbackHost(requestHost) ? cookies.get(DEVELOPMENT_COOKIE) : '') || '';
  if (!/^v1\.[A-Za-z0-9_-]{43}$/.test(value)) return null;
  return value;
}

function isLoopbackHost(value: string) {
  try {
    const hostname = new URL(/^https?:\/\//i.test(value) ? value : `http://${value}`).hostname
      .replace(/^\[|\]$/g, '')
      .toLowerCase();
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
  } catch {
    return false;
  }
}

function clientAddress(request: Request) {
  const cloudflareAddress = (request.headers.get('cf-connecting-ip') || '').trim();
  if (cloudflareAddress) return cloudflareAddress.slice(0, 80);
  const hostname = new URL(request.url).hostname;
  const loopback = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
  if (loopback) return (request.headers.get('x-forwarded-for')?.split(',')[0] || 'local').trim().slice(0, 80);
  return 'unknown';
}

function normalizeEmail(value: unknown) {
  const email = String(value ?? '').trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new PortalAuthError('invalid_email', 'Escribe un correo válido.', 400);
  }
  return email;
}

function cleanDisplayName(value: unknown) {
  const displayName = String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, 80);
  if (displayName.length < 2) throw new PortalAuthError('invalid_name', 'Escribe el nombre del administrador.', 400);
  return displayName;
}

function validatePassword(value: unknown) {
  const password = String(value ?? '');
  const characters = Array.from(password).length;
  const bytes = encoder.encode(password).byteLength;
  if (characters < 15 || characters > 128 || bytes > 512 || /[\u0000-\u001f\u007f-\u009f]/u.test(password) || !/\S/u.test(password)) {
    throw new PortalAuthError('invalid_password', 'Usa una contraseña de 15 a 128 caracteres, sin caracteres de control.', 400);
  }
  return password;
}

function validatePasswordForLogin(value: unknown) {
  const password = String(value ?? '');
  const characters = Array.from(password).length;
  const bytes = encoder.encode(password).byteLength;
  if (!password || characters > 128 || bytes > 512 || /[\u0000-\u001f\u007f-\u009f]/u.test(password)) {
    throw new PortalAuthError('invalid_credentials', 'Correo o contraseña incorrectos.', 401);
  }
  return password;
}

function normalizeActivationCode(value: unknown) {
  return String(value ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 128);
}

function configuredSetup() {
  const code = normalizeActivationCode(getPortalSetupCode());
  const expiresAtMs = Date.parse(getPortalSetupExpiresAt());
  if (code.length < 16 || !Number.isFinite(expiresAtMs)) throw configurationError();
  return { code, expiresAt: new Date(expiresAtMs).toISOString() };
}

async function derivePasswordHash(password: string, salt: Uint8Array, iterations: number) {
  const pepper = requireSecret(getPortalPasswordPepper(), 'PORTAL_PASSWORD_PEPPER_V1');
  const pepperKey = await crypto.subtle.importKey('raw', pepper, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const prehash = await crypto.subtle.sign('HMAC', pepperKey, encoder.encode(password));
  const key = await crypto.subtle.importKey('raw', prehash, 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations },
    key,
    PASSWORD_HASH_BYTES * 8,
  );
  return new Uint8Array(bits);
}

async function performDummyPasswordWork(password: string, tenantId: string) {
  const dummy = fromBase64Url(await keyedDigest(`dummy-password-salt:${tenantId}`));
  await derivePasswordHash(password, dummy.slice(0, PASSWORD_SALT_BYTES), PASSWORD_ITERATIONS);
}

async function sessionTokenHash(token: string) {
  return keyedDigest(`session-token:${token}`);
}

async function keyedDigest(value: string) {
  const secret = requireSecret(getPortalAuthLookupKey(), 'PORTAL_AUTH_LOOKUP_KEY_V1');
  const key = await crypto.subtle.importKey('raw', secret, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return toBase64Url(new Uint8Array(signature));
}

function requireSecret(value: string, name: string) {
  try {
    const bytes = fromBase64Url(value);
    if (bytes.byteLength >= 32) return bytes;
  } catch {
    // Handled by the configuration error below.
  }
  throw new Error(`portal_auth_configuration:${name}`);
}

function configurationError() {
  return new PortalAuthError('configuration', 'El acceso del portal aún no está configurado.', 503);
}

function randomBytes(length: number) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array) {
  const length = Math.max(left.byteLength, right.byteLength);
  let difference = left.byteLength ^ right.byteLength;
  for (let index = 0; index < length; index += 1) {
    difference |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }
  return difference === 0;
}

function toBase64Url(bytes: Uint8Array) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/g, '');
}

function fromBase64Url(value: string) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error('invalid_base64url');
  const padded = value.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - value.length % 4) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}
