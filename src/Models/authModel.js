const mongoose = require('mongoose');
const authSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

     refreshTokenHash: {
  type: String,
  default: null,
  select: false, // by default query mein na aaye
},
  },
  {
    timestamps: true,
  }
);



const Auth = mongoose.model('Auth', authSchema);
module.exports = Auth;