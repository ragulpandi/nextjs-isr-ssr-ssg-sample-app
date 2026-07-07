# ISR Test App — Catalyst/Slate 401 Bug Reproduction

> **Bug**: `getBucketSignature()` returns 401 from zgraphql during ISR cache writes.

## The Bug

When a Next.js page with `export const revalidate = 30` (ISR) is deployed to Slate/AppSail,
the first render (and every re-render after the TTL expires) fails silently because:

```
Request hits AppSail
  → wrapper.ts: globalThis.zCatalystAuthToken = req.headers["x-zc-admin-cred-token"]
  → Next.js renders /posts/[id]
  → incrementalCache.set(key, html)
    → stratusClient.putObject(key, html)
      → stratus.getHeaders()
        → globalThis.zcBucketSignature is null
          → getBucketSignature()
            → POST /slate/v1/project/{projectId}/app/{appId}/bucket/signature
                 Authorization: Bearer <zCatalystAuthToken>   ← ZFunctions IAM token
            ← 401 UNAUTHORISED  ❌
               validateAppVerificationTokenAccess() failed:
               token.applicationZid = null, expected "{projectId}.SlatePipelineCLI"
```

### Root Cause

| What | Detail |
|------|--------|
| **Token sent** | ZFunctions IAM OAuth token (from `x-zc-admin-cred-token` header, injected by `zohobaas`) |
| **Token type** | `applicationZid = null` |
| **Token expected** | `SlatePipelineCLI` app-verification token with `applicationZid = "{projectId}.SlatePipelineCLI"` |
| **Validation** | `AppexAppController.validateAppVerificationTokenAccess()` in zgraphql |
| **Effect** | ISR cache write to Stratus silently fails; pages are never cached, every request is a full server render |

## Setup

```bash
npm install
npm run dev
```

App runs on `http://localhost:3000`.

## Local Testing (without Catalyst)

Most debug features need the AppSail environment. To test locally:

```bash
# Set env vars to simulate the Catalyst runtime
export X_ZOHO_CATALYST_CONSOLE_URL=https://catalyst.zoho.in
export ZC_PROJECT_ID=your_project_id
export ZC_APP_ID=your_app_id
export ZC_ORG_ID=your_org_id
export ZC_STRATUS_BUCKET=your_bucket
export ZC_STRATUS_DOMAIN=https://your_bucket.zohostratus.in
export ZC_DC=IN

npm run dev
```

## Deploying to Slate

1. **Ensure Slate project is set up** (Framework: Next.js)
2. Run `npx zcatalyst-nextjs` in project root to patch `next.config.js`
3. Deploy via the Slate deployer pipeline or direct upload

## Reproduction Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/posts/1` | GET | ISR page — triggers `getBucketSignature()` on first load/after 30s |
| `/api/bucket-sig-test` | GET | **Best reproduction** — directly calls getBucketSignature() |
| `/api/debug` | GET | Shows all injected env vars and headers (no secrets leaked) |
| `/api/revalidate` | POST | `revalidateTag(tag)` → invalidates ISR cache → next hit reproduces bug |

### Quickest reproduction on Slate:

```bash
# 1. Check env vars are injected
curl https://your-app.example.com/api/debug | jq .diagnosis

# 2. Directly test getBucketSignature() — should show: "BUG CONFIRMED: 401 ❌"
curl https://your-app.example.com/api/bucket-sig-test | jq .result

# 3. Trigger ISR and then load page
curl -X POST https://your-app.example.com/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"tag":"posts"}'
curl https://your-app.example.com/posts/1
# Check AppSail logs — you'll see: 401 on /bucket/signature
```

## Fix Options

### Option 1 — zgraphql (Recommended)

In `AppexAppController.java`, `getBucketSignature()` — relax the access check:

```java
// BEFORE: strict app-verification token check (blocks ZFunctions runtime token)
if (!validateAppVerificationTokenAccess(projectDetails)) {
    throw new AppexAppException(UNAUTHORISED, "This endpoint requires app verification...");
}

// AFTER: allow if already validated by CommonValidationInterceptor
// (the interceptor validates projectId ownership — no need for extra check here)
// Remove the validateAppVerificationTokenAccess() call or add:
// || IAMUtil.getCurrentTokenType() == OAUTHTOKEN  (allow standard OAuth too)
```

### Option 2 — opennextjs-zcatalyst

In `tag-cache.ts`, export a `getBucketSignature()` that uses a different token:

```typescript
// Inject the pipeline token at build time / startup, not the per-request ZFunctions token
```

### Option 3 — zohobaas

Inject a separate `x-zc-pipeline-token` header containing the `SlatePipelineCLI` token
alongside `x-zc-admin-cred-token`.

## Project Structure

```
isr-test-app/
├── app/
│   ├── layout.tsx                     ← Root layout
│   ├── page.tsx                       ← Home page with links and instructions
│   ├── posts/[id]/
│   │   └── page.tsx                   ← ISR page (revalidate=30, tags=[posts, post-{id}])
│   └── api/
│       ├── debug/route.ts             ← Env var + header inspection
│       ├── revalidate/route.ts        ← revalidateTag() trigger
│       └── bucket-sig-test/route.ts  ← Direct getBucketSignature() reproduction
├── global.d.ts                        ← globalThis type declarations
├── next.config.js
├── package.json
└── tsconfig.json
```
