/// <reference types="next" />
/// <reference types="next/image-types/global" />

// Augment globalThis with the Catalyst runtime token set by wrapper.ts
declare global {
  var zCatalystAuthToken: string | undefined;
  var zcBucketSignature: string | null | undefined;
}

export {};
