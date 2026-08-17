const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const config = require("../Config/config");
const User = require("../Models/UserModel");

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    console.log(
      "TOKEN HASH RECEIVED:",
      crypto
        .createHash("sha256")
        .update(token || "")
        .digest("hex")
    );

    if (!token) {
      return res.status(401).json({
        message: "You must be logged in to place an order",
      });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);

    console.log("DECODED TOKEN:", decoded);

    // Change this according to your JWT payload
    const userId = decoded._id || decoded.id || decoded.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Invalid token: user ID missing",
      });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    // This is what your controller needs
    req.user = user;

    console.log("AUTHENTICATED USER:", req.user._id);

    next();
  } catch (error) {
    console.error("JWT ERROR:", error.message);

    return res.status(401).json({
      message:
        error.name === "TokenExpiredError"
          ? "Token expired"
          : "Invalid or expired token",
    });
  }
};

module.exports = verifyToken;