import express from 'express';
import {
  createForm,
  getForms,
  getFormById,
  updateForm,
  deleteForm,
  exportFormToPDF,
  getJobSites,
} from '../controllers/formController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Apply optional authentication to all routes (adds req.userId if token is valid)
router.use(optionalAuth);

// Metadata routes
router.get('/meta/job-sites', getJobSites);

// Form routes
router.post('/:formType', createForm);
router.get('/:formType', getForms);
router.get('/:formType/:id', getFormById);
router.put('/:formType/:id', updateForm);
router.delete('/:formType/:id', deleteForm);
router.get('/:formType/:id/export', exportFormToPDF);

export default router;
