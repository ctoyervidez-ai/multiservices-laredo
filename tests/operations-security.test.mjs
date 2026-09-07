import assert from 'node:assert/strict';
import { test, beforeEach } from 'node:test';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { createRequire } from 'node:module';
import { DatabaseSync } from 'node:sqlite';
import ts from 'typescript';

const root = resolve(import.meta.dirname, '..'), require = createRequire(import.meta.url);
let sqlite, emailConfig, tenant = 'test-tenant', messages = [];
const pepper = Buffer.alloc(32, 5).toString('base64url'), lookup = Buffer.alloc(32, 7).toString('base64url');
function prepare(sql) {
  let args = [];
  const statement = {
    bind(...values) { args = values; return statement; },
    async first() { return sqlite.prepare(sql).get(...args) || null; },
    async all() { return { results: sqlite.prepare(sql).all(...args) }; },
    async run() { const result = sqlite.prepare(sql).run(...args); return { meta: { changes: Number(result.changes) } }; },
  };
  return statement;
}
const database = { prepare, async batch(statements) { sqlite.exec('BEGIN'); try { const results = []; for (const item of statements) results.push(await item.run()); sqlite.exec('COMMIT'); return results; } catch (e) { sqlite.exec('ROLLBACK'); throw e; } } };
const dbMock = { getD1: () => database, getSiteTenantId: () => tenant, getSiteName: () => 'Test Site', ensureDatabase: async () => {}, getEmailConfig: () => emailConfig, getPortalPasswordPepper: () => pepper, getPortalAuthLookupKey: () => lookup, getPortalSetupCode: () => 'test-activation-only', getPortalSetupExpiresAt: () => '2099-01-01T00:00:00.000Z' };
const cache = new Map();
function load(path) {
  if (cache.has(path)) return cache.get(path);
  const code = ts.transpileModule(readFileSync(path, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {}; cache.set(path, exports);
  const importer = name => name === '@/db' ? dbMock : name.startsWith('@/') ? load(resolve(root, `${name.slice(2)}.ts`)) : name.startsWith('.') ? load(resolve(dirname(path), `${name}.ts`)) : require(name);
  new Function('require', 'exports', code)(importer, exports);
  return exports;
}
const auth = load(resolve(root, 'lib/portal-auth.ts'));
const notifications = load(resolve(root, 'lib/notifications.ts'));
const email = load(resolve(root, 'lib/email-delivery.ts'));
const operations = load(resolve(root, 'app/api/portal/operations/route.ts'));
beforeEach(() => {
  sqlite?.close(); sqlite = new DatabaseSync(':memory:'); tenant = 'test-tenant'; emailConfig = null; messages = [];
  for (const file of readdirSync(resolve(root, 'drizzle')).filter(f => f.endsWith('.sql')).sort()) sqlite.exec(readFileSync(resolve(root, 'drizzle', file), 'utf8'));
  for (const id of ['test-tenant','another-tenant']) sqlite.prepare("INSERT INTO tenants VALUES (?, ?, 'Test', 'active', ?, ?)").run(id, id, new Date().toISOString(), new Date().toISOString());
});
const request = (body = {}) => new Request('http://localhost:3001/api/portal/auth/reset', { method: 'POST', headers: { origin: 'http://localhost:3001', 'content-type': 'application/json' }, body: JSON.stringify(body) });
async function admin() {
  return auth.createInitialPortalAdmin(request(), { displayName: 'Local Test Admin', email: 'owner@example.test', password: 'Original-test-password-123!', confirmPassword: 'Original-test-password-123!', activationCode: 'test-activation-only' });
}
test('all migrations apply together; inquiry deduplication is tenant scoped', () => {
  const insert = sqlite.prepare(`INSERT INTO inquiries (id,tenant_id,reference,submission_key,full_name,company,phone,email,need,consent_at,created_at,updated_at) VALUES (?, ?, ?, 'same-key','Test','Company','9565550100','test@example.test','Need','now','now','now')`);
  insert.run('one','test-tenant','REF-1');
  assert.throws(() => insert.run('two','test-tenant','REF-2'), /UNIQUE/);
  insert.run('three','another-tenant','REF-3');
});
test('email adapter uses stable idempotency key and never treats provider errors as accepted', async () => {
  const config = { apiKey: 'test-only-key', from: 'sender@example.test' };
  const transport = async (url, options) => { assert.equal(url, 'https://api.resend.com/emails'); assert.equal(options.headers['idempotency-key'], 'stable-key'); assert.deepEqual(JSON.parse(options.body).to, ['to@example.test']); return Response.json({ id: 'provider-id' }); };
  assert.equal(await email.deliverEmail(config, { to: 'to@example.test', subject: 'Test', text: 'Body' }, 'stable-key', transport), 'provider-id');
  await assert.rejects(email.deliverEmail(config, { to: 'to@example.test', subject: 'Test', text: 'Body' }, 'stable-key', async () => new Response(null, { status: 429 })), /email_provider_429/);
});
test('outbox stays pending without configuration, retries safely, and does not resend accepted messages', async () => {
  sqlite.prepare(`INSERT INTO notifications (id,tenant_id,entity_id,recipient,subject,body,status,created_at) VALUES ('notice','test-tenant','entity','to@example.test','Test','Text','pending',?)`).run(new Date().toISOString());
  await notifications.flushNotifications(tenant);
  assert.equal(sqlite.prepare('SELECT status FROM notifications').get().status, 'pending');
  emailConfig = { apiKey: 'test', from: 'sender@example.test' };
  const original = globalThis.fetch;
  globalThis.fetch = async (url, options) => { messages.push(options); return Response.json({ id: 'accepted-id' }); };
  try { await notifications.flushNotifications(tenant); await notifications.flushNotifications(tenant); }
  finally { globalThis.fetch = original; }
  assert.equal(messages.length, 1);
  assert.equal(sqlite.prepare('SELECT status FROM notifications').get().status, 'accepted');
  assert.equal(sqlite.prepare('SELECT body FROM notifications').get().body, '');
});
test('uncertain sends outside the idempotency window require review; another tenant is untouched', async () => {
  emailConfig = { apiKey: 'test', from: 'sender@example.test' };
  const old = new Date(Date.now() - 25 * 3600_000).toISOString();
  for (const id of ['test-tenant','another-tenant']) sqlite.prepare(`INSERT INTO notifications (id,tenant_id,entity_id,recipient,subject,body,status,created_at,first_attempt_at,attempted_at) VALUES (?,?,'entity','test@example.test','Test','Text','sending',?,?,?)`).run(id,id,old,old,old);
  await notifications.flushNotifications(tenant);
  assert.equal(sqlite.prepare('SELECT status FROM notifications WHERE tenant_id = ?').get(tenant).status, 'review');
  assert.equal(sqlite.prepare('SELECT status FROM notifications WHERE tenant_id = ?').get('another-tenant').status, 'sending');
});
test('password reset is single use, tenant scoped and revokes prior sessions', async () => {
  const signedIn = await admin();
  const cookie = signedIn.setCookie.split(';')[0];
  assert.ok(await auth.getPortalIdentityFromCookie(cookie, 'localhost:3001'));
  emailConfig = { apiKey: 'test', from: 'sender@example.test' };
  const original = globalThis.fetch;
  globalThis.fetch = async (url, options) => { messages.push(JSON.parse(options.body)); return Response.json({ id: 'test-provider' }); };
  try {
    await auth.requestPasswordReset(request(), { email: 'unknown@example.test' });
    assert.equal(messages.length, 0);
    await auth.requestPasswordReset(request(), { email: 'owner@example.test' });
  } finally { globalThis.fetch = original; }
  assert.equal(messages.length, 1);
  const token = messages[0].text.match(/#token=([A-Za-z0-9_-]+)/)[1];
  assert.notEqual(sqlite.prepare('SELECT token_hash FROM password_resets').get().token_hash, token);
  const input = { token, password: 'Replacement-test-password-456!', confirmPassword: 'Replacement-test-password-456!' };
  sqlite.prepare("UPDATE password_resets SET expires_at = '2000-01-01T00:00:00.000Z'").run();
  await assert.rejects(auth.completePasswordReset(request(), input), /enlace/);
  sqlite.prepare("UPDATE password_resets SET expires_at = '2099-01-01T00:00:00.000Z'").run();
  tenant = 'another-tenant';
  await assert.rejects(auth.completePasswordReset(request(), input), /enlace/);
  tenant = 'test-tenant';
  await auth.completePasswordReset(request(), input);
  assert.equal(await auth.getPortalIdentityFromCookie(cookie, 'localhost:3001'), null);
  await assert.rejects(auth.completePasswordReset(request(), input), /enlace/);
  assert.ok((await auth.authenticatePortalAdmin(request(), { email: 'owner@example.test', password: input.password })).identity);
});
test('only the owner can read business contacts; cross-tenant IDs cannot be updated', async () => {
  const result = await admin(), cookie = result.setCookie.split(';')[0];
  const privateRequest = new Request('http://localhost:3001/api/portal/operations', { headers: { cookie } });
  sqlite.prepare("UPDATE memberships SET role = 'recruiter' WHERE tenant_id = ?").run(tenant);
  assert.equal((await operations.GET(privateRequest)).status, 403);
  sqlite.prepare("UPDATE memberships SET role = 'owner' WHERE tenant_id = ?").run(tenant);
  sqlite.prepare(`INSERT INTO inquiries (id,tenant_id,reference,submission_key,full_name,company,phone,email,need,consent_at,created_at,updated_at) VALUES ('other','another-tenant','REF','key','Test','Company','9565550100','test@example.test','Need','now','now','now')`).run();
  const mutate = new Request('http://localhost:3001/api/portal/operations', { method:'POST', headers: { origin: 'http://localhost:3001', 'content-type': 'application/json', cookie }, body: JSON.stringify({ action:'inquiry_status',id:'other',status:'won' }) });
  assert.equal((await operations.POST(mutate)).status, 404);
  assert.equal(sqlite.prepare("SELECT status FROM inquiries WHERE id='other'").get().status, 'new');
});
