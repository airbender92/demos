import express from 'express';
import * as chatController from '../controllers/chatController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// SSE streaming chat (must be defined before :id routes)
router.post('/stream', chatController.chatStream);
router.post('/session', chatController.saveSession);
router.get('/sessions/search', chatController.searchSessions);
router.get('/sessions', chatController.getSessions);
router.get('/session/:id', chatController.getSessionDetail);
router.delete('/session/:id', chatController.deleteSession);
router.delete('/message/:messageId', chatController.deleteMessage);
router.get('/context-config', chatController.getContextConfig);
router.put('/context-config', chatController.updateContextConfig);

export default router;
