const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PollSchema = new Schema({
  createdBy: String,
  question: String,
  answers: [{answer: String, votes: Number}],
});

module.exports = mongoose.model('Poll', PollSchema);
