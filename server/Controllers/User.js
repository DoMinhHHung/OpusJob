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
      token: token,
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
    return res
      .status(200)
      .cookie("token", "", { maxAge: 0 })
      .json({
        message: `${user.fullname} logged out successfully`,
        success: true,
      });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Internal server error" }, { success: false });
  }
};

// const updateProfile = async (req, res) => {
//   try {
//     const { fullname, email, phoneNumber, bio, skills } = req.body;
//     const file = req.file;
//     if (!fullname || !email || !phoneNumber || !bio || !skills) {
//       return res
//         .status(400)
//         .json({ message: "All fields are required" }, { success: false });
//     }

//     //cloudnary
//     let skillArray;
//     if (skills) {
//       const skillsArray = skills.split(",");
//     }

//     const userId = req.id;
//     let user = await User.findById(userId);
//     if (!user) {
//       return res
//         .status(404)
//         .json({ message: "User not found" }, { success: false });
//     }

//     // Update database profile
//     if (fullname) {
//       user.fullname = fullname;
//     }
//     if (email) {
//       user.email = email;
//     }
//     if (phoneNumber) {
//       user.phoneNumber = phoneNumber;
//     }
//     if (bio) {
//       user.profile.bio = bio;
//     }
//     if (skills) {
//       user.profile.skills = skillsArray;
//     }

//     await user.save();

//     user.fullname = fullname;
//     user.email = email;
//     user.phoneNumber = phoneNumber;
//     user.bio = bio;
//     user.skills = skillsArray;
//     await user.save();

//     const userResponse = {
//       _id: user._id,
//       fullname: user.fullname,
//       email: user.email,
//       phoneNumber: user.phoneNumber,
//       role: user.role,
//       profile: user.profile,
//     };
//     return res.status(200).json({
//       message: "Profile updated successfully",
//       user: userResponse,
//       success: true,
//     });
//   } catch (error) {
//     console.log(error);
//     res
//       .status(500)
//       .json({ message: "Internal server error" }, { success: false });
//   }
// };

const validator = require("validator");
const cloudinary = require("cloudinary").v2;

const updateProfile = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, bio, skills } = req.body;
    const file = req.file;
    const userId = req.id;

    if (!fullname || !email || !phoneNumber || !bio || !skills) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }

    // Kiểm tra định dạng email
    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ message: "Invalid email format", success: false });
    }
    const skillsArray = skills
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);

    let user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    if (user._id.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized", success: false });
    }

    if (!user.profile) {
      user.profile = {};
    }

    let profilePictureUrl;
    if (file) {
      const result = await cloudinary.uploader.upload(file.path);
      profilePictureUrl = result.secure_url;
      user.profile.profilePicture = profilePictureUrl;
    }

    // Cập nhật thông tin
    user.fullname = fullname;
    user.email = email;
    user.phoneNumber = phoneNumber;
    user.profile.bio = bio;
    user.profile.skills = skillsArray;

    await user.save();

    // Tạo response
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
    console.error("Error updating profile:", error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Email already exists", success: false });
    }
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

module.exports = {
  register,
  login,
  logout,
  updateProfile,
};
