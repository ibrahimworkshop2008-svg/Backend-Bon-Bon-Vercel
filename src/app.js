const express = require("express");
const cookies = require("cookie-parser");
const registerRoute = require("../src/Routes/authRoute");
const productRoute = require("../src/Routes/ProductRoute");
const messageAuth = require("./Routes/UserRoute")
const app = express();
const cors = require("cors");
const config = require("../src/Config/config")
const mongoose = require("mongoose")
const orderPlace = require("./Routes/OrderRoute")

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: "https://frontend-bon-bon-vercel-giv1.vercel.app", // Replace with your frontend URL
  credentials: true, // Allow cookies to be sent
}));
app.use(cookies());

app.get("/", (req, res) => {
  res.send("API is running...");
});

let isConnected = false

async function connectedToMongodb() {
   try {
    const conn = await mongoose.connect(config.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    isConnected = true
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // process.exit(1) yahan se hata diya hai — serverless (Vercel) mein
    // process.exit() call karna poore function invocation ko crash kar deta hai.
    // Error sirf log ho raha hai taake function zinda rahe aur agli request
    // pe dobara connect try ho sake.
  }
}

app.use((req, res , next) => {
  if(!isConnected) {
     connectedToMongodb()
  } 
  next()
})

app.use("/api/user" , messageAuth)
orderPlace.use("/api/order", orderPlace)
app.use("/api/auth", registerRoute);
app.use("/api/product", productRoute);





module.exports = app;
