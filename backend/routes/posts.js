import { Router } from 'express';
import { body } from 'express-validator';
import {
  addComment,
  createPost,
  getAllPosts,
  getPostById,
  toggleLike,
  getMyPosts,
  getMemberPosts,
  sharePost,
  deletePost,
} from '../controllers/posts.js';
import { upload, checkToken } from '../common/middlewares.js';

const router = Router();

// Public routes
router.get('/', getAllPosts);
router.get('/myPosts', checkToken, getMyPosts);
router.get('/:id', getPostById);
router.get('/memberPosts/:username', getMemberPosts);

// Protected routes
router.post(
  '/post',
  checkToken,
  upload.single('photo'),
  body('caption').trim().escape().isLength({ min: 1, max: 300 }),
  createPost
);

router.post(
  '/:id/comments',
  checkToken,
  upload.none(),
  body('text').trim().escape().isLength({ min: 1, max: 500 }),
  addComment
);

router.post('/share', checkToken, sharePost);
router.put('/:id/likes', checkToken, toggleLike);
router.delete('/delete/:id', checkToken, deletePost);

export default router;
