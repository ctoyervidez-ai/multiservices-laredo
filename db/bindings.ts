import { env } from "cloudflare:workers";

type SiteBindings = {
  DB?: D1Database;
  BUCKET?: R2Bucket;
};

export function getApplicationStorage() {
  const bindings = env as unknown as SiteBindings;

  if (!bindings.DB || !bindings.BUCKET) {
    throw new Error("Application storage is unavailable.");
  }

  return { db: bindings.DB, bucket: bindings.BUCKET };
}
