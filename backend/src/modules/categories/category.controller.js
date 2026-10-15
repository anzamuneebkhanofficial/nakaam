import { respond } from '../../core/respond.js';
import * as categoryService from './category.service.js';

export async function getCategories(req, res) {
  const tree = await categoryService.getCategoryTree();
  return respond(res, tree);
}

export async function getCategory(req, res) {
  const { slug } = req.params;
  const category = await categoryService.getCategoryBySlug(slug);
  return respond(res, category);
}
