'use server';

import { revalidateTag } from 'next/cache';

/**
 * Server Action to sync Next.js server cache invalidations with backend mutations
 * @param {string[]} tags
 */
export async function invalidateTags(tags = []) {
  if (!Array.isArray(tags)) return;
  for (const tag of tags) {
    if (tag && typeof tag === 'string') {
      try {
        revalidateTag(tag);
      } catch (err) {
        console.warn(`[Cache] Failed to revalidate tag: ${tag}`, err);
      }
    }
  }
}
