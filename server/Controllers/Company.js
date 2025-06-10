const Company = require("../models/Company");

const registerCompany = async (req, res) => {
  try {
    const { name, description, website, location, logo } = req.body;
    if (!name) {
      return res.status(400).json({
        message: "Company name is required",
      });
    }
    let company = await Company.findOne({ name });
    if (company) {
      return res.status(400).json({ message: "Company already exists" });
    }
    company = await Company.create({
      name,
      description,
      website,
      location,
      logo,
      userId: req.id,
    });
    return res.status(201).json({
      message: `Company ${name} created successfully`,
      company,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

const getAllCompanies = async (req, res) => {
  try {
    const userId = req.id;
    const companies = await Company.find({ userId: userId });
    if (!companies) {
      return res.status(404).json({ message: "No companies found" });
    }
    return res.status(200).json({ companies, success: true });
  } catch (error) {
    console.error(error);
  }
};

const getCompanyById = async (req, res) => {
  try {
    const companyId = req.params.id;
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    return res.status(200).json({ company, success: true });
  } catch (error) {
    console.error(error);
  }
};

// update details
const updateCompany = async (req, res) => {
  try {
    const { name, description, website, location, logo } = req.body;
    const file = req.file;
    // cloudnary
    const updateDate = { name, description, website, location };

    const company = await Company.findByIdAndUpdate(req.params.id, updateDate, {
      new: true,
    });
    if (!company) {
      return res.status(404).json({ message: `${company.name} not found` });
    }
    return res.status(200).json({
      message: `Company updated successfull to ${company.name}`,
      company,
    });
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  registerCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
};
