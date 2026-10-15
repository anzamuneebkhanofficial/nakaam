import { respond } from '../../core/respond.js';
import * as reconciliationService from './reconciliation.service.js';

export async function getLedger(req, res) {
  const ledger = await reconciliationService.getReconciliationLedger();
  return respond(res, ledger);
}
