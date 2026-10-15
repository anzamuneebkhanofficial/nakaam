/**
 * Editorial Email Templates (Paper & Ink Theme)
 * Canvas: #F6F2EC | Card: #FFFFFF | Border: #E6E1DA | Ink: #151515 | Accent: #D12C2F
 */

import { env } from '../../../config/env.js';
import { getOrderStatusLabel } from '../../orders/order.constants.js';

export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const EMAIL_SHELL_HEADER = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 40px 20px; background-color: #F6F2EC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #151515; }
    .container { max-width: 580px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E6E1DA; border-radius: 20px; overflow: hidden; padding: 40px 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
    .brand-mark { text-align: center; margin-bottom: 28px; }
    .brand-dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: #D12C2F; margin-bottom: 8px; }
    .brand-title { font-family: Georgia, 'Times New Roman', serif; font-size: 26px; font-weight: 700; margin: 0; color: #151515; letter-spacing: -0.5px; }
    .brand-subtitle { font-size: 11px; text-transform: uppercase; letter-spacing: 1.8px; color: #6B6B6B; margin: 4px 0 0 0; }
    .btn-primary { display: inline-block; background-color: #151515; color: #FFFFFF !important; font-size: 13px; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 12px; letter-spacing: 0.5px; }
    .btn-crimson { display: inline-block; background-color: #D12C2F; color: #FFFFFF !important; font-size: 13px; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 12px; letter-spacing: 0.5px; }
    .footer-divider { border: none; border-top: 1px solid #E6E1DA; margin: 36px 0 20px 0; }
    .footer-text { font-size: 11px; color: #8C8C8C; text-align: center; margin: 0; line-height: 1.6; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="container">
    <div class="brand-mark">
      <div class="brand-dot"></div>
      <h1 class="brand-title">NAKAAM</h1>
      <p class="brand-subtitle">Atelier &bull; Lahore &bull; Pret &amp; Fabric</p>
    </div>
`;

const EMAIL_SHELL_FOOTER = `
    <hr class="footer-divider" />
    <p class="footer-text">
      <strong>Nakaam Atelier (ناکام)</strong><br />
      Gulberg III, Industrial Area, Lahore, Pakistan<br />
      Concierge Helpline: +92 42 111 625 226 &bull; WhatsApp: +92 300 1234567<br />
      &copy; ${new Date().getFullYear()} Nakaam. All rights reserved.
    </p>
  </div>
</body>
</html>
`;

/**
 * 1. Welcome & Email Verification Template
 */
export function verifyEmailTemplate({ name = 'Customer', url }) {
  const safeName = escapeHtml(name);
  const safeUrl = escapeHtml(url);

  return {
    subject: 'Welcome to Nakaam — Verify your atelier account',
    html: `
      ${EMAIL_SHELL_HEADER}
      <h2 style="font-family: Georgia, serif; font-size: 20px; font-weight: 700; margin: 0 0 16px 0; color: #151515;">Welcome to Nakaam, ${safeName}</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #3A3A3A; margin: 0 0 20px 0;">
        We are honored to welcome you into our circle of patrons. At Nakaam, every garment is drafted with honest silhouettes, unyielding quality, and genuine Pakistani craftsmanship.
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #3A3A3A; margin: 0 0 28px 0;">
        Please confirm your email address below to activate your account and enable doorstep inspection across Pakistan.
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${safeUrl}" class="btn-crimson">Verify Email Address</a>
      </div>

      <div style="background-color: #F6F2EC; border: 1px solid #E6E1DA; border-radius: 12px; padding: 16px; margin: 24px 0;">
        <p style="font-size: 12px; margin: 0; color: #6B6B6B; line-height: 1.5;">
          <strong>Patron Guarantee:</strong> You will enjoy complimentary sizing consults, automated fit recommendations, and express dispatch on all orders.
        </p>
      </div>
      ${EMAIL_SHELL_FOOTER}
    `,
  };
}

/**
 * 2. Order Confirmed Template
 */
export function orderConfirmedTemplate({ order, customerName = 'Patron' }) {
  const safeName = escapeHtml(customerName);
  const orderNumber = escapeHtml(order?.orderNumber || 'NK-ORD');
  const items = order?.items || [];
  const pricing = order?.pricing || {};
  const subtotal = Number(pricing.subtotal || 0);
  const deliveryFee = Number(pricing.deliveryFee || 0);
  const couponDiscount = Number(pricing.couponDiscount || 0);
  const total = Number(pricing.total || Math.max(0, subtotal + deliveryFee - couponDiscount));
  const paymentMethod = order?.paymentMethod === 'MANUAL' ? 'Raast / Bank Transfer' : 'Cash-on-Delivery (COD)';
  const statusLabel = getOrderStatusLabel(order?.status || 'placed');
  const orderMessage =
    order?.status === 'awaiting_confirmation'
      ? 'We have received your Cash on Delivery order. Our team will confirm it before workshop preparation begins.'
      : order?.status === 'awaiting_payment'
      ? 'We have received your order. Complete the bank transfer and submit your payment proof so our team can verify it.'
      : 'Our team has received your order. You can follow its progress from your account.';
  const address = order?.shippingAddress || {};

  const itemsHtml = items
    .map((item) => {
      const itemName = item.name || item.title || 'Artisan Garment';
      const unitPrice = Number(item.unitPrice ?? item.price ?? 0);
      const qty = Number(item.quantity || 1);
      const lineTotal = Number(item.lineTotal ?? unitPrice * qty);

      return `
      <tr>
        <td style="padding: 12px 8px; border-bottom: 1px solid #E6E1DA;">
          <p style="font-weight: 600; font-size: 13px; margin: 0; color: #151515;">${escapeHtml(itemName)}</p>
          <p style="font-size: 11px; color: #6B6B6B; margin: 2px 0 0 0;">Size: ${escapeHtml(item.size || 'Standard')} &bull; Qty: ${qty}</p>
        </td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #E6E1DA; text-align: right; font-family: monospace; font-size: 13px; font-weight: 600; color: #151515;">
          ₨ ${Math.round(lineTotal).toLocaleString()}
        </td>
      </tr>
    `;
    })
    .join('');

  return {
    subject: `Order Received #${orderNumber} — ${statusLabel} — Nakaam Atelier`,
    html: `
      ${EMAIL_SHELL_HEADER}
      <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 16px;">
        <span class="badge" style="background-color: #FCEEEE; color: #8F1A1E;">${escapeHtml(statusLabel)}</span>
        <span style="font-family: monospace; font-weight: 700; font-size: 13px; color: #6B6B6B;">#${orderNumber}</span>
      </div>

      <h2 style="font-family: Georgia, serif; font-size: 20px; font-weight: 700; margin: 0 0 12px 0; color: #151515;">Thank you for your order, ${safeName}</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #3A3A3A; margin: 0 0 24px 0;">
        ${escapeHtml(orderMessage)} Below is your official atelier invoice.
      </p>

      <!-- Items Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <thead>
          <tr style="background-color: #F6F2EC; text-align: left; font-size: 11px; text-transform: uppercase; color: #6B6B6B;">
            <th style="padding: 8px; font-weight: 700;">Garment Details</th>
            <th style="padding: 8px; text-align: right; font-weight: 700;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <!-- Price Breakdown -->
      <div style="background-color: #F6F2EC; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; color: #6B6B6B;">
          <span>Subtotal:</span>
          <span style="font-family: monospace;">₨ ${Math.round(subtotal).toLocaleString()}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; color: #6B6B6B;">
          <span>Courier Shipping:</span>
          <span style="font-family: monospace;">${deliveryFee === 0 ? 'COMPLIMENTARY' : `₨ ${Math.round(deliveryFee).toLocaleString()}`}</span>
        </div>
        ${
          couponDiscount > 0
            ? `
        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; color: #8F1A1E;">
          <span>Promotional Voucher:</span>
          <span style="font-family: monospace;">-₨ ${Math.round(couponDiscount).toLocaleString()}</span>
        </div>
        `
            : ''
        }
        <hr style="border: none; border-top: 1px solid #E6E1DA; margin: 8px 0;" />
        <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 700; color: #151515;">
          <span>Grand Total (PKR):</span>
          <span style="font-family: monospace; color: #D12C2F;">₨ ${Math.round(total).toLocaleString()}</span>
        </div>
      </div>

      <!-- Shipping & Payment Details -->
      <div style="border: 1px solid #E6E1DA; border-radius: 12px; padding: 16px; font-size: 12px; color: #3A3A3A; line-height: 1.6; margin-bottom: 28px;">
        <p style="margin: 0 0 6px 0;"><strong>Settlement Method:</strong> ${paymentMethod}</p>
        <p style="margin: 0 0 6px 0;"><strong>Delivery Recipient:</strong> ${escapeHtml(address.fullName)} &bull; ${escapeHtml(address.phone)}</p>
        <p style="margin: 0;"><strong>Shipping Destination:</strong> ${escapeHtml(address.street)}, ${escapeHtml(address.city)}</p>
      </div>

      <div style="text-align: center;">
        <a href="${env.BETTER_AUTH_URL || 'https://nakaam.pk'}/account/orders" class="btn-primary">View Order in Account</a>
      </div>
      ${EMAIL_SHELL_FOOTER}
    `,
  };
}

/**
 * 3. Raast Bank Transfer Verified Template
 */
export function raastVerifiedTemplate({ order, customerName = 'Patron' }) {
  const safeName = escapeHtml(customerName);
  const orderNumber = escapeHtml(order?.orderNumber || 'NK-ORD');
  const amount = Math.round(order?.pricing?.total || 0).toLocaleString();

  return {
    subject: `Payment Verified for Order #${orderNumber} — Nakaam Atelier`,
    html: `
      ${EMAIL_SHELL_HEADER}
      <div style="text-align: center; margin-bottom: 24px;">
        <span class="badge" style="background-color: #E8F5E9; color: #2E7D32;">Raast Payment Cleared</span>
        <h2 style="font-family: Georgia, serif; font-size: 20px; font-weight: 700; margin: 12px 0 8px 0; color: #151515;">Payment Confirmed</h2>
        <p style="font-size: 14px; color: #3A3A3A; line-height: 1.6; margin: 0;">
          Dear ${safeName}, your Raast digital transfer of <strong>₨ ${amount}</strong> for order <strong>#${orderNumber}</strong> has been audited and verified by our accounts desk.
        </p>
      </div>

      <div style="background-color: #F6F2EC; border-radius: 12px; padding: 20px; margin-bottom: 24px; font-size: 13px; line-height: 1.6; color: #151515;">
        <p style="margin: 0 0 8px 0;"><strong>Current Status:</strong> Moved to Darzi Workshop &amp; Cutting Slips</p>
        <p style="margin: 0 0 8px 0;"><strong>Next Milestone:</strong> Garment inspection &bull; Tracking code issuance</p>
        <p style="margin: 0; color: #6B6B6B; font-size: 12px;">Your package will be booked with our courier partner within 24 hours.</p>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${env.BETTER_AUTH_URL || 'https://nakaam.pk'}/account/orders" class="btn-primary">Track Order Status</a>
      </div>
      ${EMAIL_SHELL_FOOTER}
    `,
  };
}

/**
 * 4. Order Dispatched Template
 */
export function orderDispatchedTemplate({
  order,
  customerName = 'Patron',
  courier = 'Trax Logistics',
  trackingNumber = 'TRX-12345678',
  trackingUrl = '',
}) {
  const safeName = escapeHtml(customerName);
  const orderNumber = escapeHtml(order?.orderNumber || 'NK-ORD');
  const safeCourier = escapeHtml(courier);
  const safeTracking = escapeHtml(trackingNumber);
  const totalDue = Math.round(order?.pricing?.total || 0).toLocaleString();
  const isCod = order?.paymentMethod === 'COD';

  return {
    subject: `Garments Dispatched #${orderNumber} — Nakaam Atelier`,
    html: `
      ${EMAIL_SHELL_HEADER}
      <span class="badge" style="background-color: #E3F2FD; color: #1565C0;">En Route</span>
      <h2 style="font-family: Georgia, serif; font-size: 20px; font-weight: 700; margin: 12px 0 12px 0; color: #151515;">Your Package is on the Road</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #3A3A3A; margin: 0 0 24px 0;">
        Dear ${safeName}, order <strong>#${orderNumber}</strong> has completed master finishing and has departed our Lahore atelier via <strong>${safeCourier}</strong>.
      </p>

      <div style="background-color: #F6F2EC; border: 1px solid #E6E1DA; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
        <div style="font-size: 12px; color: #6B6B6B; margin-bottom: 4px;">Tracking Number</div>
        <div style="font-family: monospace; font-size: 16px; font-weight: 700; color: #151515; letter-spacing: 1px;">
          ${safeTracking}
        </div>
        <div style="margin-top: 12px; font-size: 12px; color: #6B6B6B;">Courier Partner: <strong>${safeCourier}</strong></div>
      </div>

      ${
        isCod
          ? `
      <div style="background-color: #FCEEEE; border-radius: 12px; padding: 14px; margin-bottom: 24px; font-size: 12px; color: #8F1A1E; line-height: 1.5;">
        <strong>Cash-on-Delivery Reminder:</strong> Please keep exact change of <strong>₨ ${totalDue}</strong> ready for the courier rider upon delivery.
      </div>
      `
          : ''
      }

      <div style="text-align: center; margin: 32px 0;">
        ${
          trackingUrl
            ? `<a href="${escapeHtml(trackingUrl)}" class="btn-crimson">Track Live Shipment</a>`
            : `<a href="${env.BETTER_AUTH_URL || 'https://nakaam.pk'}/account/orders" class="btn-primary">View in Patron Hub</a>`
        }
      </div>
      ${EMAIL_SHELL_FOOTER}
    `,
  };
}

/**
 * 5. Ticket Concierge Reply Template
 */
export function ticketRepliedTemplate({
  ticket,
  customerName = 'Patron',
  replySnippet = '',
  portalUrl = '',
}) {
  const safeName = escapeHtml(customerName);
  const ticketNo = escapeHtml(ticket?.ticketNo || 'TK-000');
  const safeSubject = escapeHtml(ticket?.subject || 'Consultation');
  const safeSnippet = escapeHtml(replySnippet);
  const targetUrl = portalUrl || `${env.BETTER_AUTH_URL || 'https://nakaam.pk'}/account/complaints`;

  return {
    subject: `Response to Consultation #${ticketNo}: ${safeSubject}`,
    html: `
      ${EMAIL_SHELL_HEADER}
      <span class="badge" style="background-color: #F6F2EC; color: #151515;">Atelier Concierge Desk</span>
      <h2 style="font-family: Georgia, serif; font-size: 20px; font-weight: 700; margin: 12px 0 12px 0; color: #151515;">Inquiry Update #${ticketNo}</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #3A3A3A; margin: 0 0 20px 0;">
        Dear ${safeName}, our atelier concierge team has reviewed your query regarding <em>&ldquo;${safeSubject}&rdquo;</em> and posted an update.
      </p>

      <div style="background-color: #F6F2EC; border-left: 3px solid #D12C2F; border-radius: 4px; padding: 16px 20px; margin-bottom: 24px; font-size: 13px; line-height: 1.6; color: #151515; font-style: italic;">
        &ldquo;${safeSnippet}&rdquo;
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${escapeHtml(targetUrl)}" class="btn-primary">View &amp; Reply in Consultation Hub</a>
      </div>
      ${EMAIL_SHELL_FOOTER}
    `,
  };
}

/**
 * 6. Password Reset Template
 */
export function resetPasswordTemplate({ name = 'Customer', url, expiresInMinutes = 60 }) {
  const safeName = escapeHtml(name);
  const safeUrl = escapeHtml(url);

  return {
    subject: 'Reset your Nakaam password',
    html: `
      ${EMAIL_SHELL_HEADER}
      <h2 style="font-family: Georgia, serif; font-size: 20px; font-weight: 700; margin: 0 0 16px 0; color: #151515;">Password Reset Request</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #3A3A3A; margin: 0 0 20px 0;">
        Hello ${safeName}, we received a request to reset your password. Click the button below to choose a new password. This link is valid for ${expiresInMinutes} minutes.
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${safeUrl}" class="btn-crimson">Reset Password</a>
      </div>
      
      <div style="background-color: #F6F2EC; border-radius: 12px; padding: 14px; margin-top: 24px; font-size: 12px; color: #6B6B6B; line-height: 1.5;">
        If you did not request a password reset, no further action is required. Your account remains secure.
      </div>
      ${EMAIL_SHELL_FOOTER}
    `,
  };
}

/**
 * 7. Password Changed Confirmation Template
 */
export function passwordChangedTemplate({ name = 'Customer' }) {
  const safeName = escapeHtml(name);

  return {
    subject: 'Security Alert: Your Nakaam account password was changed',
    html: `
      ${EMAIL_SHELL_HEADER}
      <h2 style="font-family: Georgia, serif; font-size: 20px; font-weight: 700; margin: 0 0 16px 0; color: #151515;">Password Updated</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #3A3A3A; margin: 0 0 16px 0;">
        Hello ${safeName}, your account password was successfully changed just now.
      </p>
      <div style="background-color: #F6F2EC; border-left: 3px solid #151515; border-radius: 4px; padding: 16px 20px; margin: 24px 0; font-size: 13px; line-height: 1.6; color: #151515;">
        <strong>Didn't make this change?</strong> If you did not update your password, please contact our concierge helpline immediately at <strong>+92 42 111 625 226</strong> or reset your credentials right away.
      </div>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${escapeHtml(env.FRONTEND_URL)}/login" class="btn-primary">Sign In to Your Account</a>
      </div>
      ${EMAIL_SHELL_FOOTER}
    `,
  };
}

/**
 * 8. Order Cancelled & Refund Notification Template
 */
export function orderCancelledTemplate({ order, customerName = 'Patron', reason = '' }) {
  const safeName = escapeHtml(customerName);
  const orderNumber = escapeHtml(order?.orderNumber || 'NK-ORD');
  const safeReason = escapeHtml(reason || 'Cancelled upon customer or system verification');

  return {
    subject: `Order #${orderNumber} Cancellation Notice — Nakaam`,
    html: `
      ${EMAIL_SHELL_HEADER}
      <div style="display: inline-block; background-color: #FCEEEE; color: #8F1A1E; padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px;">
        Order Cancelled
      </div>
      <h2 style="font-family: Georgia, serif; font-size: 20px; font-weight: 700; margin: 0 0 16px 0; color: #151515;">Order #${orderNumber} Has Been Cancelled</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #3A3A3A; margin: 0 0 16px 0;">
        Dear ${safeName}, your order #${orderNumber} has been cancelled.
      </p>
      <div style="background-color: #F6F2EC; border: 1px solid #E6E1DA; border-radius: 12px; padding: 16px; margin: 20px 0;">
        <p style="font-size: 13px; color: #151515; margin: 0 0 8px 0;"><strong>Reason:</strong> ${safeReason}</p>
        <p style="font-size: 12px; color: #6B6B6B; margin: 0;">If you made an advance Raast/Bank payment, our reconciliation team will initiate your refund verification within 1-2 business days.</p>
      </div>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${escapeHtml(env.FRONTEND_URL)}/shop" class="btn-primary">Return to Shop</a>
      </div>
      ${EMAIL_SHELL_FOOTER}
    `,
  };
}

/**
 * 9. Order Delivered & Doorstep Inspection Complete Template
 */
export function orderDeliveredTemplate({ order, customerName = 'Patron' }) {
  const safeName = escapeHtml(customerName);
  const orderNumber = escapeHtml(order?.orderNumber || 'NK-ORD');

  return {
    subject: `Delivered: Your Nakaam parcel #${orderNumber} has arrived!`,
    html: `
      ${EMAIL_SHELL_HEADER}
      <div style="display: inline-block; background-color: #EBF8F2; color: #15803D; padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px;">
        Package Delivered
      </div>
      <h2 style="font-family: Georgia, serif; font-size: 20px; font-weight: 700; margin: 0 0 16px 0; color: #151515;">Your Atelier Order Has Arrived</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #3A3A3A; margin: 0 0 16px 0;">
        Dear ${safeName}, courier records confirm that package #${orderNumber} was delivered to your address.
      </p>
      <div style="background-color: #F6F2EC; border: 1px solid #E6E1DA; border-radius: 12px; padding: 16px; margin: 20px 0;">
        <p style="font-size: 12px; color: #6B6B6B; margin: 0; line-height: 1.6;">
          <strong>7-Day No-Hassle Exchange:</strong> We hope your piece fits like second skin. If you need a size exchange or tailoring alteration, initiate an exchange directly in your account dashboard within 7 days.
        </p>
      </div>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${escapeHtml(env.FRONTEND_URL)}/account/orders" class="btn-crimson">View Order Details</a>
      </div>
      ${EMAIL_SHELL_FOOTER}
    `,
  };
}

export function orderStatusUpdateTemplate({ order, customerName = 'Customer', note = '' }) {
  const safeName = escapeHtml(customerName);
  const orderNumber = escapeHtml(order?.orderNumber || 'NK-ORD');
  const statusLabel = getOrderStatusLabel(order?.status);
  const safeNote = escapeHtml(note);
  const paymentStatusLabels = {
    unpaid: 'Unpaid',
    awaiting_proof: 'Awaiting Payment Proof',
    proof_submitted: 'Proof Submitted',
    verified: 'Verified',
    rejected: 'Payment Proof Rejected',
    cod_pending: 'Due on Delivery',
    cod_collected: 'Collected',
    refunded: 'Refunded',
  };
  const paymentStatus = paymentStatusLabels[order?.payment?.status] || 'Payment Status Unavailable';
  const trackingNumber = escapeHtml(order?.delivery?.trackingNumber || '');
  const courier = escapeHtml(order?.delivery?.courier || '');

  return {
    subject: `Order #${orderNumber}: ${statusLabel} — Nakaam Atelier`,
    html: `
      ${EMAIL_SHELL_HEADER}
      <span class="badge" style="background-color: #FCEEEE; color: #8F1A1E;">${escapeHtml(statusLabel)}</span>
      <h2 style="font-family: Georgia, serif; font-size: 20px; font-weight: 700; margin: 12px 0 12px 0; color: #151515;">Your order status has been updated</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #3A3A3A; margin: 0 0 20px 0;">
        Dear ${safeName}, order <strong>#${orderNumber}</strong> is now <strong>${escapeHtml(statusLabel)}</strong>.
      </p>
      <div style="background-color: #F6F2EC; border: 1px solid #E6E1DA; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 13px; line-height: 1.7; color: #151515;">
        <p style="margin: 0 0 6px 0;"><strong>Payment:</strong> ${escapeHtml(paymentStatus)}</p>
        ${courier ? `<p style="margin: 0 0 6px 0;"><strong>Courier:</strong> ${courier}</p>` : ''}
        ${trackingNumber ? `<p style="margin: 0 0 6px 0;"><strong>Tracking number:</strong> ${trackingNumber}</p>` : ''}
        ${safeNote ? `<p style="margin: 8px 0 0 0;"><strong>Update:</strong> ${safeNote}</p>` : ''}
      </div>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${escapeHtml(env.FRONTEND_URL || 'https://nakaam.pk')}/user/orders/${encodeURIComponent(order?.orderNumber || '')}" class="btn-primary">View Order Details</a>
      </div>
      ${EMAIL_SHELL_FOOTER}
    `,
  };
}
