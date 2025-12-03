import express from 'express';
import { uploadSignature } from '../controllers/signatureController.js';

const router = express.Router();

// Signature routes
router.post('/upload', uploadSignature);

export default router;
