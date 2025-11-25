import { Router } from 'express';
import {
  getNotifications,
  getUnreadCount,
  getUnreadNotifications,
  markRead,
} from '../controllers/notifications.js';
import { checkToken } from '../common/middlewares.js';

const router = Router();

// All notification routes require authentication
router.get('/', checkToken, getNotifications);
router.get('/unread', checkToken, getUnreadNotifications);
router.get('/unread/count', checkToken, getUnreadCount);
router.patch('/read/:id', checkToken, markRead);

export default router;