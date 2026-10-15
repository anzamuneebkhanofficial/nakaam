import { respond } from '../../core/respond.js';
import * as dashboardService from './dashboard.service.js';

export async function getMetrics(req, res) {
  const metrics = await dashboardService.getDashboardMetrics();
  return respond(res, metrics);
}
