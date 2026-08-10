const User = require("../Models/authModel");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const config = require("../Config/config");
const { GenerateOTP, sendOTPEmail } = require("../Utils/utilsOTP");
const OTPModel = require("../Models/OTPModel");
const sendEmail = require("../service/email");
const register = async (req, res) => {
    try {

        const {name, email, password} = req.body;

       const existingUser = await User.findOne({
      $or: [{ name }, { email }],
    });

    if(existingUser) {
        return res.status(400).json({message: "User already exists"});
    }

    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");


    const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
    });


    const otp = GenerateOTP();
    const html = sendOTPEmail(otp);

    console.log("Generated OTP:", otp); // Log the generated OTP for debugging
    const  hashOtp = crypto.createHash("sha256").update(otp).digest("hex");


    await OTPModel.create({
        email,
      user: newUser._id,
      otpHash: hashOtp,
    });

       try {
      await sendEmail(email, "OTP Verified", `Your OTP code is ${otp}`, html);
    } catch (emailErr) {
      console.log(
        emailErr.message,
      );
    }

    res.status(201).json({message: "User registered successfully. Please check your email for the OTP."});

    } catch(error) {
        console.error(error);
        res.status(500).json({message: "Internal server error"});
    }



}

const  verifyOTP = async (req, res) => {
   const {email, otp} = req.body;

   const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

   const otpRecord = await OTPModel.findOne(
    { $or: [{ email }, { otpHash }] }
  );



    

    if(!otpRecord) {
        return res.status(400).json({message: "Invalid OTP"});
    }

    const user = await User.findOne({ email: otpRecord.email });


    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.isVerified = true;
    await user.save();

    await OTPModel.deleteOne({
      _id: otpRecord._id,
    });

    





 

    res.status(200).json({message: "OTP verified successfully", user});

}

const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Hash the entered password
    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    // 2. Find user using email only
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // 3. Check email verification
    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email before logging in"
      });
    }

    // 4. Compare hashed password
    const isMatch = hashedPassword === user.password;

    console.log("Is Match:", isMatch);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // 5. Create refresh token
    const refreshToken = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      config.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    // 6. Hash refresh token before saving
    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    user.refreshTokenHash = refreshTokenHash;

    await user.save();

    // 7. Store refresh token in HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    console.log(
      "LOGIN SECRET HASH:",
      crypto
        .createHash("sha256")
        .update(config.JWT_SECRET)
        .digest("hex")
    );
    // 8. Create access token
    const accessToken = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      config.JWT_SECRET,
      {
        expiresIn: "20s"
      }
    );

    console.log(
  "GENERATED TOKEN HASH:",
  crypto
    .createHash("sha256")
    .update(accessToken)
    .digest("hex")
);

    console.log(
  "LOGIN SECRET:",
  config.JWT_SECRET ? "SECRET EXISTS" : "NO SECRET"
);

    // 9. Send response
    return res.status(200).json({
      success: true,
      message: "Login Successful",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.isVerified
      }
    });

  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};


const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const refreshTokenHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

      // DB se us user ka refreshTokenHash saaf kar dein jiska ye hash match kare
      await User.findOneAndUpdate(
        { refreshTokenHash },
        { refreshTokenHash: null },
      );
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log("LOGOUT ERROR:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided." });
    }

    // Step 1: JWT verify karein (signature + expiry check)
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, config.JWT_SECRET);
    } catch (err) {
      return res
        .status(403)
        .json({ message: "Invalid or expired refresh token." });
    }

    // Step 2: DB mein us user ka saved hash nikal kar match karein
    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const user = await User.findById(decoded.id).select("+refreshTokenHash");

    if (!user || user.refreshTokenHash !== refreshTokenHash) {
      return res
        .status(403)
        .json({ message: "Refresh token revoked. Please login again." });
    }

    // Step 3: Sab theek — naya access token bana kar bhej dein
    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role },
      config.JWT_SECRET,
      { expiresIn: "15m" },
    );

    return res.status(200).json({
      message: "Access token refreshed",
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.log("REFRESH TOKEN ERROR:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};



module.exports = {register, verifyOTP, Login, logout, refreshAccessToken };