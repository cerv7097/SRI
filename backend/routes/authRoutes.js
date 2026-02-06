import express from 'express';
import {
  register,
  login,
  logout,
  getCurrentUser,
  setupTwoFactor,
  verifyTwoFactorSetup,
  verifyTwoFactorLogin,
  disableTwoFactor
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// 2FA login verification (uses temp token, not full auth)
router.post('/2fa/verify-login', verifyTwoFactorLogin);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser);

// 2FA management routes (protected)
router.post('/2fa/setup', authenticateToken, setupTwoFactor);
router.post('/2fa/verify-setup', authenticateToken, verifyTwoFactorSetup);
router.post('/2fa/disable', authenticateToken, disableTwoFactor);

export default router;
