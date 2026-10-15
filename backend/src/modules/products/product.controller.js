import { respond } from '../../core/respond.js';
import * as productService from './product.service.js';

export async function getProducts(req, res) {
  const result = await productService.listProducts(req.query);
  return respond(res, result.items, result.pagination);
}

export async function getProduct(req, res) {
  const { slug } = req.params;
  const product = await productService.getProductBySlug(slug);
  return respond(res, product);
}

export async function getFacets(req, res) {
  const facets = await productService.getProductFacets();
  return respond(res, facets);
}
