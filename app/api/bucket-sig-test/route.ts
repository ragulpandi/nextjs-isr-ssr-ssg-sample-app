import { NextResponse } from 'next/server';

// GET /api/bucket-sig-test
//
// Directly reproduces the 401 without needing to trigger ISR.
//
// This mirrors exactly what stratus.ts:getHeaders() does:
//   1. Reads zCatalystAuthToken (set by wrapper.ts from x-zc-admin-cred-token)
//   2. Calls POST /slate/v1/project/{projectId}/app/{appId}/bucket/signature
//      with Authorization: Bearer <zCatalystAuthToken>
//   3. zgraphql's validateAppVerificationTokenAccess() → 401
//
// The auth token here is the ZFunctions IAM token injected by zohobaas.
// zgraphql expects a SlatePipelineCLI app-verification token.
export async function GET() {
  const apiDomain = process.env.X_ZOHO_CATALYST_CONSOLE_URL;
  const projectId = process.env.ZC_PROJECT_ID;
  const appId = process.env.ZC_APP_ID;
  const authToken = (globalThis as { zCatalystAuthToken?: string }).zCatalystAuthToken;

  const missingVars: string[] = [];
  if (!apiDomain) missingVars.push('X_ZOHO_CATALYST_CONSOLE_URL');
  if (!projectId) missingVars.push('ZC_PROJECT_ID');
  if (!appId) missingVars.push('ZC_APP_ID');
  if (!authToken) missingVars.push('globalThis.zCatalystAuthToken (from x-zc-admin-cred-token header)');

  if (missingVars.length > 0) {
    return NextResponse.json(
      {
        error: 'Missing required configuration',
        missing: missingVars,
        hint: 'This endpoint must be called from within AppSail (Catalyst). Run locally with env vars set.',
      },
      { status: 500 }
    );
  }

  const endpoint = `${apiDomain}/slate/v1/project/${projectId}/app/${appId}/bucket/signature`;
  console.log(`[bucket-sig-test] Calling: POST ${endpoint}`);
  console.log(`[bucket-sig-test] Using zCatalystAuthToken (${authToken!.length} chars)`);

  let responseStatus: number;
  let responseBody: unknown;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    responseStatus = res.status;
    console.log(`[bucket-sig-test] Response: ${res.status} ${res.statusText}`);

    try {
      responseBody = await res.json();
    } catch {
      responseBody = await res.text();
    }

    const is401 = res.status === 401;
    const isSuccess = res.status >= 200 && res.status < 300;

    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        endpoint,
        token_present: true,
        token_prefix: authToken!.substring(0, 12) + '...',
        response_status: responseStatus,
        response_body: responseBody,
        result: isSuccess ? 'SUCCESS ✅' : is401 ? 'BUG CONFIRMED: 401 ❌' : `UNEXPECTED: ${res.status}`,
        explanation: is401
          ? 'CONFIRMED: zCatalystAuthToken (ZFunctions IAM token with applicationZid=null) was rejected by ' +
            'AppexAppController.validateAppVerificationTokenAccess(). zgraphql requires a SlatePipelineCLI ' +
            'app-verification token. Fix: relax validateAppVerificationTokenAccess() in AppexAppController.getBucketSignature().'
          : isSuccess
          ? 'Bucket signature obtained successfully. ISR writes should work.'
          : `Unexpected response from bucket signature endpoint.`,
      },
      { status: isSuccess ? 200 : 500 }
    );
  } catch (err) {
    console.error('[bucket-sig-test] Network error:', err);
    return NextResponse.json(
      {
        error: 'Network error calling bucket signature endpoint',
        endpoint,
        detail: String(err),
      },
      { status: 500 }
    );
  }
}
