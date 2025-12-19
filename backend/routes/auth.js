const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const RegisterRequest = require('../models/RegisterRequest');
const sendEmail = require('../utils/sendEmail');
const router = express.Router();

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required.' });
  try {
    const user = await RegisterRequest.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No user with that email.' });

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Email content
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}`;
    const message = `You requested a password reset.\n\nPlease click the link below to reset your password:\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      text: message
    });
    res.json({ message: 'Password reset email sent.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  if (!password) return res.status(400).json({ message: 'Password is required.' });
  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await RegisterRequest.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token.' });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: 'Password has been reset.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;