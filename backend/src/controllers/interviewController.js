import User from '../models/User.js';
import { RLEngine } from '../services/rlEngine.js';
import { questionBank } from '../data/questions.js';

// Interview start karne ka API
export const startInterview = async (req, res) => {
  try {
    const userId = req.user.id; // Yeh authMiddleware se aayega
    
    // Database se asali user dhoondo
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // RL Engine se pehla question select karo
    const nextStep = RLEngine.selectNextQuestion(user);
    
    // Naya session banao aur MongoDB mein save karo
    const sessionId = `session_${Date.now()}`;
    if (!user.sessions) user.sessions = [];
    user.sessions.push({ sessionId, startTime: Date.now(), history: [] });
    
    await user.save(); // Database update

    res.json({ 
      message: 'Interview started', 
      sessionId, 
      question: nextStep.question 
    });
  } catch (error) {
    console.error("Interview Start Error:", error);
    res.status(500).json({ error: 'Server Error' });
  }
};

// Answer submit karne aur next question decide karne ka API
export const submitAnswer = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId, questionId, isSolved, timeTakenSec, hintsUsed } = req.body;
    
    // Database se user nikalo
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const question = questionBank.find(q => q.id === questionId);
    if (!question) return res.status(400).json({ error: 'Question not found' });

    // Initialize mastery and history agar naya account hai
    if (!user.mastery) user.mastery = {};
    if (!user.history) user.history = [];

    // 1. RL Engine se Reward Calculate karo
    const reward = RLEngine.calculateReward(isSolved, timeTakenSec, hintsUsed);
    
    // 2. User ki Mastery Update karo
    const currentMastery = user.mastery[question.topic] || 0.5;
    user.mastery[question.topic] = RLEngine.updateMastery(currentMastery, reward);
    
    // Mongoose ko explicitly batana padta hai ki Object modify hua hai
    user.markModified('mastery'); 

    // 3. History aur stats save karo
    user.history.push({ questionId, isSolved, timeTakenSec, reward, date: new Date() });
    if (isSolved) user.questionsSolved += 1;

    // MongoDB mein sab kuch hamesha ke liye save!
    await user.save();

    // 4. Agla question decide karo based on updated mastery
    const nextStep = RLEngine.selectNextQuestion(user);

    res.json({
      message: 'Answer processed',
      reward: reward,
      updatedMastery: user.mastery,
      nextQuestion: nextStep.question
    });
  } catch (error) {
    console.error("Submit Answer Error:", error);
    res.status(500).json({ error: 'Server Error' });
  }
};



// ==========================================
// User History aur Stats nikalne ka API
// ==========================================
export const getUserHistory = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    
    // User ko dhoondo aur sirf zaroori fields nikalo taaki API fast chale
    const user = await User.findById(userId).select('history sessions mastery questionsSolved');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Frontend ko ekdum structured format mein data bhej do
    res.status(200).json({
      success: true,
      stats: {
        totalQuestionsSolved: user.questionsSolved || 0,
        mastery: user.mastery || {}
      },
      sessions: user.sessions || [],
      history: user.history || []
    });

  } catch (error) {
    console.error("🔥 Error fetching history:", error);
    res.status(500).json({ error: "Failed to fetch interview history." });
  }
};