const express = require("express");
const cookies = require("cookie-parser");
const connectDB = require("../src/Config/lib");
const registerRoute = require("../src/Routes/authRoute");
const productRoute = require("../src/Routes/ProductRoute");
const messageAuth = require("./Routes/UserRoute")
const app = express();
const cors = require("cors");


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: "http://localhost:5173", // Replace with your frontend URL
  credentials: true, // Allow cookies to be sent
}));
app.use(cookies());

app.get("/", (req, res) => {
  res.send("API is running...");
});


app.use("/api/user" , messageAuth)

app.use("/api/auth", registerRoute);
app.use("/api/product", productRoute);





module.exports = app;
