const express = require("express");

const router = express.Router();

const {
  createOrder,
  getAllOrders,
   updateOrderStatus
} = require("../Controllers/PlaceOrder");

const protect = require("../middlewares/AdminMiddleware");
const VerifyToken = require("../middlewares/verifyToken")

router.post("/orderplace", VerifyToken , createOrder);
router.get("/getOrders", VerifyToken, getAllOrders)
router.get("/getOrdersAdmin", VerifyToken,protect, getAllOrders)
router.patch(
  "/:orderId/status",
  VerifyToken,
  protect,
  updateOrderStatus
);

module.exports = router;