import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import {
  verifyEmailTemplate,
  orderConfirmedTemplate,
  raastVerifiedTemplate,
  orderDispatchedTemplate,
  ticketRepliedTemplate,
  resetPasswordTemplate,
  passwordChangedTemplate,
  orderCancelledTemplate,
  orderDeliveredTemplate,
  orderStatusUpdateTemplate,
} from './templates/index.js';

let transporter = null;

if (env.SMTP_USER && env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

/**
 * Sends an email or logs it if in dev/test without active credentials
 * @param {Object} options { to, subject, html, text }
 */
export async function sendEmail({ to, subject, html, text }) {
  if (!to) {
    logger.warn('[EMAIL SERVICE] Skipped sending email: recipient "to" is missing');
    return { skipped: true };
  }

  if (!transporter) {
    logger.info(`[DEV EMAIL MOCK] To: ${to} | Subject: ${subject}`);
    logger.debug(`[DEV EMAIL HTML Preview]:\n${html}`);
    return { mock: true, messageId: `mock-${Date.now()}` };
  }

  try {
    const info = await transporter.sendMail({
      from: env.MAIL_FROM || 'Nakaam Atelier <care@nakaam.com>',
      to,
      subject,
      html,
      text: text || subject,
    });
    logger.info(`Email delivered to ${to} (${info.messageId})`);
    return info;
  } catch (err) {
    logger.error(`Failed to send email to ${to}: ${err.message}`);
    // Do not throw fatal error in business flows
    return { error: err.message };
  }
}

/** Convenience dispatchers for transactional workflows **/

export async function sendVerifyEmail({ to, name, url }) {
  return sendEmail({ to, ...verifyEmailTemplate({ name, url }) });
}

export async function sendOrderConfirmedEmail({ to, order, customerName }) {
  return sendEmail({ to, ...orderConfirmedTemplate({ order, customerName }) });
}

export async function sendRaastVerifiedEmail({ to, order, customerName }) {
  return sendEmail({ to, ...raastVerifiedTemplate({ order, customerName }) });
}

export async function sendOrderDispatchedEmail({ to, order, customerName, courier, trackingNumber, trackingUrl }) {
  return sendEmail({
    to,
    ...orderDispatchedTemplate({ order, customerName, courier, trackingNumber, trackingUrl }),
  });
}

export async function sendTicketRepliedEmail({ to, ticket, customerName, replySnippet, portalUrl }) {
  return sendEmail({
    to,
    ...ticketRepliedTemplate({ ticket, customerName, replySnippet, portalUrl }),
  });
}

export async function sendPasswordResetEmail({ to, name, url }) {
  return sendEmail({ to, ...resetPasswordTemplate({ name, url }) });
}

export async function sendPasswordChangedEmail({ to, name }) {
  return sendEmail({ to, ...passwordChangedTemplate({ name }) });
}

export async function sendOrderCancelledEmail({ to, order, customerName, reason }) {
  return sendEmail({ to, ...orderCancelledTemplate({ order, customerName, reason }) });
}

export async function sendOrderDeliveredEmail({ to, order, customerName }) {
  return sendEmail({ to, ...orderDeliveredTemplate({ order, customerName }) });
}

export async function sendOrderStatusUpdateEmail({ to, order, customerName, note }) {
  return sendEmail({ to, ...orderStatusUpdateTemplate({ order, customerName, note }) });
}
