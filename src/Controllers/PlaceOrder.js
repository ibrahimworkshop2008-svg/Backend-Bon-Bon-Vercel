const mongoose = require("mongoose");

const Order = require("../Models/OrderModel");
const Product = require("../Models/ProductModel");

const createOrder = async (req, res) => {
  try {
    console.log("================================");
    console.log("CREATE ORDER REQUEST");
    console.log("User:", req.user);
    console.log("Body:", req.body);
    console.log("================================");

    // =====================================================
    // 1. CHECK AUTHENTICATION
    // =====================================================

    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "You must be logged in to place an order.",
      });
    }

    // =====================================================
    // 2. GET DATA FROM REQUEST
    // =====================================================

    const {
      items,
      shippingAddress,
      paymentMethod,
    } = req.body;

    // =====================================================
    // 3. VALIDATE CART
    // =====================================================

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty.",
      });
    }

    // =====================================================
    // 4. VALIDATE SHIPPING ADDRESS
    // =====================================================

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required.",
      });
    }

    const {
      fullName,
      phone,
      address,
      city,
    } = shippingAddress;

    if (
      !fullName?.trim() ||
      !phone?.trim() ||
      !address?.trim() ||
      !city?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete shipping address is required.",
      });
    }

    // =====================================================
    // 5. VALIDATE PAYMENT METHOD
    // =====================================================

    const normalizedPaymentMethod = String(
      paymentMethod || "COD"
    ).toUpperCase();

    const allowedPaymentMethods = [
      "COD",
      "CARD",
    ];

    if (
      !allowedPaymentMethods.includes(
        normalizedPaymentMethod
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method.",
      });
    }

    // =====================================================
    // 6. CALCULATE ORDER
    // =====================================================

    let subtotal = 0;

    const orderItems = [];

    // =====================================================
    // 7. PROCESS EACH PRODUCT
    // =====================================================

    for (const item of items) {
      // -----------------------------------------------
      // Validate product ID
      // -----------------------------------------------

      if (!item?.product) {
        return res.status(400).json({
          success: false,
          message: "Product ID is required.",
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          item.product
        )
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid product ID: ${item.product}`,
        });
      }

      // -----------------------------------------------
      // Find product in database
      // -----------------------------------------------

      const product = await Product.findById(
        item.product
      );

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`,
        });
      }

      // -----------------------------------------------
      // Validate quantity
      // -----------------------------------------------

      const quantity = Number(item.quantity);

      if (
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for ${product.name}`,
        });
      }

      // -----------------------------------------------
      // Calculate price from DATABASE
      // -----------------------------------------------

      const price = Number(product.price);

      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid price for ${product.name}`,
        });
      }

      const itemTotal = price * quantity;

      subtotal += itemTotal;

      // -----------------------------------------------
      // Product image
      // -----------------------------------------------

      const productImage =
        product.images?.[0]?.url ||
        product.imageUrl ||
        product.image ||
        "";

      // -----------------------------------------------
      // Add order item
      // -----------------------------------------------

      orderItems.push({
        product: product._id,
        name: product.name,
        image: productImage,
        price,
        quantity,
      });
    }

    // =====================================================
    // 8. DELIVERY FEE
    // =====================================================

    // Free delivery for orders >= Rs 3000
    // Otherwise Rs 200

    const deliveryFee =
      subtotal >= 3000 ? 0 : 200;

    // =====================================================
    // 9. FINAL TOTAL
    // =====================================================

    const totalAmount =
      subtotal + deliveryFee;

    // =====================================================
    // 10. CREATE ORDER
    // =====================================================

    const order = await Order.create({
      // Authenticated user
      user: req.user._id,

      // Products
      items: orderItems,

      // Shipping
      shippingAddress: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
      },

      // Payment
      paymentMethod:
        normalizedPaymentMethod,

      paymentStatus: "pending",

      // Order status
      orderStatus: "pending",

      // Amounts calculated by backend
      subtotal,

      deliveryFee,

      totalAmount,
    });

    // =====================================================
    // 11. SUCCESS RESPONSE
    // =====================================================

    console.log("================================");
    console.log("ORDER CREATED SUCCESSFULLY");
    console.log("Order ID:", order._id);
    console.log("User ID:", req.user._id);
    console.log("Subtotal:", subtotal);
    console.log("Delivery:", deliveryFee);
    console.log("Total:", totalAmount);
    console.log("================================");

    return res.status(201).json({
      success: true,

      message: "Order placed successfully.",

      order,
    });
  } catch (error) {
    // =====================================================
    // ERROR
    // =====================================================

    console.error("================================");
    console.error("PLACE ORDER ERROR");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    console.error("================================");

    return res.status(500).json({
      success: false,

      message: "Failed to place order.",

      // Helpful while developing
      error: error.message,
    });
  }
};


const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
   getAllOrders
};