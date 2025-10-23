import { Router } from 'express';
import { body, check, query } from 'express-validator';

import {
  signup,
  login,
  getAllMembers,
  getOneMember,
  changePassword,
  deleteMember,
  updateMember,
  resetPassword,
  setNewPassword,
  getMemberByUsername,
  filterMember,
} from '../controllers/members.js';

import {
  addFriend,
  deleteFriend,
  getAllFriends,
  getPendingFriendRequests,
  getRelationshipStatus,
  manageFriendRequest,
} from '../controllers/friends.js';

import { upload, checkToken } from '../common/middlewares.js';

import {
  addComment,
  createPost,
  getAllPosts,
  getPostById,
  toggleLike,
  getMyPosts,
  getMemberPosts,
  getFriendsPosts,
} from '../controllers/posts.js';

import { getMessages, getUsersForSidebar, sendMessage } from '../controllers/messages.js';

import {
  getNotifications,
  getUnreadCount,
  getUnreadNotifications,
  markAsRead,
} from '../controllers/notifications.js';

const router = new Router();

router.get('/members', getAllMembers);
router.get('/members/search', checkToken, filterMember);
router.get('/members/:id', getOneMember);
router.get('/members/username/:username', getMemberByUsername);

router.get('/notifications', checkToken, getNotifications);
router.get('/notifications/unread', checkToken, getUnreadNotifications);
router.get('/notifications/unread/count', checkToken, getUnreadCount);
router.patch('/notifications/:id/read', checkToken, markAsRead);

router.post(
  '/members/signup',
  body('firstName').trim().escape().isLength({ min: 2, max: 50 }),
  body('lastName').trim().escape().isLength({ min: 2, max: 50 }),
  body('username').trim().escape().isLength({ min: 4, max: 50 }),
  body('email').escape().isEmail().toLowerCase().normalizeEmail(),
  body('password').escape().isLength({ min: 6, max: 50 }),
  body('confirmPassword').escape().isLength({ min: 6, max: 50 }),
  signup
);

router.patch(
  '/members/change-password',
  checkToken,
  body('oldPassword').escape().isLength({ min: 6, max: 50 }),
  body('newPassword').escape().isLength({ min: 6, max: 50 }),
  body('confirmPassword').escape().isLength({ min: 6, max: 50 }),
  changePassword
);

router.patch(
  '/members/:id',
  checkToken,
  upload.single('photo'),
  body('firstName').trim().escape().isLength({ min: 2, max: 50 }).optional(),
  body('lastName').trim().escape().isLength({ min: 2, max: 50 }).optional(),
  //  TODO: add email and other
  updateMember
);

router.post(
  '/members/login',
  body('username').escape().notEmpty().withMessage('Username or email is required'),
  body('password').escape().notEmpty().withMessage('Password is required'),
  login
);

router.delete('/members/:id', checkToken, deleteMember);

router.post('/members/reset-password', resetPassword);

router.post(
  '/members/set-new-password',
  body('password').escape().isLength({ min: 6, max: 50 }),
  setNewPassword
);

router.post(
  '/friends/add-friend/:id',
  checkToken,
  addFriend
);

router.get(
  '/friends/pending',
  checkToken,
  body('recipient').escape().isLength({ min: 20, max: 30 }),
  getPendingFriendRequests
);
router.get('/friends/friendsPosts', checkToken, getFriendsPosts); // changed from /posts/friendsPosts because casterror, stupid

router.get('/friends/all-friends', checkToken, getAllFriends);

router.delete('/friends/deleteFriend/:friendId', checkToken, deleteFriend);

router.get('/friends/status/:userId', checkToken, getRelationshipStatus);

router.put(
  '/friends/:senderId',
  checkToken,
  [check('senderId').isMongoId(), check('action').isIn(['accept', 'decline'])],
  manageFriendRequest
);

router.post(
  '/posts/post',
  checkToken,
  upload.single('photo'),
  body('caption').trim().escape().isLength({ min: 1, max: 300 }),
  createPost
);

router.post(
  '/posts/:id/comments', // 2. POST route with a specific dynamic structure
  checkToken,
  upload.none(),
  body('text').trim().escape().isLength({ min: 1, max: 500 }),
  addComment
);
router.get('/posts/myPosts', checkToken, getMyPosts);
router.get('/posts/memberPosts/:username', getMemberPosts);
router.put('/posts/:id/likes', checkToken, toggleLike);
router.get('/posts/:id', getPostById);
router.get('/posts', getAllPosts);

router.get('/messages/users', checkToken, getUsersForSidebar);
router.get('/messages/:userId', checkToken, getMessages);
router.post(
  '/messages/send/:id',
  checkToken,
  upload.single('image'),
  body('text').trim().escape().isLength({ min: 1, max: 10000 }),
  sendMessage
);

export default router;
