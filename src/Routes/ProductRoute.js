const express = require("express");
const router = express.Router();
const { createProduct,findALLProducts, findProductById, deleteProductById, updateProductById  } = require("../Controllers/controller.product");
const upload = require("../middlewares/multer");
const AdminMiddleware = require("../middlewares/AdminMiddleware");
const verifyToken = require("../middlewares/verifyToken");


router.post("/create", verifyToken, AdminMiddleware, upload.array("images", 5), createProduct);
router.get("/all", verifyToken, findALLProducts);
router.get("/find/:id", verifyToken, findProductById);
router.delete("/delete/:id", verifyToken, AdminMiddleware, deleteProductById);
router.put("/update/:id", verifyToken, AdminMiddleware, upload.array("images", 5), updateProductById);

module.exports = router;