import { questionBank } from '../data/questions.js';

export class RLEngine {
  // Reward function: Optimal challenge yields max reward
  static calculateReward(isSolved, timeTakenSec, hintsUsed) {
    if (!isSolved) return -0.4;
    
    // Base reward for solving
    let reward = 0.6;
    
    // Bonus if solved in reasonable time without excessive hints
    if (timeTakenSec < 300 && hintsUsed <= 1) {
      reward += 0.4; // Max learning efficiency
    } else if (hintsUsed > 2) {
      reward += 0.1;
    }
    return reward;
  }

  // Update mastery vector via Exponential Moving Average (Q-update style)
  static updateMastery(currentMastery, reward, alpha = 0.2) {
    // New Mastery = Old + alpha * (Target - Old)
    const target = reward > 0 ? Math.min(1.0, currentMastery + reward * 0.3) : Math.max(0.1, currentMastery - 0.2);
    return parseFloat((currentMastery + alpha * (target - currentMastery)).toFixed(2));
  }

  // Select next question using Exploration vs Exploitation (epsilon-greedy)
  static selectNextQuestion(userProfile, epsilon = 0.2) {
    
    // NAYA CODE ADD KIYA: Edge case: Cold start fix for new user
    if (!userProfile.mastery || Object.keys(userProfile.mastery).length === 0) {
      userProfile.mastery = { Arrays: 0.3, DP: 0.3, Graphs: 0.3 };
    }

    const topics = Object.keys(userProfile.mastery);
    let chosenTopic;

    // Exploration: pick random topic
    if (Math.random() < epsilon) {
      chosenTopic = topics[Math.floor(Math.random() * topics.length)];
    } else {
      // Exploitation: Pick topic with lowest mastery to help user improve
      chosenTopic = topics.reduce((minT, t) => userProfile.mastery[t] < userProfile.mastery[minT] ? t : minT, topics[0]);
    }

    const currentScore = userProfile.mastery[chosenTopic]; // 0.0 to 1.0
    
    // Map continuous mastery score to discrete difficulty level (1, 2, or 3)
    let targetDifficulty = 1;
    if (currentScore > 0.66) targetDifficulty = 3;
    else if (currentScore > 0.33) targetDifficulty = 2;

    // Filter questions
    const eligible = questionBank.filter(q => q.topic === chosenTopic && q.difficulty === targetDifficulty);
    const selected = eligible.length > 0 ? eligible[Math.floor(Math.random() * eligible.length)] : questionBank[0];

    return { question: selected, chosenTopic, targetDifficulty };
  }
} 