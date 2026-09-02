/// <reference types="@cloudflare/workers-types" />

declare global {
  interface CloudflareEnv {
    DB: D1Database;
    FILES: R2Bucket;
    PORTAL_OWNER_EMAILS?: string;
    SITE_TENANT_ID?: string;
    SITE_NAME?: string;
    ALLOW_LOCAL_PORTAL_PREVIEW?: string;
  }
}

export {};
