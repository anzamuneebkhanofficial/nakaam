import { respond } from '../../core/respond.js';
import * as paymentService from './payment.service.js';

export async function getAccounts(req, res) {
  const accounts = await paymentService.getActivePaymentAccounts();
  return respond(res, accounts);
}
