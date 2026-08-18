const express = require("express");

const router = express.Router();

const {
  createOrder,
  getAllOrders
} = require("../Controllers/PlaceOrder");

const protect = require("../middlewares/AdminMiddleware");
const VerifyToken = require("../middlewares/verifyToken")

router.post("/orderplace", VerifyToken , createOrder);
router.get("/getOrders", VerifyToken, getAllOrders)

module.exports = router;