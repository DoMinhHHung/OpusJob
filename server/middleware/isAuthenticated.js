const jwt = require("jsonwebtoken");

const authenticateToken = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }
    if (!token) {
      return res
        .status(401)
        .json({ message: "No token provided" }, { success: false });
    }
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res
        .status(401)
        .json({ message: "Invalid token" }, { success: false });
    }
    req.id = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" }, { success: false });
  }
};

module.exports = authenticateToken;
