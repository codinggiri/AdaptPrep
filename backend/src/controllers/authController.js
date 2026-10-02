
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import User from '../models/User.js';
// import dotenv from 'dotenv';
// import nodemailer from 'nodemailer'; 

// dotenv.config();

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.ADMIN_EMAIL,
//     pass: process.env.EMAIL_PASS
//   }
// });

// // 1. REGISTER (With Actual Link & Admin Alert)
// export const register = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     // Strong Password Check (Add this inside your register function)
//     const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

//     if (!passwordRegex.test(password)) {
//         return res.status(400).json({ 
//             error: 'Password must be at least 8 characters long, contain 1 uppercase, 1 lowercase, 1 number, and 1 special character.' 
//         });
//     }
//     const existingUser = await User.findOne({ email });
//     if (existingUser) return res.status(400).json({ error: 'User already exists' });

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const newUser = new User({ name, email, password: hashedPassword });
//     await newUser.save();

//     // Asali Verification Token banana (1 ghante ke liye valid)
//     const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
//     const verificationLink = `http://localhost:5000/api/auth/verify/${verificationToken}`;

//     // 1. USER ko Verification Email bhejna
//     transporter.sendMail({
//       from: process.env.ADMIN_EMAIL,
//       to: email,
//       subject: 'Verify your AdaptPrep Account 🚀',
//       html: `Hi ${name},<br><br>Welcome to AdaptPrep! Click the link below to verify your email:<br><br>
//              <a href="${verificationLink}">Verify My Email</a><br><br>Happy Coding,<br>AdaptPrep Team`
//     }).catch(err => console.log("User Email error:", err));

//     // 2. ADMIN (Aapko) Notification Email bhejna (Yeh miss ho gaya tha!)
//     transporter.sendMail({
//       from: process.env.ADMIN_EMAIL,
//       to: process.env.ADMIN_EMAIL,
//       subject: '🚨 New Registration Alert!',
//       text: `Naya user add hua hai database mein!\n\nName: ${name}\nEmail: ${email}`
//     }).catch(err => console.log("Admin email error:", err));

//     res.status(201).json({ message: 'Account created! Please check your email to verify.' });
//   } catch (error) {
//     res.status(500).json({ error: 'Server Error' });
//   }
// };

// // 2. VERIFY EMAIL (Jab user link par click karega)
// export const verifyEmail = async (req, res) => {
//   try {
//     const { token } = req.params;
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
//     const user = await User.findOne({ email: decoded.email });
//     if (!user) return res.status(400).json({ error: 'Invalid token' });

//     user.isVerified = true;
//     await user.save();

//     res.send("<h1>Email Verified Successfully! 🚀</h1><p>You can now close this tab and login to AdaptPrep.</p>");
//   } catch (error) {
//     res.status(400).send("<h1>Invalid or Expired Link</h1>");
//   }
// };

// // 3. LOGIN (With Verification & Block Check)
// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
    
//     if (!user) return res.status(404).json({ error: 'User not found' });

//     // 🛑 NAYA CHECK (Tip Added): Kya user block ho chuka hai?
//     if (user.isBlocked) {
//       return res.status(403).json({ error: 'Access Denied: Your account has been blocked due to suspicious activity. Please contact admin.' });
//     }

//     // 🛑 CHECK: User verified hai ya nahi?
//     if (!user.isVerified) {
//       return res.status(403).json({ error: 'Access Denied: Please verify your email first by clicking the link sent to your inbox.' });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
//     res.json({ message: 'Login successful', token, user: { name: user.name, email: user.email, isVerified: user.isVerified } });
//   } catch (error) {
//     res.status(500).json({ error: 'Server Error' });
//   }
// };

// // 4. FORGOT PASSWORD (With Suspicious Alert)
// export const forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ error: 'User not found' });

//     // Agar account already blocked hai toh OTP mat bhejo
//     if (user.isBlocked) {
//       return res.status(403).json({ error: 'Account is blocked. Please contact admin.' });
//     }

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
//     user.resetOtp = otp;
//     user.otpExpires = Date.now() + 15 * 60 * 1000; 
//     user.otpAttempts = 0; // Naya OTP manga toh attempts zero kar do
//     await user.save();

//     // 1. User ko OTP bhejna
//     transporter.sendMail({
//       from: process.env.ADMIN_EMAIL,
//       to: email,
//       subject: 'AdaptPrep Password Reset OTP 🔑',
//       text: `Your OTP for password reset is: ${otp}\n\nThis OTP is valid for 15 minutes.`
//     }).catch(err => console.log("OTP Email error:", err));

//     // 2. Admin ko SUSPICIOUS ACTIVITY ALERT
//     transporter.sendMail({
//       from: process.env.ADMIN_EMAIL,
//       to: process.env.ADMIN_EMAIL,
//       subject: '⚠️ Suspicious Activity Alert: Password Reset',
//       text: `Alert! Password reset has been requested for user: ${email}.\nIf this is unexpected, keep an eye on this account.`
//     }).catch(err => console.log("Admin alert error:", err));

//     res.json({ message: 'OTP sent to your email' });
//   } catch (error) {
//     res.status(500).json({ error: 'Server Error' });
//   }
// };

// // 5. RESET PASSWORD (With 3-Strike Block & Credentials Email)
// export const resetPassword = async (req, res) => {
//   try {
//     const { email, otp, newPassword } = req.body;

//     // Strong Password Check (Add this inside your register function)
// const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// if (!passwordRegex.test(newPassword)) {
//   return res.status(400).json({ 
//     error: 'Password must be at least 8 characters long, contain 1 uppercase, 1 lowercase, 1 number, and 1 special character.' 
//   });
// }
//     const user = await User.findOne({ email });

//     if (!user) return res.status(404).json({ error: 'User not found' });
//     if (user.isBlocked) return res.status(403).json({ error: 'Account blocked.' });

//     // WRONG OTP CHECK (3-STRIKE RULE)
//     if (user.resetOtp !== otp) {
//       user.otpAttempts += 1; // Galat attempt count badhao
      
//       // Agar 3 baar galat dala toh Block kar do
//       if (user.otpAttempts >= 3) {
//         user.isBlocked = true;
//         await user.save();

//         // Admin ko Block Alert
//         transporter.sendMail({
//           from: process.env.ADMIN_EMAIL,
//           to: process.env.ADMIN_EMAIL,
//           subject: '🚨 CRITICAL: User Account Blocked!',
//           text: `User ${email} has been BLOCKED after 3 failed OTP attempts.`
//         }).catch(err => console.log(err));

//         // User ko Block Alert
//         transporter.sendMail({
//           from: process.env.ADMIN_EMAIL,
//           to: email,
//           subject: '❌ Security Alert: Account Blocked',
//           text: `Your account has been blocked due to 3 incorrect OTP attempts. Please contact support.`
//         }).catch(err => console.log(err));

//         return res.status(403).json({ error: 'Account BLOCKED due to 3 failed OTP attempts.' });
//       }
      
//       await user.save();
//       return res.status(400).json({ error: `Invalid OTP. You have ${3 - user.otpAttempts} attempts left.` });
//     }

//     if (Date.now() > user.otpExpires) {
//       return res.status(400).json({ error: 'OTP has expired' });
//     }

//     // SUCCESS: Naya password save karo
//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(newPassword, salt);
    
//     user.resetOtp = null;
//     user.otpExpires = null;
//     user.otpAttempts = 0; 
//     await user.save();

//     // 1. Admin ko SUCCESS ALERT (Not Suspicious)
//     transporter.sendMail({
//       from: process.env.ADMIN_EMAIL,
//       to: process.env.ADMIN_EMAIL,
//       subject: '✅ Password Reset Successful',
//       text: `Update: User ${email} has successfully verified their OTP and reset the password. The previous suspicious alert can be ignored.`
//     }).catch(err => console.log(err));

//     // 2. User ko unke CREDENTIALS bhejna
//     transporter.sendMail({
//       from: process.env.ADMIN_EMAIL,
//       to: email,
//       subject: '🔑 Your New AdaptPrep Credentials',
//       text: `Your password has been successfully reset.\n\nYour new credentials are:\nEmail: ${email}\nPassword: ${newPassword}\n\nPlease keep this safe.`
//     }).catch(err => console.log(err));

//     res.json({ message: 'Password reset successful. You can now login.' });
//   } catch (error) {
//     res.status(500).json({ error: 'Server Error' });
//   }
// };

// // 6. UNBLOCK USER (Admin Only)
// export const unblockUser = async (req, res) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ email });

//     if (!user) return res.status(404).json({ error: 'User not found' });

//     // User ko unblock karna aur attempts reset karna
//     user.isBlocked = false;
//     user.otpAttempts = 0;
//     await user.save();

//     // User ko email bhejna ki account unblock ho gaya hai
//     transporter.sendMail({
//       from: process.env.ADMIN_EMAIL,
//       to: email,
//       subject: '✅ Account Unblocked',
//       text: `Your AdaptPrep account has been unblocked by the admin. You can now login or reset your password safely.`
//     }).catch(err => console.log(err));

//     res.json({ message: `User ${email} has been successfully unblocked.` });
//   } catch (error) {
//     res.status(500).json({ error: 'Server Error' });
//   }
// };



import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

// Brevo HTTP API (port 443) - Render free tier par SMTP block hota hai, isiliye API use kar rahe hain.
// Neeche ka transporter.sendMail(...) wala saara code same rahega, kuch badalna nahi hai.
const transporter = {
  sendMail: async ({ to, subject, text, html }) => {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        accept: 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'AdaptPrep', email: process.env.ADMIN_EMAIL },
        to: [{ email: to }],
        subject,
        ...(html ? { htmlContent: html } : { textContent: text })
      })
    });
    if (!res.ok) {
      throw new Error(`Brevo error ${res.status}: ${await res.text()}`);
    }
    return res.json();
  }
};

// 1. REGISTER (With Actual Link & Admin Alert)
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Strong Password Check (Add this inside your register function)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
        return res.status(400).json({ 
            error: 'Password must be at least 8 characters long, contain 1 uppercase, 1 lowercase, 1 number, and 1 special character.' 
        });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    // Asali Verification Token banana (1 ghante ke liye valid)
    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const verificationLink = `${backendUrl}/api/auth/verify/${verificationToken}`;

    // 1. USER ko Verification Email bhejna
    transporter.sendMail({
      from: process.env.ADMIN_EMAIL,
      to: email,
      subject: 'Verify your AdaptPrep Account 🚀',
      html: `Hi ${name},<br><br>Welcome to AdaptPrep! Click the link below to verify your email:<br><br>
             <a href="${verificationLink}">Verify My Email</a><br><br>Happy Coding,<br>AdaptPrep Team`
    }).catch(err => console.log("User Email error:", err));

    // 2. ADMIN (Aapko) Notification Email bhejna (Yeh miss ho gaya tha!)
    transporter.sendMail({
      from: process.env.ADMIN_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: '🚨 New Registration Alert!',
      text: `Naya user add hua hai database mein!\n\nName: ${name}\nEmail: ${email}`
    }).catch(err => console.log("Admin email error:", err));

    res.status(201).json({ message: 'Account created! Please check your email to verify.' });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
};

// 2. VERIFY EMAIL (Jab user link par click karega)
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(400).json({ error: 'Invalid token' });

    user.isVerified = true;
    await user.save();

    res.send("<h1>Email Verified Successfully! 🚀</h1><p>You can now close this tab and login to AdaptPrep.</p>");
  } catch (error) {
    res.status(400).send("<h1>Invalid or Expired Link</h1>");
  }
};

// 3. LOGIN (With Verification & Block Check)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    // 🛑 NAYA CHECK (Tip Added): Kya user block ho chuka hai?
    if (user.isBlocked) {
      return res.status(403).json({ error: 'Access Denied: Your account has been blocked due to suspicious activity. Please contact admin.' });
    }

    // 🛑 CHECK: User verified hai ya nahi?
    if (!user.isVerified) {
      return res.status(403).json({ error: 'Access Denied: Please verify your email first by clicking the link sent to your inbox.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ message: 'Login successful', token, user: { name: user.name, email: user.email, isVerified: user.isVerified } });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
};

// 4. FORGOT PASSWORD (With Suspicious Alert)
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Agar account already blocked hai toh OTP mat bhejo
    if (user.isBlocked) {
      return res.status(403).json({ error: 'Account is blocked. Please contact admin.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    user.resetOtp = otp;
    user.otpExpires = Date.now() + 15 * 60 * 1000; 
    user.otpAttempts = 0; // Naya OTP manga toh attempts zero kar do
    await user.save();

    // 1. User ko OTP bhejna
    transporter.sendMail({
      from: process.env.ADMIN_EMAIL,
      to: email,
      subject: 'AdaptPrep Password Reset OTP 🔑',
      text: `Your OTP for password reset is: ${otp}\n\nThis OTP is valid for 15 minutes.`
    }).catch(err => console.log("OTP Email error:", err));

    // 2. Admin ko SUSPICIOUS ACTIVITY ALERT
    transporter.sendMail({
      from: process.env.ADMIN_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: '⚠️ Suspicious Activity Alert: Password Reset',
      text: `Alert! Password reset has been requested for user: ${email}.\nIf this is unexpected, keep an eye on this account.`
    }).catch(err => console.log("Admin alert error:", err));

    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
};

// 5. RESET PASSWORD (With 3-Strike Block & Credentials Email)
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Strong Password Check (Add this inside your register function)
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

if (!passwordRegex.test(newPassword)) {
  return res.status(400).json({ 
    error: 'Password must be at least 8 characters long, contain 1 uppercase, 1 lowercase, 1 number, and 1 special character.' 
  });
}
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.isBlocked) return res.status(403).json({ error: 'Account blocked.' });

    // WRONG OTP CHECK (3-STRIKE RULE)
    if (user.resetOtp !== otp) {
      user.otpAttempts += 1; // Galat attempt count badhao
      
      // Agar 3 baar galat dala toh Block kar do
      if (user.otpAttempts >= 3) {
        user.isBlocked = true;
        await user.save();

        // Admin ko Block Alert
        transporter.sendMail({
          from: process.env.ADMIN_EMAIL,
          to: process.env.ADMIN_EMAIL,
          subject: '🚨 CRITICAL: User Account Blocked!',
          text: `User ${email} has been BLOCKED after 3 failed OTP attempts.`
        }).catch(err => console.log(err));

        // User ko Block Alert
        transporter.sendMail({
          from: process.env.ADMIN_EMAIL,
          to: email,
          subject: '❌ Security Alert: Account Blocked',
          text: `Your account has been blocked due to 3 incorrect OTP attempts. Please contact support.`
        }).catch(err => console.log(err));

        return res.status(403).json({ error: 'Account BLOCKED due to 3 failed OTP attempts.' });
      }
      
      await user.save();
      return res.status(400).json({ error: `Invalid OTP. You have ${3 - user.otpAttempts} attempts left.` });
    }

    if (Date.now() > user.otpExpires) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    // SUCCESS: Naya password save karo
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    user.resetOtp = null;
    user.otpExpires = null;
    user.otpAttempts = 0; 
    await user.save();

    // 1. Admin ko SUCCESS ALERT (Not Suspicious)
    transporter.sendMail({
      from: process.env.ADMIN_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: '✅ Password Reset Successful',
      text: `Update: User ${email} has successfully verified their OTP and reset the password. The previous suspicious alert can be ignored.`
    }).catch(err => console.log(err));

    // 2. User ko unke CREDENTIALS bhejna
    transporter.sendMail({
      from: process.env.ADMIN_EMAIL,
      to: email,
      subject: '🔑 Your New AdaptPrep Credentials',
      text: `Your password has been successfully reset.\n\nYour new credentials are:\nEmail: ${email}\nPassword: ${newPassword}\n\nPlease keep this safe.`
    }).catch(err => console.log(err));

    res.json({ message: 'Password reset successful. You can now login.' });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
};

// 6. UNBLOCK USER (Admin Only)
export const unblockUser = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ error: 'User not found' });

    // User ko unblock karna aur attempts reset karna
    user.isBlocked = false;
    user.otpAttempts = 0;
    await user.save();

    // User ko email bhejna ki account unblock ho gaya hai
    transporter.sendMail({
      from: process.env.ADMIN_EMAIL,
      to: email,
      subject: '✅ Account Unblocked',
      text: `Your AdaptPrep account has been unblocked by the admin. You can now login or reset your password safely.`
    }).catch(err => console.log(err));

    res.json({ message: `User ${email} has been successfully unblocked.` });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
};