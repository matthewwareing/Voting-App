const mongoose = require('mongoose');
const dotenv = require('dotenv').config();

mongoose.Promise = global.Promise;

try {
  mongoose.connect(process.env.MLAB_URI)
} catch (err) {
  mongoose.createConnection(process.env.MLAB_URI)
}

const db = mongoose.connection;

db.once('open', () => {
  console.log('MongoDB is connected');
})
  .on('error', (err) => {
    console.log(`Error while connecting to ${err.message}`);
  });

module.exports = db;