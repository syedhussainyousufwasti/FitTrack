
require('dotenv').config();

const express               = require('express');
const router                = express.Router();
const bcrypt                = require('bcryptjs');
const jwt                   = require('jsonwebtoken');
const User                  = require('../models/User');
const sendVerificationEmail = require('../utils/sendEmail');

const SECRET = process.env.JWT_SECRET;

// REGISTER
router.post('/register', async (req, res) => {
  try {
    console.log('Raw body received:', req.body);
    console.log('Content-Type:', req.headers['content-type']);

    if (!req.body) {
      return res.status(400).json({ message: 'No body received' });
    }

    const name     = req.body.name;
    const email    = req.body.email;
    const password = req.body.password;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });

    const exists = await User.findOne({ email });
    if (exists && exists.isVerified)
      return res.status(400).json({ message: 'Email already registered' });

    const code   = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    const hashedPassword = await bcrypt.hash(password, 10);

    if (exists && !exists.isVerified) {
      exists.name             = name;
      exists.password         = hashedPassword;
      exists.verifyCode       = code;
      exists.verifyCodeExpiry = expiry;
      await exists.save();
    } else {
      await new User({
        name,
        email,
        password:         hashedPassword,
        verifyCode:       code,
        verifyCodeExpiry: expiry
      }).save();
    }

    console.log('User saved. Sending email to:', email, '| Code:', code);
    await sendVerificationEmail(email, name, code);
    console.log('Email sent successfully');

    res.json({ message: 'Verification code sent to your email!' });

  } catch (err) {
    console.error('REGISTER ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// VERIFY
router.post('/verify', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code)
      return res.status(400).json({ message: 'Email and code are required' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: 'User not found' });

    if (user.verifyCode !== code)
      return res.status(400).json({ message: 'Invalid verification code' });

    if (user.verifyCodeExpiry < new Date())
      return res.status(400).json({ message: 'Code expired. Please register again.' });

    user.isVerified       = true;
    user.verifyCode       = undefined;
    user.verifyCodeExpiry = undefined;
    await user.save();

    res.json({ message: 'Email verified! You can now login.' });

  } catch (err) {
    console.error('VERIFY ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: 'No account found with this email' });

    if (!user.isVerified)
      return res.status(400).json({ message: 'Please verify your email first' });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      return res.status(400).json({ message: 'Incorrect password' });

    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: '7d' });

    res.json({ token, id: user._id, name: user.name, email: user.email });

  } catch (err) {
    console.error('LOGIN ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// RESEND CODE
router.post('/resend', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: 'No account found with this email' });

    if (user.isVerified)
      return res.status(400).json({ message: 'Account already verified' });

    const code   = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    user.verifyCode       = code;
    user.verifyCodeExpiry = expiry;
    await user.save();

    console.log('Resending code to:', email);
    console.log('New code is:', code);

    await sendVerificationEmail(email, user.name, code);

    res.json({ message: 'New verification code sent!' });

  } catch (err) {
    console.error('RESEND ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;