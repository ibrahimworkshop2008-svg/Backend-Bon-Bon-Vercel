const UserMessage = require("../Models/UserContact");
const { Resend } = require("resend");
const config = require("../Config/config")
const resend = new Resend(config.RESEND_API_KEY);



const createUserMessage = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      message,
    } = req.body;

    // ==============================
    // VALIDATION
    // ==============================

    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // ==============================
    // SAVE TO MONGODB
    // ==============================

    const userMessage = await UserMessage.create({
      name,
      email,
      phone,
      message,
    });

    // ==============================
    // SEND EMAIL
    // ==============================

    const { data, error } = await resend.emails.send({
      from: "Website Contact <onboarding@resend.dev>",

      to: [process.env.USER_EMAIL],

      replyTo: email,

      subject: `New Contact Message from ${name}`,

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 20px;
        ">

          <h2 style="color: #087fd3;">
            New Contact Form Message
          </h2>

          <hr />

          <p>
            <strong>Name:</strong>
            ${name}
          </p>

          <p>
            <strong>Email:</strong>
            ${email}
          </p>

          <p>
            <strong>Phone:</strong>
            ${phone}
          </p>

          <p>
            <strong>Message:</strong>
          </p>

          <div style="
            background: #f4f4f4;
            padding: 15px;
            border-radius: 8px;
          ">
            ${message}
          </div>

          <br />

          <p style="color: #777;">
            This message was submitted from your website contact form.
          </p>

        </div>
      `,
    });

    // ==============================
    // CHECK RESEND ERROR
    // ==============================

    if (error) {
      console.error("Resend Error:", error);

      return res.status(500).json({
        success: false,
        message: "Message saved, but email could not be sent",
      });
    }

    console.log("EMAIL SENT:", data);

    // ==============================
    // SUCCESS RESPONSE
    // ==============================

    return res.status(201).json({
      success: true,
      message: "Your message has been sent successfully!",
      data: userMessage,
    });

  } catch (error) {

    console.error(
      "Create User Message Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

module.exports = {
   createUserMessage
}

