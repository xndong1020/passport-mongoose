const express = require("express");
const path = require("path");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const expressLayouts = require("express-ejs-layouts");

// db
require("./db/MongoDB");
// passport
require("./auth/passport")(passport);
require("dotenv").config();

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");

const app = express();

// body parser
app.use(express.json()); // for json submission like Postman
app.use(express.urlencoded({ extended: false })); // for html form submission

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// connect flash
app.use(flash());

// put after session
// create a custom middleware for adding global variables for flash msg
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error"); // for passport error
  next();
});

// put after session
// passport middleware
app.use(passport.initialize());
app.use(passport.session());


// ejs
app.use(expressLayouts); // must be above app.set('view engine', 'ejs')
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const PORT = process.env.PORT || 5000;

app.use("/", indexRouter);
app.use("/users", usersRouter);

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
