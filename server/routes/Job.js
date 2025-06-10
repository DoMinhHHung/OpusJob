const express = require("express");
const {
  postJob,
  getAllJobs,
  getJobById,
  getAdminJobs,
  updateJob,
  deleteJob,
} = require("../Controllers/Job");
const authenticateToken = require("../middleware/isAuthenticated");

const router = express.Router();

router.post("/post", authenticateToken, postJob);
router.get("/get", authenticateToken, getAllJobs);
router.get("/get/:id", authenticateToken, getJobById);
router.get("/get/admin", authenticateToken, getAdminJobs);
router.put("/update/:id", authenticateToken, updateJob);
router.delete("/delete/:id", authenticateToken, deleteJob);
module.exports = router;
