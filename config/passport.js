const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const User = require('../models/user');
const configAuth = require('./socialAuth');


module.exports = passport => {
  //========================================================================
  // passport session setup ==================================================
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });

  //========================================================================
  // LOCAL SIGNUP 
  //========================================================================
  // we are using named strategies since we have one for login and one for signup by default, if there was no name, it would just be called 'local'

  passport.use('local-signup', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // alows us to pass back the entire request to the callback
  },
    (req, email, password, done) => {

      // async
      // User.findOne wont fire unless data is sent back
      process.nextTick(() => {

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.email': email }, (err, user) => {
          // if there are any errors, return the error
          if (err)
            return done(err);

          // check to see if theres already a user with that email
          if (user) {
            return done(null, false, req.flash('signupMessage', 'That email is already taken.'));

          } else {
            // if there is no user with that email
            // create the user
            const newUser = new User();

            // set user's local credentials
            newUser.local.email = email;
            newUser.local.password = newUser.generateHash(password);

            // save the user
            newUser.save(err => {
              if (err)
                throw err;
              return done(null, newUser);
            })
          }
        })
      });
    }
  ));
  // =========================================================================
  // LOCAL LOGIN =============================================================
  // =========================================================================
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

  passport.use('local-login', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email.
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback.
  },
    (req, email, password, done) => { // callback with email and password from our form
      // find a user whose email is the same as the forms email
      // we are checking to see if the user trying to login already exists
      User.findOne({ 'local.email': email }, (err, user) => {
        // If there are any errors, return the error before anything else
        if (err)
          return done(err);

        // if no user is found, return the message
        if (!user)
          return done(null, false, req.flash('loginMessage', 'No user found.'));

        // if the user is found but password is wrong
        if (!user.validPassword(password))
          return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

        // all is well, return successful user
        return done(null, user);
      });
    }));

  passport.use(new FacebookStrategy(configAuth.facebookAuth,
    // facebook will send back the token and profile
    (req, token, refreshToken, profile, done) => {

      //async
      process.nextTick(() => {

        // find the user in the database based on their facebook id
        User.findOne({ 'facebook.id': profile.id }, (err, user) => {
          if (err)
            return done(err);
          // if user is found, log them in
          if (user) {
            return done(null, user);

          } else {
            // if no user found with fb id, create one
            const newUser = new User();

            newUser.facebook.id = profile.id;
            newUser.facebook.token = token;
            newUser.facebook.name = `${profile.name.givenName} ${profile.name.familyName}`;
            newUser.facebook.email = profile.emails[0].value;

            // save our user to the database
            newUser.save(err => {
              if (err)
                throw err;
              return done(null, newUser);
            });
          }
        });
      });
    }));

  passport.use(new TwitterStrategy(configAuth.twitterAuth,
    (req, token, tokenSecret, profile, done) => {

      process.nextTick(() => {

        User.findOne({ 'twitter.id': profile.id }, (err, user) => {
          if (err)
            return done(err);

          if (user) {
            return done(null, user);

          } else { // create user
            const newUser = new User();

            newUser.twitter.id = profile.id;
            newUser.twitter.token = token;
            newUser.twitter.username = profile.username;
            newUser.twitter.displayName = profile.displayName;

            newUser.save(err => {
              if (err)
                throw err;

              return done(null, newUser);
            });
          }
        });
      });
    }));

  passport.use(new GoogleStrategy(configAuth.googleAuth,
    (req, token, refreshToken, profile, done) => {

      process.nextTick(() => {
        User.findOne({ 'google.id': profile.id }, (err, user) => {
          if (err)
            return done(err);

          if (user) {
            return done(null, user);

          } else {
            const newUser = new User();

            newUser.google.id = profile.id;
            newUser.google.token = token;
            newUser.google.name = profile.displayName;
            newUser.google.email = profile.emails[0].value;

            newUser.save(err => {
              if (err)
                throw err;
              return done(null, newUser);
            });
          }
        });
      });
    }));
};