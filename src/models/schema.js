require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const employeeSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  gender: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  confirmpassword: {
    type: String,
    required: true,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

//generating tokens
employeeSchema.methods.generateAuthToken = async function () {
  try {
    const token = jwt.sign(
      { _id: this._id.toString() },
      process.env.SECRET_KEY
    );
    this.tokens = this.tokens.concat({ token: token }); // to set token field with the above token
    await this.save();
    return token;
  } catch (e) {
    res.send("the error is", e);
  }
};

//Hashing user password
//Mongoose provides powerful middleware (also called hooks) that allow us to execute certain logic before or after
// specific operations (like saving or updating a document).

employeeSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10); //password hashed in db
    this.confirmpassword = undefined;
  }
  next(); // Passes control to the next middleware
});

//creating a collection
const Register = new mongoose.model("Register", employeeSchema);
module.exports = Register;
