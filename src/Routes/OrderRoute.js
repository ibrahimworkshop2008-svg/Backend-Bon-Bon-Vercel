const express = require("express");

const router = express.Router();

const {
  createOrder,
} = require("../Controllers/PlaceOrder");

const protect = require("../middlewares/AdminMiddleware");
const VerifyToken = require("../middlewares/verifyToken")

router.post("/orderplace", VerifyToken, protect, createOrder);

module.exports = router;