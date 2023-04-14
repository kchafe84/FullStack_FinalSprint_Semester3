/*

Kyle Snow, Ken Chafe, Tyler Power, Kayleigh McGrath
Final Sprint - JS FullStack
Keyin Collage
April 6 2023 - April 16 2023
*/

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

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

const logins = require("./services/postgres_logins.dal");

global.DEBUG = true;

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

passport.serializeUser((user, done) => {
  done(null, user._id);
});

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

//------------------------------------------------------------------------------

// routes

app.get("/", checkAuthenticated, (req, res) => {
  res.render("home.ejs", {
    name: req.user.username,
    email: req.user.email,
    id: req.user._id,
  });
});

const searchesRouter = require("./routes/search");
app.use("/search", checkAuthenticated, searchesRouter);

const userHistoryRouter = require("./routes/userHistory");
app.use("/userHistory", checkAuthenticated, userHistoryRouter);

const accountRouter = require("./routes/account");
app.use("/account", checkAuthenticated, accountRouter);

//-----------------------------------------------------------------------------

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs");
});

app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register.ejs", { message: req.flash("message") });
});

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

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  return next();
}

app.listen(PORT, (err) => {
  if (err) console.log(err);
  console.log(`The app running on port ${PORT}.`);
  console.log(`Press Ctrl C to terminate...`);
  console.log("");
});

//-------------------------------------------------------------------------------
