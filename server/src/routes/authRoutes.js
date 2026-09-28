import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { otpService } from '../services/otpService.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: JWT_SECRET environment variable is missing in production. Set JWT_SECRET in Render environment variables.');
    }
    return 'jobfinder_dev_jwt_secret_2026_india';
  }
  return secret;
};
const JWT_EXPIRES_IN = '30d';

// Generate JWT token helper
function generateToken(id) {
  return jwt.sign({ id }, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
}

// 1. SIGNUP: Create user & send 6-digit OTP
router.post('/signup', async (req, res) => {
  try {
    const { fullName, email, phone, password, targetRole, experienceLevel, currentCtc, expectedCtc } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Please provide full name, email, and password.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let existingUser = await User.findOne({ email: cleanEmail });

    const otpCode = otpService.generateOtp();
    const otpExpiresAt = otpService.getExpiryDate(10); // 10 minutes

    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({
          error: 'An account with this email address already exists. Please sign in instead.'
        });
      }

      // Existing unverified account: update credentials and send fresh OTP
      existingUser.fullName = fullName.trim();
      existingUser.phone = phone ? phone.trim() : existingUser.phone;
      existingUser.password = password; // pre-save hook will hash
      existingUser.targetRole = targetRole || existingUser.targetRole;
      existingUser.experienceLevel = experienceLevel || existingUser.experienceLevel;
      if (currentCtc) existingUser.currentCtcLpa = Number(currentCtc);
      if (expectedCtc) existingUser.expectedCtcLpa = Number(expectedCtc);
      existingUser.otp = { code: otpCode, expiresAt: otpExpiresAt, attempts: 0 };

      await existingUser.save();

      // Dispatch OTP
      await otpService.sendOtp({
        email: cleanEmail,
        phone: existingUser.phone,
        code: otpCode,
        type: 'signup',
        fullName: existingUser.fullName
      });

      return res.json({
        success: true,
        message: `Verification code sent to ${cleanEmail}${existingUser.phone ? ` and ${existingUser.phone}` : ''}`,
        email: cleanEmail
      });
    }

    // Create new unverified user
    const newUser = new User({
      fullName: fullName.trim(),
      email: cleanEmail,
      phone: phone ? phone.trim() : '',
      password,
      isVerified: false,
      targetRole: targetRole || 'Software Professional',
      experienceLevel: experienceLevel || 'Mid-Level',
      currentCtcLpa: currentCtc ? Number(currentCtc) : 0,
      expectedCtcLpa: expectedCtc ? Number(expectedCtc) : 0,
      otp: {
        code: otpCode,
        expiresAt: otpExpiresAt,
        attempts: 0
      }
    });

    await newUser.save();

    // Dispatch OTP
    await otpService.sendOtp({
      email: cleanEmail,
      phone: newUser.phone,
      code: otpCode,
      type: 'signup',
      fullName: newUser.fullName
    });

    res.status(201).json({
      success: true,
      message: `Verification code sent to ${cleanEmail}${newUser.phone ? ` and ${newUser.phone}` : ''}`,
      email: cleanEmail
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: err.message || 'Signup failed' });
  }
});

// 2. VERIFY SIGNUP OTP
router.post('/verify-signup-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and 6-digit OTP code are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    if (!user.otp || !user.otp.code) {
      return res.status(400).json({ error: 'No pending verification OTP found. Please request a new code.' });
    }

    // Check expiration
    if (new Date() > new Date(user.otp.expiresAt)) {
      return res.status(400).json({ error: 'OTP code has expired. Please click resend to get a fresh code.' });
    }

    // Check code match
    if (user.otp.code !== otp.toString().trim()) {
      user.otp.attempts = (user.otp.attempts || 0) + 1;
      await user.save();
      return res.status(400).json({ error: 'Invalid verification code. Please check and try again.' });
    }

    // Mark as verified & clear OTP
    user.isVerified = true;
    user.otp = { code: null, expiresAt: null, attempts: 0 };
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Account verified successfully! Welcome to Job Finder.',
      token,
      user: user.toSafeObject()
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ error: err.message || 'OTP verification failed' });
  }
});

// 3. RESEND OTP (For Signup or Reset)
router.post('/resend-otp', async (req, res) => {
  try {
    const { email, type = 'signup' } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required to resend OTP.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    const otpCode = otpService.generateOtp();
    const otpExpiresAt = otpService.getExpiryDate(10);

    if (type === 'reset') {
      user.resetOtp = { code: otpCode, expiresAt: otpExpiresAt, attempts: 0 };
    } else {
      user.otp = { code: otpCode, expiresAt: otpExpiresAt, attempts: 0 };
    }

    await user.save();

    await otpService.sendOtp({
      email: cleanEmail,
      phone: user.phone,
      code: otpCode,
      type,
      fullName: user.fullName
    });

    res.json({
      success: true,
      message: `Fresh verification code dispatched to ${cleanEmail}`
    });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ error: err.message || 'Failed to resend code' });
  }
});

// 4. LOGIN: Email + Password (checks verification)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // If account not verified yet, send fresh OTP and require verification
    if (!user.isVerified) {
      const otpCode = otpService.generateOtp();
      user.otp = { code: otpCode, expiresAt: otpService.getExpiryDate(10), attempts: 0 };
      await user.save();

      await otpService.sendOtp({
        email: cleanEmail,
        phone: user.phone,
        code: otpCode,
        type: 'signup',
        fullName: user.fullName
      });

      return res.status(403).json({
        requiresOtpVerification: true,
        message: 'Your account is pending verification. We have sent a 6-digit OTP code to your email.',
        email: cleanEmail
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Signed in successfully',
      token,
      user: user.toSafeObject()
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message || 'Sign in failed' });
  }
});

// 5. SEND LOGIN OTP (Passwordless Login Option)
router.post('/send-login-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({ error: 'No account registered with this email.' });
    }

    const otpCode = otpService.generateOtp();
    user.otp = { code: otpCode, expiresAt: otpService.getExpiryDate(10), attempts: 0 };
    await user.save();

    await otpService.sendOtp({
      email: cleanEmail,
      phone: user.phone,
      code: otpCode,
      type: 'login',
      fullName: user.fullName
    });

    res.json({
      success: true,
      message: `Login OTP sent to ${cleanEmail}`
    });
  } catch (err) {
    console.error('Send login OTP error:', err);
    res.status(500).json({ error: err.message || 'Failed to dispatch login OTP' });
  }
});

// 6. VERIFY LOGIN OTP
router.post('/verify-login-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP code are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user || !user.otp || !user.otp.code) {
      return res.status(400).json({ error: 'No login OTP pending for this account.' });
    }

    if (new Date() > new Date(user.otp.expiresAt)) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new code.' });
    }

    if (user.otp.code !== otp.toString().trim()) {
      return res.status(400).json({ error: 'Invalid OTP code. Please try again.' });
    }

    user.isVerified = true;
    user.otp = { code: null, expiresAt: null, attempts: 0 };
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Logged in successfully with OTP',
      token,
      user: user.toSafeObject()
    });
  } catch (err) {
    console.error('Verify login OTP error:', err);
    res.status(500).json({ error: err.message || 'Login OTP verification failed' });
  }
});

// 7. FORGOT PASSWORD: Send Reset OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // For security, can still return success-like message or helpful notification
      return res.status(404).json({ error: 'No account found with this email address.' });
    }

    const otpCode = otpService.generateOtp();
    const otpExpiresAt = otpService.getExpiryDate(10);

    user.resetOtp = {
      code: otpCode,
      expiresAt: otpExpiresAt,
      attempts: 0
    };

    await user.save();

    await otpService.sendOtp({
      email: cleanEmail,
      phone: user.phone,
      code: otpCode,
      type: 'reset',
      fullName: user.fullName
    });

    res.json({
      success: true,
      message: `Password reset verification code sent to ${cleanEmail}${user.phone ? ` and ${user.phone}` : ''}`,
      email: cleanEmail
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: err.message || 'Failed to send reset code' });
  }
});

// 8. VERIFY RESET OTP (Step 2 of Forgot Password)
router.post('/verify-reset-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP code are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user || !user.resetOtp || !user.resetOtp.code) {
      return res.status(400).json({ error: 'No reset request found for this account.' });
    }

    if (new Date() > new Date(user.resetOtp.expiresAt)) {
      return res.status(400).json({ error: 'Reset code has expired. Please request a new code.' });
    }

    if (user.resetOtp.code !== otp.toString().trim()) {
      return res.status(400).json({ error: 'Invalid reset code. Please check and try again.' });
    }

    res.json({
      success: true,
      message: 'Code verified. You may now enter your new password.'
    });
  } catch (err) {
    console.error('Verify reset OTP error:', err);
    res.status(500).json({ error: err.message || 'Failed to verify reset code' });
  }
});

// 9. RESET PASSWORD (Step 3: Enter new password with verified OTP)
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP, and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user || !user.resetOtp || !user.resetOtp.code) {
      return res.status(400).json({ error: 'No active password reset request found.' });
    }

    if (new Date() > new Date(user.resetOtp.expiresAt)) {
      return res.status(400).json({ error: 'Reset code has expired. Please start over.' });
    }

    if (user.resetOtp.code !== otp.toString().trim()) {
      return res.status(400).json({ error: 'Invalid reset code.' });
    }

    // Update password (pre-save hook will hash it)
    user.password = newPassword;
    user.resetOtp = { code: null, expiresAt: null, attempts: 0 };
    await user.save();

    res.json({
      success: true,
      message: 'Password has been reset successfully! You can now sign in with your new password.'
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: err.message || 'Failed to reset password' });
  }
});

// 10. GET ME: Current authenticated user details
router.get('/me', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user.toSafeObject()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 11. UPDATE PROFILE
router.put('/profile', protect, async (req, res) => {
  try {
    const updates = req.body;
    const allowedFields = [
      'fullName', 'phone', 'targetRole', 'headline', 'experienceLevel',
      'currentCtcLpa', 'expectedCtcLpa', 'noticePeriodDays', 'location',
      'skills', 'resumeProfile', 'atsAnalyses', 'careerPreferences', 'savedJobs', 'applications', 'avatar'
    ];

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        req.user[field] = updates[field];
        req.user.markModified(field);
      }
    });

    await req.user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: req.user.toSafeObject()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
