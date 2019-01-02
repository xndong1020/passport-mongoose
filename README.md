### Step 01: install packages

```
npm i express bcryptjs passport passport-local ejs express-ejs-layouts mongoose connect-flash express-session dotenv
```

### Step 02: Setup a basic express, listening on port 5000

```
const express = require('express')
require('dotenv').config()

const app = express()

const PORT = process.env.PORT || 5000

app.listen( PORT, () => {
    console.log(`server is running on port ${PORT}`);
});
```

### Step 03: Setup a user router and a index router

`routes/users.js`

```
const express = require("express")
const router = express.Router()

router.get('/', (req, res) => {
    res.send('users')
})

module.exports = router
```

`app.js`

```
const express = require('express')
require('dotenv').config()

const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')

const app = express()

const PORT = process.env.PORT || 5000

app.use('/', indexRouter)
app.use('/users', usersRouter)

app.listen( PORT, () => {
    console.log(`server is running on port ${PORT}`);
});
```

### Step 04: Bring in ejs

```
var path = require("path");
const expressLayouts = require("express-ejs-layouts");

<other code>
// ejs
app.use(expressLayouts); // must be above app.set('view engine', 'ejs')
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
<other code>
```

### Step 05: Create views folder, add in ejs views

### Step 06. Use layout

`views/layout.ejs`

Put this line in between <body> tags

```
<div class="container"><%- body %></div>
```

Then the html from other views will be placed here

### Step 07. Update user router to render ejs

```
const express = require("express");
const router = express.Router();

router.get("/login", (req, res) => {
  res.render("login", { error: "", error_msg: "", success_msg: "" });
});

router.get("/register", (req, res) => {
  res.render("register", { error: "", error_msg: "", success_msg: "" });
});

module.exports = router;

```

### Step 08. Bring in mongoose

```
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

```

### Step 09. Create User model

```
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

```
`models/validators/index.js`
```
const emailValidator = value => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(value);
};

module.exports = {
  emailValidator
};

```

### Step 10. Add body parser (now it is part of Express)

`app.js`

```
// body parser
app.use(express.json()); // for json request like Postman or api calls
app.use(express.urlencoded({ extended: false })); // for html form submission
```

### Step 11. Add client side validation

Install express validation middleware express-validator
`npm i express-validator`

To use express-validator

```
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
      .withMessage("Password must be at least 6 chars long"),
    check("password")
      .equals(body.password2)
      .withMessage("Password does not match")
  ],
  (req, res) => {
    try {
      const checkResult = validationResult(req);
      let errors = [];
      checkResult.array().map(item => errors.push(item.msg));
      if (!checkResult.isEmpty()) {
        res.render("register", {
          error,
          error_msg: "",
          success_msg: ""
        });
      }
```

Documentation of [express-validator](https://express-validator.github.io/docs/)

### Step 12. We need to hash password before creating user

```
 const salt = await bcrypt.genSalt(10);
 const hash = await bcrypt.hash(password, salt);
 const newUser = { name, email, password: hash };
```

### Step 13. Create user

```
 const newUser = { name, email, password: hash };
 const result = await User.create(newUser);
```

### Step 14. In order to display flash message, we need session

Setup session and flash in express
The flash is a special area of the session used for storing messages. Messages are written to the flash and cleared after being displayed to the user. The flash is typically used in combination with redirects, ensuring that the message is available to the next page that is to be rendered.

```
const flash = require("connect-flash");
const session = require("express-session");

<other code>
// express session
app.use(
  session({
    secret: "my secret", // for cookie parser
    resave: false, // Forces the session to be saved back to the session store, even if the session was never modified during the request.
    saveUninitialized: true // Forces a session that is "uninitialized" to be saved to the store. A session is uninitialized when it is new but not modified.
  })
);

// connect flash
app.use(flash());

// create a custom middleware for adding global variables for flash msg
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});
<other code>
```

use it in `routes/users.js`

```
req.flash('success_msg', 'You are now registered and can login');
```

then display it in message.ejs

```
<% if(success_msg != ''){ %>
  <div class="alert alert-success alert-dismissible fade show" role="alert">
    <%= success_msg %>
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>
  </div>
<% } %>

<% if(error_msg != ''){ %>
  <div class="alert alert-danger alert-dismissible fade show" role="alert">
    <%= error_msg %>
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>
  </div>
<% } %>
```

### Step 15. Login using passport.js

Firstly we need to config a passport.js file
`auth/passport.js`

```
const LocalStrategy = require("passport-local");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

module.exports = passport => {
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email });
          if (!user)
            return done(null, false, { message: "That email does not exists" });

          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch)
            return done(null, false, { message: "Incorrect password!" });

          return done(null, user);
        } catch (e) {
          return done(null, false, { message: e });
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
};

```

Then we need to initialize the passport in `app.js`

```
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
```

Then we can create a login handler in `routes/users.js`

```
// POST: /users/login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true
  })(req, res, next);
});
```

### Step 15. Now we can login, but anonymous user can visit all pages. we need to create a custom middleware to protect certain routes

Once you login via passport.js, passport will provide isAuthenticated() method is request
`auth/auth.js`

```
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error_msg", "Please log in to view that resource");
  res.redirect("/users/login");
};

module.exports = {
  ensureAuthenticated
};
```

for any protected routes we put ensureAuthenticated as the second args.
req.user is added by passport

```
router.get("/dashboard", [ensureAuthenticated], (req, res) => {
  res.render("dashboard", { user: req.user });
});
```

### Step 16. Add a logout function
logout() function is provided by passport, if you login via passport
```
// GET: /users/logout
router.get("/logout", (req, res) => {
  req.logout();
  req.flash('success_msg', "you are logged out");
  res.redirect("/users/login");
});
```
