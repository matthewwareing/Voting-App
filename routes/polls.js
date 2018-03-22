const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const isLoggedIn = require('../helpers/verified');

require('../models/poll');
const Poll = mongoose.model('Poll');

// Poll index page
router.get('/', isLoggedIn, (req, res, next) => {
  Poll.find().exec((err, polls) => res.render('polls/index', { polls: polls }));
});

// Add poll
router.get('/add', isLoggedIn, (req, res) => {
  res.render('polls/add');
});

// Process poll data
router.post('/', isLoggedIn, (req, res) => {

  let errors = [];
  let answerArray = [];

  if (!req.body.question) {
    errors.push({ text: 'Please add a question!' })
  }
  if (!(req.body.opt1 && req.body.opt2)) {
    errors.push({ text: 'Please add at least two poll options!' })
  }
  if (errors.length > 0) {
    res.render('polls/add', {
      error: errors,
      question: req.body.question,
      details: req.body.option
    });
  }

  req.body.option.forEach(option => answerArray.push({ answer: option, votes: 0 }));

  const newPoll = new Poll();
  newPoll.createdBy = req.user._id;
  newPoll.question = req.body.question;
  newPoll.answers = answerArray;

  newPoll.save(err => {
    if (err) {
      throw err;
    } else {
      res.redirect(`/polls/${newPoll.id}`);
    }
  });
});

// router.get('/:id', (req, res) => {
//   Poll.findById(id, ())
// })
module.exports = router;