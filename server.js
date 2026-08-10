const app = require("./src/app");
const config = require("./src/Config/config");

const connetDB = require("./src/Config/lib");

const config = require("./src/Config/config")


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


module.exports = connectDB;
// app.listen(process.env.PORT || 5000, async () => {

//   console.log(`✅ Server is running on port ${process.env.PORT || 5000}`);
// })

module.exports = app;
