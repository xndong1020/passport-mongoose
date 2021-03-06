const mongoose = require("mongoose");
const { emailValidator } = require("./validators");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: [true, "User email required"],
    validate: {
      validator: emailValidator,
      message: props => `${props.value} is not a valid email address!`
    }
  },
  password: {
    type: String,
    min: [6, "Password should be at lease 6 digits long"],
    required: true
  },
  data: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
