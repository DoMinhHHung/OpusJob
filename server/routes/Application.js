const express = require("express");
const authenticateToken = require("../middleware/isAuthenticated");
const router = express.Router();
const {
  applyJob,
  getAppliedJobs,
  getApplicants,
  updateStatus,
} = require("../Controllers/Aplication");

router.post("/apply/:id", authenticateToken, applyJob);
router.get("/get", authenticateToken, getAppliedJobs);
router.get("/get/:id", authenticateToken, getApplicants);
router.put("/update/:id", authenticateToken, updateStatus);
module.exports = router;
