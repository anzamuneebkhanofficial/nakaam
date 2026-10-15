import mongoose from 'mongoose';
import { Category } from './category.model.js';
import { getOrLoad } from '../../core/cache/index.js';
import { TTL } from '../../core/cache/config.js';
import { ApiError } from '../../core/apiError.js';

/**
 * Retrieves the complete active category hierarchy tree
 * Cached via LRU with tag 'categories'
 */
export async function getCategoryTree() {
  const cacheKey = 'categories:tree';

  return getOrLoad(
    cacheKey,
    async () => {
      if (mongoose.connection.readyState !== 1) {
        return [];
      }

      const allCategories = await Category.find({ isActive: true })
        .sort({ sortOrder: 1, name: 1 })
        .lean();

      const categoryMap = new Map();
      const roots = [];

      allCategories.forEach((cat) => {
        categoryMap.set(cat._id.toString(), { ...cat, children: [] });
      });

      allCategories.forEach((cat) => {
        const node = categoryMap.get(cat._id.toString());
        if (cat.parent) {
          const parentNode = categoryMap.get(cat.parent.toString());
          if (parentNode) {
            parentNode.children.push(node);
          } else {
            roots.push(node);
          }
        } else {
          roots.push(node);
        }
      });

      return roots;
    },
    {
      ttl: TTL.CATEGORY,
      tags: ['categories'],
    }
  );
}

/**
 * Retrieves a single category by slug with its children
 */
export async function getCategoryBySlug(slug) {
  if (!slug) {
    throw ApiError.badRequest('Category slug is required');
  }

  const cacheKey = `category:slug:${slug}`;

  return getOrLoad(
    cacheKey,
    async () => {
      if (mongoose.connection.readyState !== 1) {
        throw ApiError.notFound(`Category not found: ${slug}`);
      }

      const category = await Category.findOne({ slug, isActive: true }).lean();
      if (!category) {
        throw ApiError.notFound(`Category not found: ${slug}`);
      }

      const children = await Category.find({ parent: category._id, isActive: true })
        .sort({ sortOrder: 1, name: 1 })
        .lean();

      return {
        ...category,
        children,
      };
    },
    {
      ttl: TTL.CATEGORY,
      tags: ['categories', `category:${slug}`],
    }
  );
}
