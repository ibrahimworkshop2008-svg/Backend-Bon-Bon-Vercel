const config = require("../Config/config");
const ImageKit = require("@imagekit/nodejs");

const client = new ImageKit({
  privateKey: config.ImageKit_Key, // This is the default and can be omitted
});


module.exports =  client;