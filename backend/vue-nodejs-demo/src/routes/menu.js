import express from 'express';
import * as menuController from '../controllers/menuController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/list', menuController.getMenuList);
router.get('/routes', menuController.getRoutePermissions);

export default router;
