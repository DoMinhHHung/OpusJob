const express = require("express");
const {
  register,
  login,
  logout,
  updateProfile,
} = require("../Controllers/User");
const authenticateToken = require("../middleware/isAuthenticated");

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/profile/update").post(authenticateToken, updateProfile);

module.exports = router;
