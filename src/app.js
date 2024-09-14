require('dotenv').config();
const express = require("express");
const path = require("path");
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Register = require("./models/schema");
const app = express();
require("./db/conn");

const port = process.env.PORT || 3000;
const staticPath = path.join(__dirname, "../public");
const templatePath = path.join(__dirname, "../templates/views");
const partialsPath = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(express.urlencoded({ extended: false })); //to see form data
app.use(express.static(staticPath));``

app.set("view engine", "hbs");
app.set("views", templatePath);
hbs.registerPartials(partialsPath);

app.get("/", (req, res) => {
  res.render("index");
});
app.get("/register", (req, res) => {
  res.render("register");
});
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/register", async (req, res) => {
  try {
    const password = req.body.password;
    const cpassword = req.body.confirmpassword;
    if (password === cpassword) {
      const registerEmployee = new Register({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        gender: req.body.gender,
        phone: req.body.phone,
        password: password,
        confirmpassword: cpassword,
      });
      //password hash or token generation-middleware
      const token = await registerEmployee.generateAuthToken();

      const registered = await registerEmployee.save();
      res.status(201).render("index");
    } else {
      res.send("unmatched passwords");
    }
  } catch (e) {
    res.status(400).send(e);
  }
});

app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const mailId = await Register.findOne({ email: email }); // to look for the entered email id in database
    const isMatch = await bcrypt.compare(password, mailId.password); //to compare hashed and user password while logging in
    const token = await mailId.generateAuthToken();
    console.log("token after logging in: " + token);
    if (isMatch) {
      res.status(201).render("index");
    } else {
      res.send("Incorrect password");
    }
    // res.send(mailId);
  } catch (e) {
    res.status(400).send("Invalid login details");
  }
});

app.listen(port, () => {
  console.log(`server is running at port number ${port}`);
});
