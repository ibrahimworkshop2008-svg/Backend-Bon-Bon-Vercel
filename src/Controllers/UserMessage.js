const UserMessage = require("../Models/UserContact");

const createUserMessage = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validate fields
    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Create message
    const newMessage = await UserMessage.create({
      name,
      email,
      phone,
      message,
    });

    return res.status(201).json({
      success: true,
      message: "Your message has been sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("Create User Message Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while sending your message",
      error: error.message,
    });
  }
};

module.exports = {
  createUserMessage,
};