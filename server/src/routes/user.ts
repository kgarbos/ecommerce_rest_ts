import express from 'express';
const router = express.Router();
import { protect } from '../middleware/auth'; // Import the protect middleware

const {
  register,
  confirmEmail,
  login,
  logout,
  forgotpassword,
  resetpassword,
  deleteProfile,
  updateUser,
  getProfile
} = require('../controllers/user');

router.route("/register").post(register);
router.route("/confirm-email/:token").get(confirmEmail);
router.route("/login").post(login);
router.route("/logout").post(protect, logout);
router.route("/forgotpassword").post(forgotpassword);
router.route("/resetpassword/:token").put(resetpassword);
router.route('/delete-profile').delete(protect, deleteProfile);
router.route('/update-user').patch(protect, updateUser);
router.route('/me').get(protect, getProfile);

module.exports = router;