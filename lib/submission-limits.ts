export async function withinSubmissionLimits(request: Request, database: D1Database, tenantId: string, email: string) {
  const address = (request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown').trim();
  const now = Date.now();
  const checks = [
    { scope: 'ip-15m', identity: address, bucketMs: 15 * 60_000, limit: 8 },
    { scope: 'ip-day', identity: address, bucketMs: 24 * 60 * 60_000, limit: 30 },
    { scope: 'email-day', identity: email, bucketMs: 24 * 60 * 60_000, limit: 5 },
    { scope: 'tenant-day', identity: tenantId, bucketMs: 24 * 60 * 60_000, limit: 500 },
  ];

  const candidates = await Promise.all(checks.map(async (check) => {
    const bucket = Math.floor(now / check.bucketMs);
    const key = await digestKey(`${tenantId}:${check.scope}:${check.identity}:${bucket}`);
    return {
      key,
      maxHits: check.limit,
      expiresAt: new Date((bucket + 1) * check.bucketMs).toISOString(),
    };
  }));
  const valueRows = candidates.map(() => '(?, ?, ?, ?)').join(', ');
  const nowIso = new Date(now).toISOString();
  const bindings = candidates.flatMap((candidate) => [candidate.key, candidate.maxHits, candidate.expiresAt, nowIso]);
  const reservation = await database.prepare(`WITH candidates(key, max_hits, expires_at, updated_at) AS (
      VALUES ${valueRows}
    ), eligible AS (
      SELECT 1 AS allowed
      WHERE NOT EXISTS (
        SELECT 1 FROM candidates AS candidate
        LEFT JOIN rate_limits AS current ON current.key = candidate.key
        WHERE COALESCE(current.hits, 0) >= candidate.max_hits
      )
    )
    INSERT INTO rate_limits (key, hits, expires_at, updated_at)
    SELECT candidate.key, 1, candidate.expires_at, candidate.updated_at
    FROM candidates AS candidate CROSS JOIN eligible
    WHERE 1
    ON CONFLICT(key) DO UPDATE SET
      hits = rate_limits.hits + 1,
      expires_at = excluded.expires_at,
      updated_at = excluded.updated_at
    RETURNING key, hits`).bind(...bindings).all<{ key: string; hits: number }>();
  if (reservation.results.length !== candidates.length) return false;

  if (Math.random() < 0.02) {
    await database.prepare('DELETE FROM rate_limits WHERE expires_at < ?').bind(new Date(now).toISOString()).run();
  }
  return true;
}

async function digestKey(value: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
