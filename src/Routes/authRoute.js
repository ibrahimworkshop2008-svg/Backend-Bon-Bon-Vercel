const express = require("express");
const router = express.Router();
const userAuth = require("../Models/authModel");


const { register,verifyOTP, Login, logout , refreshAccessToken } = require("../Controllers/controller.auth");

router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/login", Login);
router.post("/logout", logout);
router.post("/refresh-token", refreshAccessToken);





module.exports = router;
