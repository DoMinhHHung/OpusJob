const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, password, role } = req.body;
    if (!fullname || !email || !phoneNumber || !password || !role) {
      return res
        .status(400)
        .json({ message: "All fields are required" }, { success: false });
    }
    const user = await User.findOne({ email, phoneNumber });
    if (user) {
      return res
        .status(400)
        .json({ message: "User already exists" }, { success: false });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      fullname,
      email,
      phoneNumber,
      password: hashedPassword,
      role,
    });
    await newUser.save();
    return res.status(200).json({
      message: `${fullname} created successfully`,
      success: true,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Internal server error" }, { success: false });
  }
};

const login = async (req, res) => {
  try {
    const { emailOrPhone, password, role } = req.body;
    if (!emailOrPhone || !password) {
      return res
        .status(404)
        .json({ message: "All fields are required" }, { success: false });
    }

    const user = await User.findOne({
      $or: [
        { email: emailOrPhone },
        { phoneNumber: emailOrPhone },
        { email: emailOrPhone.toString().trim() },
        { phoneNumber: emailOrPhone.toString().trim() },
      ],
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "Incorrect account credentials" }, { success: false });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(404)
        .json({ message: "Incorrect account credentials" }, { success: false });
    }
    // Check role
    if (user.role !== role) {
      return res.status(404).json(
        {
          message: "You don't have the necessary role to access this resource",
        },
        { success: false }
      );
    }
    // Token
    const tokenData = {
      userId: user._id,
    };
    const token = await jwt.sign(tokenData, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const userResponse = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };

    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      })
      .json({
        message: `Welcome back ${userResponse.fullname}`,
        user: userResponse,
        success: true,
      });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Internal server error" }, { success: false });
  }
};

const logout = async (req, res) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      message: "Logged out successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Internal server error" }, { success: false });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, bio, skills } = req.body;
    const file = req.file;
    if (!fullname || !email || !phoneNumber || !bio || !skills) {
      return res
        .status(400)
        .json({ message: "All fields are required" }, { success: false });
    }
    const skillsArray = skills.split(",");
    const userId = req.id;
    let user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found" }, { success: false });
    }
    user.fullname = fullname;
    user.email = email;
    user.phoneNumber = phoneNumber;
    user.bio = bio;
    user.skills = skillsArray;
    await user.save();

    const userResponse = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };
    return res.status(200).json({
      message: "Profile updated successfully",
      user: userResponse,
      success: true,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Internal server error" }, { success: false });
  }
};

const getUser = async (req, res) => {};
const deleteUser = async (req, res) => {};
const getUsers = async (req, res) => {};
const getUserById = async (req, res) => {};
const getUserByEmail = async (req, res) => {};
const getUserByPhone = async (req, res) => {};

module.exports = {
  register,
  login,
  logout,
  updateProfile,
};
