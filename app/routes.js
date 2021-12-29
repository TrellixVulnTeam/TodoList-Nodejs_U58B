const User = require("./models/user");
var bcrypt = require("bcrypt-nodejs");
module.exports = function (app, passport) {
  // HOME PAGE (with login links) ========
  app.get("/", function (req, res) {
    res.render("index.ejs"); // load the index.ejs file
  });

  // show the login form
  app.get("/login", function (req, res) {
    if (req.isAuthenticated()) {
      res.redirect("/dashboard");
    } else {
      // render the page and pass in any flash data if it exists
      res.render("login.ejs", { message: req.flash("loginMessage") });
    }
  });

  // process the login form
  // app.post('/login', do all our passport stuff here);
  app.post(
    "/login",
    passport.authenticate("local-login", {
      successRedirect: "/profile", // redirect to the secure profile section
      failureRedirect: "/login", // redirect back to the signup page if there is an error
      failureFlash: true, // allow flash messages
    })
  );

  // show the signup form
  app.get("/signup", function (req, res) {
    if (req.isAuthenticated()) {
      res.redirect("/dashboard");
    } else {
      // render the page and pass in any flash data if it exists
      res.render("signup.ejs", { message: req.flash("signupMessage") });
    }
  });

  // process the signup form
  // app.post('/signup', do all our passport stuff here);
  app.post(
    "/signup",
    passport.authenticate("local-signup", {
      successRedirect: "/", // redirect to the secure profile section
      failureRedirect: "/signup", // redirect back to the signup page if there is an error
      failureFlash: true, // allow flash messages
    })
  );

  // PROFILE SECTION =====================
  // we will want this protected so you have to be logged in to visit
  // we will use route middleware to verify this (the isLoggedIn function)
  app.get("/profile", isLoggedIn, function (req, res) {
    res.render("profile.ejs", {
      user: req.user, // get the user out of session and pass to template
    });
  });

  app.put("/profile/edit/", isLoggedIn, function (req, res) {
    User.findOneAndUpdate(
      { _id: req.user._id },
      {
        $set: { 
          local:{
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
          }
        },
      },
      { new: true },
      function (err, doc) {
        if (err) {
          console.log("Something wrong when updating data!");
        }
        res.redirect("/profile");
      }
    );
  });

  // LOGOUT ==============================
  app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
  });
  // get all tasks
  app.get("/dashboard", isLoggedIn, function (req, res) {
    res.render("dashboard.ejs", {
      user: req.user, // get the user out of session and pass to template
      tasks: req.user.tasks,
    });
  });
  // add task
  app.post("/dashboard", isLoggedIn, function (req, res, next) {
    User.findById(req.user._id, function (err, user) {
      if (err) {
        return next(err);
      }
      user.tasks.push({
        tasks: req.body.task,
        completed: false,
      });
      user.save(function (err, user) {
        if (err) {
          return next(err);
        }
        res.redirect("/dashboard");
      });
    });
  });
  // delete task
  app.delete("/dashboard/delete/:_id", isLoggedIn, function (req, res) {
    User.findByIdAndUpdate(
      req.user._id,
      { $pull: { tasks: { _id: req.params._id } } },
      function (err, user) {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/dashboard");
        }
      }
    );
  });
  // set task to completed
  app.put("/dashboard/complete/:_id", isLoggedIn, function (req, res) {
    User.findByIdAndUpdate(
      req.user._id,
      { $set: { "tasks.$[elem].completed": true } },
      { arrayFilters: [{ "elem._id": req.params._id }] },
      function (err, user) {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/dashboard");
        }
      }
    );
  });
  // set task to not completed
  // app.put("/dashboard/uncomplete/:_id", isLoggedIn, function (req, res) {
  //   User.findByIdAndUpdate(
  //     req.user._id,
  //     { $set: { "tasks.$[elem].completed": false } },
  //     { arrayFilters: [{ "elem._id": req.params._id }] },
  //     function (err, user) {
  //       if (err) {
  //         console.log(err);
  //       } else {
  //         res.redirect("/dashboard");
  //       }
  //     }
  //   );
  // });
  // delete all tasks
  app.delete("/dashboard/deleteAll", isLoggedIn, function (req, res) {
    User.findByIdAndUpdate(
      req.user._id,
      { $set: { tasks: [] } },
      function (err, user) {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/dashboard");
        }
      }
    );
  });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated()) return next();

  // if they aren't redirect them to the home page
  res.redirect("/");
}
