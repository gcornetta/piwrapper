var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');
var jwt = require('jsonwebtoken');
var passport = require('passport');

var jobsCtrl = require('../controllers/jobs');

router.get('/jobs', passport.authenticate('jwt', { session: false }), jobsCtrl.getQueuedJobs);
router.post('/jobs', passport.authenticate('jwt', { session: false }), jobsCtrl.addNewJob);
router.get('/jobs/:jobid', passport.authenticate('jwt', { session: false }), jobsCtrl.jobsReadOne);
router.put('/jobs/:jobid', passport.authenticate('jwt', { session: false }), jobsCtrl.jobsUpdateOne);
router.put('/jobs/file/:jobid', passport.authenticate('jwt', { session: false }), jobsCtrl.addJobFile);
router.delete('/jobs/:jobid', passport.authenticate('jwt', { session: false }), jobsCtrl.jobsDeleteOne);
router.post('/jobs/machine', passport.authenticate('jwt', { session: false }), jobsCtrl.setMachine);

secretOrKey = process.env.TOKENKEY || "wololo";

router.post("/login", function(req, res) {
  if(req.body.name && req.body.password){
    var name = req.body.name;
    var password = req.body.password;
  }
  User.getUserByUsername(name, function(err, user){
    if( ! user ){
      res.status(401).json({message:"no such user found"});
    }else{
        User.comparePassword(user, password, function(err, isMatch){
            if(err) throw err;

            if(isMatch){
                var payload = {id: user._id, expDate: Date.now()+86400000};  //ExpDate += 1Day
                var token = jwt.sign(payload, secretOrKey);
                res.json({message: "ok", token: "JWT "+token});
            } else {
                res.status(401).json({message:"passwords did not match"});
            }
        });
    }
  });
});

module.exports = router
