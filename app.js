const express = require('express');
const socialAuth = require('./config/socialAuth');
require('./config/db');
const middlewareSetup = require('./config/middleware');

const app = express();
middlewareSetup(app);

const port = process.env.PORT || 5000;
app.listen(port, err => {
  if (err)
    throw err;

  console.log(`Listening on port ${port}`)
});