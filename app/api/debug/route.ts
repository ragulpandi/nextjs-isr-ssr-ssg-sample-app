import { NextRequest, NextResponse } from 'next/server';

// GET /api/debug
//
// Returns the Catalyst/Slate runtime environment variables and inbound headers.
// Safe to expose: no secret values are returned — only presence/absence and
// safe derived info is shown for token headers.
export async function GET(req: NextRequest) {
  // Catalyst/Slate environment variables injected by zohobaas into every AppSail function
  const catalystEnvVars = {
    // Stratus (object storage) — required for ISR cache writes
    ZC_STRATUS_BUCKET: process.env.ZC_STRATUS_BUCKET ?? null,
    ZC_STRATUS_DOMAIN: process.env.ZC_STRATUS_DOMAIN ?? null,
    ZC_STRATUS_PREFIX: process.env.ZC_STRATUS_PREFIX ?? null,

    // Catalyst project / app identity
    ZC_ORG_ID: process.env.ZC_ORG_ID ?? null,
    ZC_PROJECT_ID: process.env.ZC_PROJECT_ID ?? null,
    ZC_APP_ID: process.env.ZC_APP_ID ?? null,
    ZC_APP_NAME: process.env.ZC_APP_NAME ?? null,

    // Catalyst console URL — used as apiDomain in tag-cache.ts
    X_ZOHO_CATALYST_CONSOLE_URL: process.env.X_ZOHO_CATALYST_CONSOLE_URL ?? null,

    // Data center
    ZC_DC: process.env.ZC_DC ?? null,
    ZC_REGION: process.env.ZC_REGION ?? null,

    // Build ID — used as Stratus object key prefix
    NEXT_BUILD_ID: process.env.NEXT_BUILD_ID ?? null,

    // Misc Next.js / platform
    NODE_ENV: process.env.NODE_ENV ?? null,
    NEXT_RUNTIME: process.env.NEXT_RUNTIME ?? null,
  };

  // Inbound headers — show presence of auth headers without leaking values
  const inboundHeaders: Record<string, string | boolean | null> = {};
  const sensitiveHeaders = [
    'x-zc-admin-cred-token',  // ZFunctions token from zohobaas — used as zCatalystAuthToken
    'authorization',
    'cookie',
  ];
  const safeHeaders = [
    'x-zc-org-id',
    'x-zc-project-id',
    'x-zc-app-id',
    'x-forwarded-for',
    'host',
    'user-agent',
    'x-forwarded-proto',
  ];

  for (const header of sensitiveHeaders) {
    const value = req.headers.get(header);
    inboundHeaders[header] = value !== null
      ? `[PRESENT — ${value.length} chars, prefix: ${value.substring(0, 12)}...]`
      : null;
  }

  for (const header of safeHeaders) {
    inboundHeaders[header] = req.headers.get(header);
  }

  // Diagnose the bug: zCatalystAuthToken is set from x-zc-admin-cred-token
  // getBucketSignature() sends this token to zgraphql's /bucket/signature endpoint
  // zgraphql expects a SlatePipelineCLI app verification token → 401
  const diagnosis = {
    admin_cred_token_present: req.headers.get('x-zc-admin-cred-token') !== null,
    stratus_bucket_configured: !!process.env.ZC_STRATUS_BUCKET,
    console_url_configured: !!process.env.X_ZOHO_CATALYST_CONSOLE_URL,
    project_id_configured: !!process.env.ZC_PROJECT_ID,
    app_id_configured: !!process.env.ZC_APP_ID,
    bucket_signature_endpoint: process.env.X_ZOHO_CATALYST_CONSOLE_URL && process.env.ZC_PROJECT_ID && process.env.ZC_APP_ID
      ? `${process.env.X_ZOHO_CATALYST_CONSOLE_URL}/slate/v1/project/${process.env.ZC_PROJECT_ID}/app/${process.env.ZC_APP_ID}/bucket/signature`
      : 'NOT DERIVABLE — missing env vars',
    expected_401_reason:
      'x-zc-admin-cred-token is a ZFunctions IAM OAuth token (applicationZid=null). ' +
      'AppexAppController.getBucketSignature() calls validateAppVerificationTokenAccess() which ' +
      'requires applicationZid = "{projectId}.SlatePipelineCLI". Mismatch → 401.',
  };

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    catalyst_env_vars: catalystEnvVars,
    inbound_headers: inboundHeaders,
    diagnosis,
  });
}
