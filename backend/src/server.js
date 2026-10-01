import passport from 'passport';
import './passport.js'; // Jo config file humne banayi thi uska path
import cron from 'node-cron';
import User from './models/User.js'; // Apna User model ka path check kar lena
import 'dotenv/config'; // Yeh line sabse upar honi chahiye taaki .env sabse pehle load ho!
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import connectDB from './config/db.js';


connectDB(); // Call the function to connect to MongoDB

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json()); 
app.use(passport.initialize());

// Health Check route for Keep-Alive pings
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);

const PORT = process.env.PORT || 5000;
// 🧹 CRON JOB: Har raat 12 baje chalega (0 0 * * *)
cron.schedule('0 0 * * *', async () => {
  try {
    // Aaj se theek 24 ghante pehle ka time nikalo
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Un users ko delete karo jo verified nahi hain AUR 24 ghante pehle bane the
    const result = await User.deleteMany({
      isVerified: false,
      createdAt: { $lt: yesterday }
    });
    
    if (result.deletedCount > 0) {
      console.log(`🧹 CRON Job: ${result.deletedCount} unverified fake accounts deleted.`);
    }
  } catch (error) {
    console.error('CRON Job Error:', error);
  }
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});