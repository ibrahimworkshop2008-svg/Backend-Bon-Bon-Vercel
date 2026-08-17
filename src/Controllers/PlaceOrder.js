const Order = require("../Models/OrderModel");
const Product = require("../Models/ProductModel");

const createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "Your cart is empty",
      });
    }

    if (
      !shippingAddress?.fullName ||
      !shippingAddress?.phone ||
      !shippingAddress?.address ||
      !shippingAddress?.city
    ) {
      return res.status(400).json({
        message: "Complete shipping address is required",
      });
    }

    let subtotal = 0;

    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          message: `Product not found: ${item.product}`,
        });
      }

      const quantity = Number(item.quantity);

      if (!quantity || quantity < 1) {
        return res.status(400).json({
          message: "Invalid product quantity",
        });
      }

      const itemTotal = product.price * quantity;

      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity,
      });
    }

    const deliveryFee = subtotal >= 3000 ? 0 : 200;

    const totalAmount = subtotal + deliveryFee;

    const order = await Order.create({
      user: req.user._id,

      items: orderItems,

      shippingAddress,

      paymentMethod: paymentMethod || "COD",

      paymentStatus: "pending",

      orderStatus: "pending",

      subtotal,

      deliveryFee,

      totalAmount,
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("================================");
  console.error("PLACE ORDER ERROR");
  console.error("Message:", error.message);
  console.error("Stack:", error.stack);
  console.error("================================");

  return res.status(500).json({
    success: false,
    message: "Failed to place order",
    error: error.message,
  });
  }
};

module.exports = {
  createOrder,
};