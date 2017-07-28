'use strict';

var express = require('express');
var router = express.Router();
var Question = require('./models').Question;

router.param("qID", (req, res, next, id) => {
  Question.findById(id, (err, doc) => {
    if (err) return next(err);
    if (!doc) {
      err = new Error("Not Found");
      err.status = 404;
      return next(err);
    };
    req.question = doc;
    return next();
  });
});

router.param("aID", function(req, res, next, id) {
  req.answer = req.question.answers.id(id);
  if (!req.answer) {
    err = new Error("Not Found");
    err.status = 404;
    return next(err);
  }
  next();
});

router.get("/", function(req, res, next) {
  Question.find({})
              .sort({createdAt: -1})
              .exec((err, questions) => {
                  if (err) return next(err);
                  res.json(questions);
              });
});

// Route for creating questions
router.post('/', (req, res, next) => {
  // Return all the questions
  let question = new Question(req.body);
  question.save((err, question) => {
    if (err) return next(err);
    res.status(201);
    res.json(question);
  });
});

// GET /questions/:id
router.get('/:qID', (req, res) => {
  res.json(req.question);
});


// Route POST /questions/:id/answers
router.post('/:qID/answers', (req, res, next) => {
  // Return all the questions
  req.question.answers.push(req.body);
  req.question.save(function(err, question) {
    if (err) return next(err);
    res.status(201);
    res.json(question);
  });
});


// PUT /questions/:qID/answers
router.put("/:qID/answers/:aID", function(req, res){
	req.answer.update(req.body, function(err, result){
		if(err) return next(err);
		res.json(result);
	});
});

// DELETE
router.delete('/:qID/answers/:aID', (req, res, next) => {
  // Return all the questions
  req.answer.remove(function(err) {
    req.question.save(function(err, question) {
      if (err) return next(err);
      res.json(question);
    });
  });
});

// POST vote-up/vote-down
router.post("/:qID/answers/:aID/vote-:dir", 
	function(req, res, next){
		if(req.params.dir.search(/^(up|down)$/) === -1) {
			var err = new Error("Not Found");
			err.status = 404;
			next(err);
		} else {
			req.vote = req.params.dir;
			next();
		}
	}, 
	function(req, res, next){
		req.answer.vote(req.vote, function(err, question){
			if(err) return next(err);
			res.json(question);
		});
});

module.exports = router;