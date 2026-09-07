/// <reference types="@cloudflare/workers-types" />

declare global {
  interface CloudflareEnv {
    DB: D1Database;
    FILES: R2Bucket;
    PORTAL_SETUP_CODE?: string;
    PORTAL_SETUP_EXPIRES_AT?: string;
    PORTAL_PASSWORD_PEPPER_V1?: string;
    PORTAL_AUTH_LOOKUP_KEY_V1?: string;
    SITE_TENANT_ID?: string;
    SITE_NAME?: string;
  }
}

export {};
