import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from './models/User.js'; // Make sure User model ka path correct ho
import dotenv from 'dotenv';

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback" // Jab Google login ho jayega, toh user yahan wapas aayega
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // 1. Check karein ki kya user pehle se hamare database mein hai?
      let user = await User.findOne({ email: profile.emails[0].value });

      if (user) {
        // Agar user pehle email/password se ban chuka hai, toh usme googleId add kar do
        if (!user.googleId) {
          user.googleId = profile.id;
          user.isVerified = true; // Google users hamesha verified hote hain
          await user.save();
        }
        return done(null, user);
      } else {
        // 2. Agar naya user hai, toh database mein save kar lo bina password ke
        const newUser = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          isVerified: true // Auto verify
        });
        await newUser.save();
        return done(null, newUser);
      }
    } catch (error) {
      return done(error, null);
    }
  }
));

export default passport;