const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const config = require("../Config/config");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  console.log("TOKEN HASH RECEIVED:",
    crypto
      .createHash("sha256")
      .update(token || "")
      .digest("hex")
  );

  console.log(
    "VERIFY SECRET HASH:",
    crypto
      .createHash("sha256")
      .update(config.JWT_SECRET)
      .digest("hex")
  );

  if (!token) {
    return res.status(401).json({
      message: "No token provided"
    });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);

    console.log("DECODED:", decoded);

    req.user = decoded;
    next();

  } catch (error) {
    console.error("JWT ERROR:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

module.exports = verifyToken;