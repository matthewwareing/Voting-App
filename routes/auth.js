const express = require('express');
const passport = require('passport');
const passportConfig = require('../config/passport');
const isLoggedIn = require('../helpers/verified');

passportConfig(passport);
const router = express.Router();

// HOME PAGE (with login links) ========
router.get('/', (req, res) => {
  res.render('index.ejs');
});

// LOGIN ===============================
// show the login form

router.get('/login', (req, res) => {
  res.render('login.ejs', { message: req.flash('loginMessage') });
});

// process the login form
router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true
}));


// LOGOUT ==============================
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) next(err);
    res.redirect('/');
  });
});

// SIGNUP ==============================
// show the signup form
router.get('/signup', (req, res) => {
  res.render('signup.ejs', { message: req.flash('signupMessage') });
});

// process the signup form
router.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/profile',
  failureRedirect: '/signup',
  failureFlash: true
}));


// PROFILE SECTION =====================
// we will want this protected so you have to be logged in to visit
// we will use route middleware to verify this (the isLoggedIn function)

router.get('/profile', isLoggedIn, (req, res) => {
  res.render('profile.ejs', {
    user: req.user // get the use out of session and pass to template
  })
});

// FACEBOOK ROUTES =====================
// route for facebook authentication and login

router.get('/auth/facebook', passport.authenticate('facebook', {
  scope: ['email']
}));

router.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/profile',
  failureRedirect: '/'
}));


// TWITTER ROUTES =====================
// route for twitter authentication and login

router.get('/auth/twitter', passport.authenticate('twitter'));

router.get('/auth/twitter/callback', passport.authenticate('twitter', {
  successRedirect: '/profile',
  failureRedirect: '/'
}));


// GOOGLE ROUTES =====================
// route for google authentication and login
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', {
  successRedirect: '/profile',
  failureRedirect: '/'
}));

module.exports = router;