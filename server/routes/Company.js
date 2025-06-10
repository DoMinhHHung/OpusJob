const express = require("express");
const authenticateToken = require("../middleware/isAuthenticated");
const {
  registerCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
} = require("../Controllers/Company");

const router = express.Router();

router.route("/register").post(authenticateToken, registerCompany);
router.route("/get").get(authenticateToken, getAllCompanies);
router.route("/get/:id").get(authenticateToken, getCompanyById);
router.route("/update/:id").put(authenticateToken, updateCompany);

module.exports = router;
