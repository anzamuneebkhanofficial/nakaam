export const ORDER_STATUS_OPTIONS = [
  { value: 'placed', label: 'Order Placed' },
  { value: 'awaiting_payment', label: 'Awaiting Payment' },
  { value: 'awaiting_confirmation', label: 'Awaiting Confirmation' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing in Workshop' },
  { value: 'dispatched', label: 'Dispatched' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'failed_delivery', label: 'Delivery Attempt Failed' },
  { value: 'return_requested', label: 'Return or Exchange Requested' },
  { value: 'returned', label: 'Returned' },
];

const PAYMENT_STATUS_LABELS = {
  unpaid: 'Unpaid',
  awaiting_proof: 'Awaiting Payment Proof',
  proof_submitted: 'Proof Submitted',
  verified: 'Verified',
  rejected: 'Payment Proof Rejected',
  cod_pending: 'Due on Delivery',
  cod_collected: 'Collected',
  refunded: 'Refunded',
};

export function getOrderStatusLabel(status) {
  return ORDER_STATUS_OPTIONS.find((option) => option.value === status)?.label || 'Order Status Updated';
}

export function getPaymentStatusLabel(status) {
  return PAYMENT_STATUS_LABELS[status] || 'Payment Status Unavailable';
}
