import mongoose from 'mongoose';
import { Category } from '../categories/category.model.js';
import { Product } from '../products/product.model.js';
import { respond, respondCreated } from '../../core/respond.js';
import { ApiError } from '../../core/apiError.js';
import { invalidateTag } from '../../core/cache/index.js';

export async function listCategories(req, res) {
  if (mongoose.connection.readyState !== 1) {
    const mock = [
      { _id: 'c1', name: 'Kurta Pret', slug: 'kurta-pret', audience: 'women', sortOrder: 1, productCount: 12 },
      { _id: 'c2', name: 'Festive Men', slug: 'festive-men', audience: 'men', sortOrder: 2, productCount: 8 },
    ];
    if (req.query.all === 'true' || !req.query.page) {
      return respond(res, mock);
    }
    return respond(res, {
      docs: mock,
      totalDocs: mock.length,
      limit: 15,
      page: 1,
      totalPages: 1,
    });
  }

  const { page, limit, q, audience, all } = req.query;

  const filter = {};
  if (q && q.trim()) {
    const regex = new RegExp(q.trim(), 'i');
    filter.$or = [{ name: regex }, { slug: regex }];
  }
  if (audience && audience.trim()) {
    filter.audience = audience.trim().toLowerCase();
  }

  // Unpaginated list for dropdown selectors
  if (all === 'true' || !page) {
    const categories = await Category.find(filter).sort({ sortOrder: 1, name: 1 }).lean();
    const withCounts = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({ category: cat._id });
        return { ...cat, productCount: count };
      })
    );
    return respond(res, withCounts);
  }

  // Paginated list for Categories management table
  const p = Math.max(1, parseInt(page, 10) || 1);
  const lim = Math.max(1, Math.min(100, parseInt(limit, 10) || 15));
  const skip = (p - 1) * lim;

  const [categories, totalDocs] = await Promise.all([
    Category.find(filter).sort({ sortOrder: 1, name: 1 }).skip(skip).limit(lim).lean(),
    Category.countDocuments(filter),
  ]);

  const withCounts = await Promise.all(
    categories.map(async (cat) => {
      const count = await Product.countDocuments({ category: cat._id });
      return { ...cat, productCount: count };
    })
  );

  const payload = {
    docs: withCounts,
    totalDocs,
    limit: lim,
    page: p,
    totalPages: Math.ceil(totalDocs / lim) || 1,
  };

  return respond(res, payload, payload);
}

export async function createCategory(req, res) {
  const { name, slug, audience, image, sortOrder = 0 } = req.body;
  if (!name || !slug || !audience) {
    throw ApiError.badRequest('Name, slug, and audience are required');
  }

  const category = await Category.create({
    name,
    slug: slug.toLowerCase().trim(),
    audience,
    image: image || '',
    sortOrder: Number(sortOrder) || 0,
  });

  invalidateTag('categories');
  invalidateTag('category');
  invalidateTag('catalog');
  return respondCreated(res, category);
}

export async function updateCategory(req, res) {
  const { id } = req.params;
  const category = await Category.findByIdAndUpdate(id, { $set: req.body }, { returnDocument: 'after' });
  if (!category) {
    throw ApiError.notFound('Category not found');
  }

  invalidateTag('categories');
  invalidateTag('category');
  invalidateTag('catalog');
  return respond(res, category);
}

export async function deleteCategory(req, res) {
  const { id } = req.params;
  const hasProducts = await Product.exists({ category: id });
  if (hasProducts) {
    throw ApiError.conflict('Cannot delete category with associated products. Reassign products first.');
  }

  await Category.findByIdAndDelete(id);
  invalidateTag('categories');
  invalidateTag('category');
  invalidateTag('catalog');
  return respond(res, { success: true });
}
