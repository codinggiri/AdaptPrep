import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionType: { 
    type: String, 
    enum: ['coding', 'mcq', 'voice'], 
    required: true 
  },
  topic: { type: String, required: true }, // e.g., 'dsa', 'os', 'behavioral'
  questionText: { type: String, required: true },
  
  // User ka response
  userAnswer: { type: String }, // Code snippet, selected option, ya transcribed voice text
  timeTakenInSeconds: { type: Number },
  
  // LLM ka analysis
  llmFeedback: { type: String }, // "You missed the base case...", "Good eye contact but..."
  mistakesAnalyzed: [{ type: String }], // Array of specific errors (Syntax, Logic, Communication)
  lpaAwarded: { type: Number, default: 0.0 } // Is question pe kitne points mile (+0.5, -0.2, etc.)
});

const interviewSessionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  sessionTier: { type: String }, // Kis tier ka interview chal raha tha (e.g., Core Tier)
  questions: [questionSchema], // Upar banaya hua schema use kar rahe hain
  
  // Session khatam hone ke baad final report
  totalLpaEarned: { type: Number, default: 0.0 },
  sessionSummary: { type: String }, // LLM ka final motivation/feedback message
  isCompleted: { type: Boolean, default: false }
}, { timestamps: true });

const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);
export default InterviewSession;