export const ORDER_STATUSES = [
  'placed',
  'awaiting_payment',
  'awaiting_confirmation',
  'confirmed',
  'processing',
  'dispatched',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'failed_delivery',
  'return_requested',
  'returned',
];

export const ORDER_STATUS_LABELS = {
  placed: 'Order Placed',
  awaiting_payment: 'Awaiting Payment',
  awaiting_confirmation: 'Awaiting Confirmation',
  confirmed: 'Confirmed',
  processing: 'Processing in Workshop',
  dispatched: 'Dispatched',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  failed_delivery: 'Delivery Attempt Failed',
  return_requested: 'Return or Exchange Requested',
  returned: 'Returned',
};

export function getOrderStatusLabel(status) {
  return ORDER_STATUS_LABELS[status] || 'Order Status Updated';
}
