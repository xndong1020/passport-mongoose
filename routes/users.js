const express = require("express");
const { body, check, validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const passport = require("passport");
const router = express.Router();

// GET: /users/login
router.get("/login", (req, res) => {
  res.render("login");
});

// POST: /users/login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true
  })(req, res, next);
});

// GET: /users/logout
router.get("/logout", (req, res) => {
  req.logout();
  req.flash('success_msg', "you are logged out");
  res.redirect("/users/login");
});

// GET: /users/register
router.get("/register", (req, res) => {
  res.render("register");
});

// POST: /users/register
router.post(
  "/register",
  [
    // email must be an email
    check("email")
      .isEmail()
      .withMessage("Please provide a valid email address"),
    // password must be at least 6 chars long
    check("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 chars long")
  ],
  async (req, res) => {
    const { name, email, password, password2 } = req.body;
    const checkResult = validationResult(req);
    let errors = [];
    checkResult.array().map(item => errors.push(item.msg));
    if (!checkResult.isEmpty()) {
      // client-side validation failed
      res.render("register", {
        errors,
        name,
        email,
        password,
        password2,
        error_msg: "",
        success_msg: ""
      });
    } else {
      // client-side validation passed
      try {
        const user = await User.findOne({ email });
        // if an user with the same email address already exists
        if (user) {
          res.render("register", {
            errors: ["User with the same email address already exists"],
            name,
            email,
            password,
            password2,
            error_msg: "",
            success_msg: ""
          });
        } else {
          const salt = await bcrypt.genSalt(10);
          const hash = await bcrypt.hash(password, salt);
          const newUser = { name, email, password: hash };
          const result = await User.create(newUser);
          req.flash("success_msg", "You are now registered and can login");
          res.redirect("/users/login");
        }
      } catch (error) {
        console.log(error);
        res.render("register", {
          errors: error,
          error_msg: "",
          success_msg: ""
        });
      }
    }
  }
);

module.exports = router;
