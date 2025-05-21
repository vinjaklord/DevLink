import { Router } from 'express';
import { body, param, header } from 'express-validator';
import mongoose, { set } from 'mongoose';

import {
  signup,
  login,
  getAllMembers,
  getOneMember,
  changePassword,
  deleteMember,
  updateMember,
  getDistances,
  addFavorite,
  removeFavorite,
  resetPassword,
  setNewPassword,
} from '../controllers/members.js';

import { addHeart, updateHeart, deleteHeart, getAllHearts } from '../controllers/hearts.js';
import { addVisit, deleteVisit, getAllVisits } from '../controllers/visits.js';
import { uploadAsStream } from '../controllers/files.js';
import {
  addMessage,
  updateMessage,
  deleteMessage,
  getAllMessages,
  getOneMessage,
  getThreads,
  getThreadMessages,
} from '../controllers/messages.js';

import { upload, checkToken } from '../common/middlewares.js';

const router = new Router();

// TODO: check token einbauen
router.get('/members', checkToken, getAllMembers);
router.get('/members/:id', checkToken, getOneMember);
router.get('/members/distances/:id', checkToken, getDistances);

router.post('/favorites/:favoriteId', checkToken, addFavorite);
router.delete('/favorites/:favoriteId', checkToken, removeFavorite);

router.post(
  '/members/signup',
  upload.single('photo'),
  body('password').escape().isLength({ min: 6, max: 50 }),
  body('statement').escape().optional(),
  body('email').escape().isEmail().toLowerCase().normalizeEmail(),
  body('nickname').trim().escape().isLength({ min: 4, max: 50 }),
  body('firstName').trim().escape().isLength({ min: 2, max: 50 }),
  body('lastName').trim().escape().isLength({ min: 2, max: 50 }),
  body('street').trim().escape().isLength({ min: 4, max: 50 }),
  body('zip').trim().escape().isLength({ min: 4, max: 10 }),
  body('city').trim().escape().isLength({ min: 2, max: 50 }),
  body('birthDay').escape().isInt({ min: 1, max: 31 }),
  body('birthMonth').escape().isInt({ min: 1, max: 12 }),
  body('birthYear').escape().isInt({ min: 1900, max: new Date().getFullYear() }),
  signup
);

router.patch(
  '/members/change-password',
  checkToken,
  body('oldPassword').escape().isLength({ min: 6, max: 50 }),
  body('newPassword').escape().isLength({ min: 6, max: 50 }),
  changePassword
);

router.patch(
  '/members/:id',
  checkToken,
  upload.single('photo'),
  body('statement').escape().optional(),
  body('firstName').trim().escape().isLength({ min: 2, max: 50 }).optional(),
  body('lastName').trim().escape().isLength({ min: 2, max: 50 }).optional(),
  body('street').trim().escape().isLength({ min: 4, max: 50 }).optional(),
  body('zip').trim().escape().isLength({ min: 4, max: 10 }).optional(),
  body('city').trim().escape().isLength({ min: 2, max: 50 }).optional(),
  body('birthDay').escape().isInt({ min: 1, max: 31 }).optional(),
  body('birthMonth').escape().isInt({ min: 1, max: 12 }).optional(),
  body('birthYear').escape().isInt({ min: 1900, max: new Date().getFullYear() }).optional(),
  body('paused').escape().isBoolean().optional(),
  updateMember
);

router.post(
  '/members/login',
  body('password').escape().optional(),
  body('login').escape().optional(),
  login
);

router.delete('/members/:id', checkToken, deleteMember);

router.post('/members/reset-password', resetPassword);

router.post(
  '/members/set-new-password',
  body('password').escape().isLength({ min: 6, max: 50 }),
  header('reset-token').escape().isLength({ min: 36, max: 36 }),
  setNewPassword
);

router.post(
  '/hearts',
  checkToken,
  body('sender').escape().isLength({ min: 20, max: 30 }),
  body('recipient').escape().isLength({ min: 20, max: 30 }),
  body('text').escape().optional(),
  body('confirmed').escape().isBoolean().optional(),
  addHeart
);

router.patch(
  '/hearts/:id',
  checkToken,
  body('text').escape().optional(),
  body('confirmed').escape().isBoolean().optional(),
  updateHeart
);

router.delete('/hearts/:id', checkToken, deleteHeart);

router.get('/hearts/:recipient', checkToken, getAllHearts);

router.post('/visits', checkToken, addVisit);
router.delete('/visits/:id', checkToken, deleteVisit);
router.get('/visits/:targetMember', checkToken, getAllVisits);

router.post('/stream', uploadAsStream);

router.post(
  '/messages',
  checkToken,
  body('sender').escape().isLength({ min: 20, max: 30 }),
  body('recipient').escape().isLength({ min: 20, max: 30 }),
  body('text').escape().isLength({ min: 1, max: 5000 }),
  body('read').escape().isBoolean().optional(),
  addMessage
);

router.patch(
  '/messages/:id',
  checkToken,
  body('text').escape().isLength({ min: 1, max: 5000 }).optional(),
  body('read').escape().isBoolean().optional(),
  updateMessage
);

router.delete('/messages/:id', checkToken, deleteMessage);

router.get(
  '/threads/inbox/:id',
  checkToken,
  param('id').custom((value) => mongoose.Types.ObjectId.isValid(value)),
  getThreads
);

router.get(
  '/threads/outbox/:id',
  checkToken,
  param('id').custom((value) => mongoose.Types.ObjectId.isValid(value)),
  getThreads
);

// router.get('/threads/outbox/:id', checkToken, getThreads);
router.get('/messages/:id', checkToken, getOneMessage);
router.get('/messages', checkToken, getAllMessages);
router.get('/threads/messages', checkToken, getThreadMessages);

export default router;
