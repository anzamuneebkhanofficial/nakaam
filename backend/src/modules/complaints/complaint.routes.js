import { Router } from 'express';
import { requireAuth } from '../../middlewares/requireAuth.js';
import * as complaintController from './complaint.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', complaintController.listComplaints);
router.post('/', complaintController.createComplaint);
router.get('/:id', complaintController.getComplaint);

export const complaintRoutes = router;
