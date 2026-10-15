import { respond } from '../../core/respond.js';
import * as cartService from './cart.service.js';

export async function getCart(req, res) {
  const userId = req.user?._id;
  const cart = await cartService.getCart(userId);
  return respond(res, cart);
}

export async function addToCart(req, res) {
  const userId = req.user?._id;
  const { productId, variantSku, quantity, size, color } = req.body;
  const cart = await cartService.addToCart(userId, { productId, variantSku, quantity, size, color });
  return respond(res, cart);
}

export async function updateCartItem(req, res) {
  const userId = req.user?._id;
  const { sku } = req.params;
  const { quantity } = req.body;
  const cart = await cartService.updateCartItem(userId, { variantSku: sku, quantity });
  return respond(res, cart);
}

export async function removeFromCart(req, res) {
  const userId = req.user?._id;
  const { sku } = req.params;
  const cart = await cartService.removeFromCart(userId, sku);
  return respond(res, cart);
}

export async function clearCart(req, res) {
  const userId = req.user?._id;
  await cartService.clearCart(userId);
  return respond(res, { items: [], subtotal: 0, totalQuantity: 0 });
}

export async function mergeGuestCart(req, res) {
  const userId = req.user?._id;
  const { items } = req.body;
  const cart = await cartService.mergeGuestCart(userId, items);
  return respond(res, cart);
}
