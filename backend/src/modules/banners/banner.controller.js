import { respond } from '../../core/respond.js';
import * as bannerService from './banner.service.js';

export async function getBanners(req, res) {
  const { placement } = req.query;
  const banners = await bannerService.getActiveBanners(placement);
  return respond(res, banners);
}
