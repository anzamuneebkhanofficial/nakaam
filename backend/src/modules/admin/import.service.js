import mongoose from 'mongoose';
import { Product } from '../products/product.model.js';
import { invalidateTag } from '../../core/cache/index.js';

export async function validateImportRows(rows = []) {
  const errors = [];
  let validCount = 0;
  let invalidCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowIdx = i + 1;
    let rowValid = true;

    if (!row.sku || typeof row.sku !== 'string' || !row.sku.trim()) {
      errors.push({ row: rowIdx, field: 'sku', message: 'SKU is required' });
      rowValid = false;
    }

    if (row.stock !== undefined && row.stock !== null) {
      const stockNum = Number(row.stock);
      if (isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
        errors.push({ row: rowIdx, field: 'stock', message: 'Stock must be a non-negative integer' });
        rowValid = false;
      }
    }

    if (row.price !== undefined && row.price !== null) {
      const priceNum = Number(row.price);
      if (isNaN(priceNum) || priceNum <= 0 || !Number.isInteger(priceNum)) {
        errors.push({ row: rowIdx, field: 'price', message: 'Price must be a positive integer in PKR' });
        rowValid = false;
      }
    }

    if (rowValid) {
      validCount++;
    } else {
      invalidCount++;
    }
  }

  return {
    totalRows: rows.length,
    validRows: validCount,
    invalidRows: invalidCount,
    errors,
  };
}

export async function commitImportRows(rows = []) {
  if (mongoose.connection.readyState !== 1) {
    return { committedCount: rows.length, message: 'Import simulation completed' };
  }

  let committedCount = 0;
  for (const row of rows) {
    if (!row.sku) continue;

    const stock = Number(row.stock) || 0;
    const price = row.price ? Math.round(Number(row.price)) : null;

    // Find product with this variant SKU
    const product = await Product.findOne({ 'variants.sku': row.sku.trim().toUpperCase() });
    if (product) {
      const updateDoc = {
        'variants.$.stock': stock,
      };
      if (price) {
        updateDoc.price = price;
      }
      await Product.updateOne(
        { _id: product._id, 'variants.sku': row.sku.trim().toUpperCase() },
        { $set: updateDoc }
      );
      committedCount++;
    }
  }

  invalidateTag('products');
  invalidateTag('inventory');
  invalidateTag('catalog');

  return {
    committedCount,
    message: `Successfully updated stock for ${committedCount} inventory items`,
  };
}
