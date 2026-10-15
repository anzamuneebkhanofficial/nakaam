// ── Per-section page size defaults (read from environment, fallback to sensible defaults) ──
const toInt = (v, fallback) => {
  const n = parseInt(v, 10);
  return isNaN(n) || n < 1 ? fallback : n;
};

export const PAGE_SIZES = {
  products:          toInt(process.env.PRODUCTS_PAGE_SIZE,         15),
  adminOrders:       toInt(process.env.ADMIN_ORDERS_PAGE_SIZE,     15),
  adminCustomers:    toInt(process.env.ADMIN_CUSTOMERS_PAGE_SIZE,  20),
  adminReviews:      toInt(process.env.ADMIN_REVIEWS_PAGE_SIZE,    20),
  adminCategories:   toInt(process.env.ADMIN_CATEGORIES_PAGE_SIZE, 15),
  adminComplaints:   toInt(process.env.ADMIN_COMPLAINTS_PAGE_SIZE, 20),
  adminCoupons:      toInt(process.env.ADMIN_COUPONS_PAGE_SIZE,    20),
  notifications:     toInt(process.env.NOTIFICATIONS_PAGE_SIZE,    20),
  userOrders:        toInt(process.env.USER_ORDERS_PAGE_SIZE,      10),
  wishlist:          toInt(process.env.WISHLIST_PAGE_SIZE,         24),
  default:           toInt(process.env.PAGINATION_DEFAULT_LIMIT,   20),
};

const MAX_LIMIT = 100;

/**
 * Parses `page` and `limit` from an Express query object.
 * @param {object} query - req.query
 * @param {number} [defaultLimit] - Falls back to PAGE_SIZES.default when omitted.
 */
export function parsePagination(query = {}, defaultLimit = PAGE_SIZES.default) {
  let page = parseInt(query.page, 10);
  if (isNaN(page) || page < 1) page = 1;

  let limit = parseInt(query.limit, 10);
  if (isNaN(limit) || limit < 1) limit = defaultLimit;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Wraps a page of results into the standard paginated envelope.
 * Shape: { items, total, page, limit, totalPages, hasNext, hasPrev }
 */
export function formatPaginated(items, total, page, limit) {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    items,
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
