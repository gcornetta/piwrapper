var express = require('express')
var router = express.Router()
var mongoose = require('mongoose')
var User = mongoose.model('User')
var jwt = require('jsonwebtoken')
var passport = require('passport')

var jobsCtrl = require('../controllers/jobs')

router.get('/jobs', passport.authenticate('jwt', { session: false }), jobsCtrl.getQueuedJobs)
router.post('/jobs', passport.authenticate('jwt', { session: false }), jobsCtrl.addNewJob)
router.get('/jobs/:jobid', passport.authenticate('jwt', { session: false }), jobsCtrl.jobsReadOne)
router.put('/jobs/:jobid', passport.authenticate('jwt', { session: false }), jobsCtrl.jobsUpdateOne)
router.delete('/jobs/:jobid', passport.authenticate('jwt', { session: false }), jobsCtrl.jobsDeleteOne)
router.post('/machine', passport.authenticate('jwt', { session: false }), jobsCtrl.setMachine)
router.get('/machine', passport.authenticate('jwt', { session: false }), jobsCtrl.getMachine)

var secretOrKey = process.env.TOKENKEY || 'wololo'

router.post('/login', function (req, res) {
  if (req.body.name && req.body.password) {
    var name = req.body.name
    var password = req.body.password
  }
  User.getUserByUsername(name, function (err, user) {
    if (err || !user) {
      res.status(401).json({message: 'no such user.'})
    } else {
      User.comparePassword(user, password, function (err, isMatch) {
        if (err) throw err

        if (isMatch) {
          var payload = {id: user._id, expDate: Date.now() + 86400000}  // ExpDate += 1Day
          var token = jwt.sign(payload, secretOrKey)
          res.json({message: 'ok', token: token})
        } else {
          res.status(401).json({message: 'passwords did not match'})
        }
      })
    }
  })
})

module.exports = router
