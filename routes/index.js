const express = require("express");
const { ensureAuthenticated } = require("../auth/auth");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/dashboard", [ensureAuthenticated], (req, res) => {
  res.render("dashboard", { user: req.user });
});

module.exports = router;
