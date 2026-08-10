require("dotenv").config();

if (!process.env.MONGO_URI) {
  console.error(`⚠️ Missing env vars: MONGO_URI`);
}
if (!process.env.PORT) {
  console.error(`⚠️ Missing env vars: PORT`);
}

if (!process.env.USER_PASS) {
  console.error(`⚠️ Missing env vars: USER_PASS`);
}

if (!process.env.SECRET_PASS) {
  console.error(`⚠️ Missing env vars: SECRET_PASS`);
}

if (!process.env.USER_EMAIL) {
  console.error(`⚠️ Missing env vars: USER_EMAIL`);
}

if( !process.env.JWT_SECRET) {
  console.error(`⚠️ Missing env vars: JWT_SECRET`);
}

if( !process.env.ImageKit_Key) {
  console.error(`⚠️ Missing env vars: ImageKit_Key`);
}

const config = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce",
  USER_PASS: process.env.USER_PASS || "",
  SECRET_PASS: process.env.SECRET_PASS || "",
  USER_EMAIL: process.env.USER_EMAIL || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  ImageKit_Key: process.env.ImageKit_Key || "",
};

module.exports = config;
