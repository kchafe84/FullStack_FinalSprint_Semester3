/*

Kyle Snow, Ken Chafe, Tyler Power, Kayleigh McGrath
Final Sprint - JS FullStack
Keyin Collage
April 6 2023 - April 16 2023
*/

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Setting up npm packages.

const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const uuid = require("uuid");
const app = express();
const PORT = process.env.PORT || 3000;

// Using epress.static to make css style sheet work across all views.

const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

// Getting functions from postgres_logins

const logins = require("./services/postgres_logins.dal");

// global variable for debugging

global.DEBUG = true;

// Using passport to verify logins from database.

passport.use(
  new localStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      let user = await logins.getLoginByEmail(email);
      if (user == null) {
        if (DEBUG) console.log("No records of email: " + email);
        return done(null, false, { message: "No user with that email." });
      }
      try {
        if (await bcrypt.compare(password, user.password)) {
          return done(null, user);
        } else {
          if (DEBUG) console.log("Incorrect password");
          return done(null, false, {
            message: "Incorrect password was entered.",
          });
        }
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Function to serialize user.

passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Fuction to deserialize user.

passport.deserializeUser(async (id, done) => {
  let user = await logins.getLoginById(id);
  if (DEBUG) console.log("passport.deserializeUser: " + user);
  console.log(
    "User id: " +
      user._id +
      ", username: " +
      user.username +
      ", email: " +
      user.email +
      ", uuid: [" +
      user.uuid +
      "]"
  );
  done(null, user);
});

// Setting up routes.

app.get("/", checkAuthenticated, (req, res) => {
  res.render("home.ejs", {
    name: req.user.username,
    email: req.user.email,
    id: req.user._id,
  });
});

// Making a router for search pages.

const searchesRouter = require("./routes/search");
app.use("/search", checkAuthenticated, searchesRouter);

// Making a router for user history.

const userHistoryRouter = require("./routes/userHistory");
app.use("/userHistory", checkAuthenticated, userHistoryRouter);

// Making a router for account information.

const accountRouter = require("./routes/account");
app.use("/account", checkAuthenticated, accountRouter);

// Making a route for logging in.

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs", { message: req.flash("message") });
});

// Used to verify login.

app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

// Making a route for registering a user.

app.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register.ejs", { message: req.flash("message") });
});

// Used to verify and register a user.

app.post("/register", checkNotAuthenticated, async (req, res) => {
  let user = await logins.getLoginByEmail(req.body.email);
  if (user != null) {
    if (DEBUG) console.log("email is already being used: " + req.body.email);
    req.flash("message", "Sorry, this email is already in use.");
    res.redirect("/register");
  } else {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      let result = await logins.addLogin(
        req.body.name,
        req.body.email,
        hashedPassword,
        uuid.v4()
      );
      if (DEBUG) console.log("User successfully registered: " + req.body.email);
      req.flash("message", "Account Successfully created, please login !");
      res.redirect("/login");
    } catch (error) {
      console.log(error);
      res.redirect("/register");
    }
  }
});

app.delete("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

// Checks if a user is logged in or not, if not then redirects them to login page.

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

// Checks if a user is logged in or not, if so then redirects them to the home page.

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  return next();
}

// This code runs when the app runs on port 3000.

app.listen(PORT, (err) => {
  if (err) console.log(err);
  console.log(`The app running on port ${PORT}.`);
  console.log(`Press Ctrl C to terminate...`);
  console.log("");
});
