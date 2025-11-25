import { Router } from 'express';
import { getRecommendations, updateLocation } from '../controllers/recommendations.js';
import { checkToken } from '../common/middlewares.js';

const router = Router();

// All location routes require authentication
router.get('/recommended', checkToken, getRecommendations);
router.patch('/update', checkToken, updateLocation);

export default router;