import { respond } from '../../core/respond.js';
import * as searchService from './search.service.js';

export async function suggest(req, res) {
  const { q } = req.query;
  const suggestions = await searchService.getSuggestions(q);
  return respond(res, suggestions);
}
