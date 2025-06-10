const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

export const register = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, password, role } = req.body;
    if (!fullname || !email || !phoneNumber || !password || !role) {
      return res
        .status(400)
        .json({ message: "All fields are required" }, { success: false });
    }
    const user = await UserActivation.findOne({ email, phoneNumber });
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

// SignIn
// Can use email or phoneNumber to login
let user = await userModel.findOne({
  $or: [
    { email: emailOrPhone },
    { phone: emailOrPhone },
    { email: emailOrPhone.toString().trim() },
    { phone: emailOrPhone.toString().trim() },
  ],
});
export const login = async (req, res) => {
  try {
    const { emailOrPhone, password, role } = req.body;
    if (!emailOrPhone || !password) {
      return res
        .status(404)
        .json({ message: "All fields are required" }, { success: false });
    }
    const user = await User.findOne({ emailOrPhone });
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

    user = {
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
        message: `Welcome back ${user.fullname}`,
        user,
        success: true,
      });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Internal server error" }, { success: false });
  }
};
export const logout = async (req, res) => {
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

// Update Profile
export const updateProfile = async (req, res) => {
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

    user = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };
    return res.status(200).json({
      message: "Profile updated successfully",
      user,
      success: true,
    });
  } catch (error) {}
};

export const getUser = async (req, res) => {};
export const deleteUser = async (req, res) => {};
export const getUsers = async (req, res) => {};
export const getUserById = async (req, res) => {};
export const getUserByEmail = async (req, res) => {};
export const getUserByPhone = async (req, res) => {};
