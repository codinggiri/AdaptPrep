import express from 'express';
import { generateNextQuestion, evaluateAnswer } from '../controllers/aiController.js';
import { authenticate } from '../middleware/authMiddleware.js'; 
import { startInterview, submitAnswer, getUserHistory } from '../controllers/interviewController.js';

const router = express.Router();

// AI se naya question mangne ka route
router.post('/next-question', authenticate, generateNextQuestion);
router.post('/evaluate', authenticate, evaluateAnswer);
router.get('/history', authenticate, getUserHistory);
// RL Engine wale naye routes
router.post('/start', authenticate, startInterview);
router.post('/submit', authenticate, submitAnswer);
export default router;