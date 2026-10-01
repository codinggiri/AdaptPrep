import { GoogleGenerativeAI } from '@google/generative-ai';
import User from '../models/User.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ==========================================
// 1. GENERATE NEXT QUESTION API 
// (AI Adaptive difficulty ke hisaab se question banayega)
// ==========================================
export const generateNextQuestion = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id; 
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found in database." });
    }

    const tier = user.currentTier || 'Unemployed';
    const lpa = user.lpaPoints || 0.0;
    const { topic, previousAnswerContext } = req.body;

    const prompt = `
    You are an expert, strict, and highly experienced interviewer conducting a placement drive for Indian tech companies.
    
    CANDIDATE'S CURRENT PROFILE:
    - Current Tier: ${tier} (Progression: Unemployed -> Service Tier -> Core Tier -> FinTech Tier -> HFT Tier)
    - Current Package: ${lpa} LPA
    - Round Focus / Requested Topic: ${topic || 'General DSA'}
    
    SESSION CONTEXT:
    ${previousAnswerContext ? `Feedback from previous round: "${previousAnswerContext}". Adapt the next question based on this performance.` : 'This is the very first question of the interview. Set a baseline.'}
    
    QUESTION GENERATION RULES (ADAPTIVE DIFFICULTY):
    
    1. If the Round Focus is "Behavioral", "HR", or "Leadership":
       - For 'Unemployed' (< 5 LPA) or 'Service Tier' (5 - 15 LPA): Ask standard HR questions (e.g., introductions, strengths/weaknesses, basic teamwork).
       - For 'Core Tier' (15 - 25 LPA) or 'FinTech Tier' (25 - 60 LPA): Ask situational and leadership questions (e.g., Amazon Leadership Principles, resolving team conflicts, missing deadlines).
       - For 'HFT Tier' (>= 60 LPA): Ask extreme high-pressure situational questions (e.g., handling production crashes, ethical dilemmas).
    
    2. If the Round Focus is "Technical", "DSA", "Coding", or General:
       - For 'Unemployed' (< 5 LPA) or 'Service Tier' (5 - 15 LPA): Ask basic arrays, strings, basic OOPs concepts, or simple SQL queries.
       - For 'Core Tier' (15 - 25 LPA) or 'FinTech Tier' (25 - 60 LPA): Ask Medium-to-Hard LeetCode style algorithmic problems (Trees, Graphs, DP).
       - For 'HFT Tier' (>= 60 LPA): Ask advanced Low-Level Design (LLD), concurrency/multithreading, OS memory management internals.
    
    Ensure the question is professional, extremely clear, and includes constraints if it is a coding question.
    
    OUTPUT FORMAT:
    You MUST respond strictly in VALID JSON format. Do not use markdown blocks, backticks, or extra text. Use this exact structure:
    {
      "questionType": "coding_or_behavioral",
      "topic": "${topic || 'General'}",
      "questionText": "The detailed interview question with constraints (if any).",
      "options": [], 
      "feedbackOnPrevious": "A short, professional acknowledgment of the previous answer context (if any).",
      "lpaAdjustment": 0.0
    }
    `;

    // const fallbackModels = ["gemini-2.5-flash", "gemini-1.5-flash"];
    const fallbackModels = ["gemini-3.8-flash"];
    let result = null;

    for (const modelName of fallbackModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        result = await model.generateContent(prompt);
        break;
      } catch (err) {
        console.log(`❌ Gen failed with ${modelName}: ${err.message}`);
      }
    }

    if (!result) {
      return res.status(200).json({
        questionType: "coding",
        topic: topic || "dsa",
        questionText: "Fallback: Write a function to reverse a linked list.", 
        options: [], 
        feedbackOnPrevious: "Network error. Using standard question.",
        lpaAdjustment: 0.0
      });
    }

    const responseText = result.response.text();
    const cleanedJsonText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const aiResponse = JSON.parse(cleanedJsonText);

    res.status(200).json(aiResponse);

  } catch (error) {
    console.error("🔥 AI Generation Error:", error); 
    res.status(500).json({ error: "Failed to generate question." });
  }
};


// ==========================================
// 2. EVALUATE ANSWER API 
// (AI Check karega, Database me LPA update karega)
// ==========================================
export const evaluateAnswer = async (req, res) => {
  try {
   const { questionText, userAnswer, topic, language } = req.body;
    
    const userId = req.user.id || req.user._id; 
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found in DB." });
    }

    const prompt = `
    You are a strict technical and behavioral interviewer.
    Topic: ${topic || 'General'}
    Language Used: ${language || 'N/A'}
    Question Asked: "${questionText}"
    Candidate's Answer: "${userAnswer}"

    INSTRUCTIONS FOR EVALUATION:
    If the Topic is "Behavioral", "HR", or "Case Study":
    - Ignore code. Judge the candidate on Communication, Leadership, Problem-Solving mindset, and clarity of thought.
    
    If the Topic is "DSA", "Coding", or Technical:
    - Judge strictly on Time Complexity, Space Complexity, and Code Logic.

    You MUST respond strictly in VALID JSON format without any markdown formatting.
    {
      "feedback": "Detailed explanation of what is good and what is wrong based on the round type.",
      "isCorrect": true/false,
      "scoreOutOf10": number,
      "lpaAdjustment": number
    }`;

    // const fallbackModels = ["gemini-2.5-flash", "gemini-1.5-flash"];
    const fallbackModels = ["gemini-3.8-flash"];
    let result = null;

    for (const modelName of fallbackModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        result = await model.generateContent(prompt);
        break;
      } catch (err) {
        console.log(`❌ Eval failed with ${modelName}: ${err.message}`);
      }
    }

    let aiResponse;

    if (!result) {
      aiResponse = {
        feedback: "API limit reached. Assuming answer is partially correct.",
        isCorrect: true,
        scoreOutOf10: 6,
        lpaAdjustment: 0.5
      };
    } else {
      const responseText = result.response.text();
      const cleanedJsonText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      aiResponse = JSON.parse(cleanedJsonText);
    }

    // --- DB UPDATE LOGIC (Ekdum Clean) ---

    // 1. UPDATE LPA
    user.lpaPoints = Number(((user.lpaPoints || 0) + aiResponse.lpaAdjustment).toFixed(2));
    if (user.lpaPoints < 0) user.lpaPoints = 0;

    // 2. UPDATE TIER BASED ON NEW LPA RULES
    if (user.lpaPoints >= 60) {
      user.currentTier = 'HFT Tier';
    } else if (user.lpaPoints >= 25) {
      user.currentTier = 'FinTech Tier';
    } else if (user.lpaPoints >= 15) {
      user.currentTier = 'Core Tier';
    } else if (user.lpaPoints >= 5) {
      user.currentTier = 'Service Tier';
    } else {
      user.currentTier = 'Unemployed';
    }

    // 3. PUSH TO HISTORY
    user.history.push({
      questionId: topic ? `${topic}_AI_Task` : "AI_Code_Task",
      isSolved: aiResponse.isCorrect,
      reward: aiResponse.lpaAdjustment,
      date: new Date()
    });

    // 4. UPDATE SOLVED COUNT
    if (aiResponse.isCorrect) {
      user.questionsSolved = (user.questionsSolved || 0) + 1;
    }

    // 5. SAVE EVERYTHING TO MONGODB
    await user.save(); 

    // FRONTEND KO DATA BHEJO
    res.status(200).json({
      evaluation: aiResponse,
      newLpa: user.lpaPoints,
      newTier: user.currentTier
    });

  } catch (error) {
    console.error("🔥 Evaluation Error:", error);
    res.status(500).json({ error: "Failed to evaluate answer." });
  }
};