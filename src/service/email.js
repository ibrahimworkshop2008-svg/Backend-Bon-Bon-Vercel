const config  = require("../Config/config");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user: config.USER_PASS,
    pass: config.SECRET_PASS,
  },
});



   try {
   transporter.verify();
  console.log("Server is ready to take our messages");
} catch (err) {
  console.error("Verification failed:", err);
}






const sendEmail = async (email, subject, text, html) => {
  try {
      const info = await transporter.sendMail({
    from: `Ibrahim Team <${config.USER_EMAIL}>`, // sender address
    to: email, // list of recipients
    subject: subject, // subject line
    text: text, // plain text body
    html: html, // HTML body
  });
  console.log(info);
  }catch(error){
   console.log(error);
    throw error; 
  }
}


module.exports = sendEmail;
