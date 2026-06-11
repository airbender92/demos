import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.post('/sso-login', authController.ssoLogin);
router.post('/login', authController.login);

// Authenticated routes
router.post('/refresh', authenticate, authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.get('/current-user', authenticate, authController.getCurrentUser);

export default router;
