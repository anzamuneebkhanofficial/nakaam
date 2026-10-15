import { invalidateTag } from './index.js';

/**
 * Executes a mutation action and invalidates the specified cache tags immediately.
 * Returns an object with the result and the list of invalidated tags for client/server sync.
 *
 * @param {Object} options
 * @param {string[]} options.tags - Array of cache tags to invalidate
 * @param {Function} options.action - Async database/business mutation function
 * @returns {Promise<{ result: any, invalidatedTags: string[] }>}
 */
export async function handleMutation({ tags = [], action }) {
  if (typeof action !== 'function') {
    throw new Error('handleMutation requires an action function');
  }

  const result = await action();

  if (Array.isArray(tags)) {
    for (const tag of tags) {
      if (tag) invalidateTag(tag);
    }
  }

  return {
    result,
    invalidatedTags: tags || [],
  };
}
