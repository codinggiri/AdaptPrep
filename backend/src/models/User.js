import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // 1. Basic Auth Info
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // IMPORTANT: 'required: true' hata diya for Google Auth
  googleId: { type: String, default: null }, // Google users ko pehchanne ke liye

  // 2. Security & Verification (Tumhara purana logic SAFE hai)
  isVerified: { type: Boolean, default: false },
  resetOtp: { type: String, default: null },
  otpExpires: { type: Date, default: null },
  otpAttempts: { type: Number, default: 0 },
  isBlocked: { type: Boolean, default: false },

  // 3. Old Engine Fields (Compatibility ke liye rakhe hain)
  mastery: { type: Object, default: {} },
  history: { type: Array, default: [] },
  sessions: { type: Array, default: [] },
  questionsSolved: { type: Number, default: 0 },
  rank: { type: String, default: 'Beginner' }, 

  // =====================================
  // 4. NEW: Gamified AI Interview Engine 
  // =====================================
  lpaPoints: { type: Number, default: 0.0 }, // Starts at 0.0 LPA
  currentTier: { 
    type: String, 
    enum: ['Unemployed', 'Service Tier', 'Core Tier', 'FinTech Tier', 'HFT Tier'],
    default: 'Unemployed'
  },
  
  // Consistency aur Motivation ke liye (LeetCode jaisa streak)
  highestStreak: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  lastActiveDate: { type: Date },

  // Subject-wise mastery (out of 100) - Radar Chart aur AI Analytics ke liye
  skills: {
    dsa: { type: Number, default: 0 },
    os: { type: Number, default: 0 },
    dbms: { type: Number, default: 0 },
    systemDesign: { type: Number, default: 0 },
    networks: { type: Number, default: 0 },
    oop: { type: Number, default: 0 },
    behavioral: { type: Number, default: 0 },
    aptitude: { type: Number, default: 0 },
    communication: { type: Number, default: 0 } // Voice response aur English grammar track karne ke liye
  }

}, { timestamps: true });

export default mongoose.model('User', userSchema);