import passport from 'passport';
import jwt from 'jsonwebtoken';
// Pehle se jo imports hain unhe rehne dena
import express from 'express';
import { register, login, verifyEmail, forgotPassword, resetPassword, unblockUser } from '../controllers/authController.js';

const router = express.Router();


// ==========================================
// GOOGLE OAUTH ROUTES
// ==========================================

// Route 1: Jab user "Sign in with Google" button dabayega, toh yeh route usko Google ke page par le jayega
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Route 2: Jab user Google par login kar lega, toh Google usko is route par wapas bhejega
router.get('/google/callback', 
  passport.authenticate('google', { 
    session: false, 
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login` 
  }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    const clientUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${clientUrl}/interview?token=${token}`);
  }
);

// Route add karein
router.post('/admin/unblock', unblockUser);

// Purani routes
router.post('/register', register);
router.post('/login', login);

// Nayi routes jo add karni thi
router.get('/verify/:token', verifyEmail); 
router.post('/forgot-password', forgotPassword); 
router.post('/reset-password', resetPassword); 


export default router;