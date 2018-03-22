const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const flash = require('connect-flash');
const session = require('express-session');
const mongoStore = require('connect-mongo');
const expressLayouts = require('express-ejs-layouts');

const passport = require('passport');
const passportConfig = require('./passport');
const db = require('./db');
const auth = require('../routes/auth');
const polls = require('../routes/polls');
passportConfig(passport);
const MongoConnect = mongoStore(session);

module.exports = app => {

  // uncomment after placing your favicon in /public
  //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, '../public')));
  app.use(helmet());
  app.use(expressLayouts);
  // express session middleware
  app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    store: new MongoConnect({
      mongooseConnection: db,
    })
  }));

  //passport middleware
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());

  app.use('/', auth);
  app.use('/polls', polls);

  // view engine setup
  app.set('views', path.join(__dirname, '../views'));
  app.set('view engine', 'ejs');

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handler
  app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });
}