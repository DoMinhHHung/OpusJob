const Job = require("../models/Job");

const postJob = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      location,
      jobType,
      salary,
      companyId,
      experience,
      quantity,
      position,
    } = req.body;
    const userId = req.id;
    if (
      !title ||
      !description ||
      !requirements ||
      !location ||
      !jobType ||
      !salary ||
      !companyId ||
      !experience ||
      !quantity ||
      !position
    ) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }
    const job = await Job.create({
      title,
      description,
      requirements: requirements.split(","),
      location,
      jobType,
      salary: Number(salary),
      company: companyId,
      experience,
      quantity: Number(quantity),
      createdBy: userId,
      position,
    });
    return res
      .status(201)
      .json({ message: "Job posted successfully", job, success: true });
  } catch (error) {
    console.error(error);
  }
};

const getAllJobs = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const query = {
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { requirements: { $regex: keyword, $options: "i" } },
        { location: { $regex: keyword, $options: "i" } },
        { jobType: { $regex: keyword, $options: "i" } },
        { salary: { $regex: keyword, $options: "i" } },
        { company: { $regex: keyword, $options: "i" } },
      ],
    };
    const jobs = await Job.find(query);
    if (!jobs) {
      return res.status(404).json({ message: "No jobs found", success: false });
    }
    return res.status(200).json({ jobs, success: true });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found", success: false });
    }
    return res.status(200).json({ job, success: true });
  } catch (error) {
    console.error(error);
  }
};

const getAdminJobs = async (req, res) => {
  try {
    const adminId = req.id;
    const jobs = await Job.find({ createdBy: adminId });
    if (!jobs) {
      return res.status(404).json({ message: "No jobs found", success: false });
    }
    return res.status(200).json({ jobs, success: true });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

const updateJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const {
      title,
      description,
      requirements,
      location,
      jobType,
      salary,
      companyId,
      experience,
      quantity,
    } = req.body;
    const job = await Job.findByIdAndUpdate(
      jobId,
      {
        title,
        description,
        requirements,
        location,
        jobType,
        salary,
        companyId,
        experience,
        quantity,
      },
      { new: true }
    );
    if (!job) {
      return res.status(404).json({ message: "Job not found", success: false });
    }
    return res
      .status(200)
      .json({ message: "Job updated successfully", job, success: true });
  } catch (error) {
    console.error(error);
  }
};

const deleteJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findByIdAndDelete(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found", success: false });
    }
    return res
      .status(200)
      .json({ message: "Job deleted successfully", success: true });
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  postJob,
  getAllJobs,
  getJobById,
  getAdminJobs,
  updateJob,
  deleteJob,
};
