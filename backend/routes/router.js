import { Router } from 'express';
import memberRoutes from './members.js';
import friendRoutes from './friends.js';
import postRoutes from './posts.js';
import messageRoutes from './messages.js';
import notificationRoutes from './notifications.js';
import locationRoutes from './location.js';

const router = Router();

router.use('/members', memberRoutes);
router.use('/friends', friendRoutes);
router.use('/posts', postRoutes);
router.use('/messages', messageRoutes);
router.use('/notifications', notificationRoutes);
router.use('/location', locationRoutes);

export default router;