import { respond, respondCreated, respondNoContent } from '../../core/respond.js';
import * as productsService from './products.service.js';

export async function listProducts(req, res) {
  const result = await productsService.listAdminProducts(req.query);
  return respond(
    res,
    {
      docs: result.docs,
      totalDocs: result.totalDocs,
      limit: result.limit,
      page: result.page,
      totalPages: result.totalPages,
    },
    {
      totalDocs: result.totalDocs,
      limit: result.limit,
      page: result.page,
      totalPages: result.totalPages,
    }
  );
}

export async function createDraft(req, res) {
  if (req.body && Object.keys(req.body).length > 0) {
    const created = await productsService.createProduct(req.body);
    return respondCreated(res, created);
  }
  const draft = await productsService.createDraftProduct();
  return respondCreated(res, draft);
}

export async function getProduct(req, res) {
  const product = await productsService.getProductById(req.params.id);
  return respond(res, product);
}

export async function updateProduct(req, res) {
  const updated = await productsService.updateProduct(req.params.id, req.body);
  return respond(res, updated);
}


export async function deleteProduct(req, res) {
  const result = await productsService.deleteProduct(req.params.id);
  return respond(res, result);
}

export async function updateStock(req, res) {
  const { id, sku } = req.params;
  const { stock } = req.body;
  const result = await productsService.updateVariantStock(id, sku, stock);
  return respond(res, result);
}
