import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/revalidate
// Body: { "tag": "posts" }
//
// This triggers:
//   1. tagCache.writeTags() → POST /slate/v1/.../route  (uses zCatalystAuthToken — works fine)
//   2. On next request to /posts/[id]: incrementalCache.set() → getBucketSignature() → 401 ❌
export async function POST(req: NextRequest) {
  let body: { tag?: string } = {};

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const tag = body.tag;
  if (!tag || typeof tag !== 'string') {
    return NextResponse.json(
      { error: 'Missing or invalid "tag" field in request body' },
      { status: 400 }
    );
  }

  console.log(`[revalidate] revalidateTag("${tag}") called`);
  console.log('[revalidate] After this, next request to /posts/[id] will trigger ISR re-render');
  console.log('[revalidate] ISR re-render → incrementalCache.set() → getBucketSignature() → expected 401');

  try {
    revalidateTag(tag);
    console.log(`[revalidate] Tag "${tag}" invalidated successfully`);
  } catch (err) {
    console.error('[revalidate] revalidateTag failed:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    revalidated: true,
    tag,
    timestamp: new Date().toISOString(),
    next_step: `Now hit /posts/1 — ISR will re-render and call getBucketSignature() → expect 401`,
  });
}

// GET /api/revalidate — usage info
export async function GET() {
  return NextResponse.json({
    usage: 'POST /api/revalidate with body: { "tag": "posts" }',
    available_tags: ['posts', 'post-1', 'post-2', 'post-3'],
    example_curl: `curl -X POST https://your-app.zohostratus.in/api/revalidate -H "Content-Type: application/json" -d '{"tag":"posts"}'`,
  });
}
