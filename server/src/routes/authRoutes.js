const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  updatePreferences,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { registerSchema, loginSchema } = require('../validators');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/preferences', protect, updatePreferences);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resetToken', resetPassword);

module.exports = router;
