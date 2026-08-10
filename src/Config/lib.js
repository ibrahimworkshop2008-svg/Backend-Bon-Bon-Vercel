const config = require('./config');
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // process.exit(1) yahan se hata diya hai — serverless (Vercel) mein
    // process.exit() call karna poore function invocation ko crash kar deta hai.
    // Error sirf log ho raha hai taake function zinda rahe aur agli request
    // pe dobara connect try ho sake.
  }
};

module.exports = connectDB;