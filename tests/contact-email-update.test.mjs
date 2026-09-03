import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { test } from 'node:test';
import { applyContactEmailUpdate } from '../db/contact-email-update.ts';

test('contact update runs once, stays tenant-scoped, and preserves later portal edits', async () => {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(`
    CREATE TABLE site_settings (tenant_id TEXT PRIMARY KEY, contact_email TEXT, updated_at TEXT);
    CREATE TABLE audit_logs (id TEXT PRIMARY KEY, tenant_id TEXT, actor_id TEXT, actor_email TEXT,
      action TEXT, entity_type TEXT, entity_id TEXT, summary TEXT, created_at TEXT);
    INSERT INTO site_settings VALUES ('multiservices-laredo', 'old@example.com', '2026-09-01');
    INSERT INTO site_settings VALUES ('another-company', 'other@example.com', '2026-09-01');
  `);
  const database = {
    prepare(sql) { return { bind(...values) { return { sql, values }; } }; },
    async batch(statements) {
      sqlite.exec('BEGIN');
      try {
        for (const statement of statements) sqlite.prepare(statement.sql).run(...statement.values);
        sqlite.exec('COMMIT');
      } catch (error) {
        sqlite.exec('ROLLBACK');
        throw error;
      }
    },
  };
  const email = () => sqlite.prepare('SELECT contact_email FROM site_settings WHERE tenant_id = ?')
    .get('multiservices-laredo').contact_email;
  try {
    await applyContactEmailUpdate(database, 'multiservices-laredo', 'vacantes@multiservicesldo.com', '2026-09-03');
    assert.equal(email(), 'vacantes@multiservicesldo.com');
    assert.equal(sqlite.prepare('SELECT contact_email FROM site_settings WHERE tenant_id = ?')
      .get('another-company').contact_email, 'other@example.com');
    sqlite.prepare('UPDATE site_settings SET contact_email = ? WHERE tenant_id = ?')
      .run('later@example.com', 'multiservices-laredo');
    await applyContactEmailUpdate(database, 'multiservices-laredo', 'vacantes@multiservicesldo.com', '2026-09-04');
    assert.equal(email(), 'later@example.com');
    assert.equal(sqlite.prepare('SELECT COUNT(*) AS total FROM audit_logs').get().total, 1);
  } finally { sqlite.close(); }
});
