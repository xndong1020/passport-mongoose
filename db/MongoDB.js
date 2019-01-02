const mongoose = require("mongoose");
require("dotenv").config(); // to read value of process.env.MongoURI

mongoose
  .connect(
    process.env.MongoURI,
    { useNewUrlParser: true }
  )
  .then(() => console.log("Mongodb connected"))
  .catch(err => console.log(err));

module.exports = mongoose;
