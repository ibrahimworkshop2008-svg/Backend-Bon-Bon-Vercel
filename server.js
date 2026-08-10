const app = require("./src/app");
const config = require("./src/Config/config");

const connetDB = require("./src/Config/lib");
connetDB();
// app.listen(process.env.PORT || 5000, async () => {

//   console.log(`✅ Server is running on port ${process.env.PORT || 5000}`);
// })

module.exports = app;
