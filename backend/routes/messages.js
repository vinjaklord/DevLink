import { Router } from 'express';
import { body } from 'express-validator';
import { getMessages, sendMessage } from '../controllers/messages.js';
import { upload, checkToken } from '../common/middlewares.js';

const router = Router();

// All message routes require authentication
router.get('/:userId', checkToken, getMessages);

router.post(
  '/send/:id',
  checkToken,
  upload.single('image'),
  body('text').trim().escape().isLength({ min: 1, max: 10000 }),
  sendMessage
);

export default router;
