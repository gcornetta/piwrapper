var express = require('express')

var router = express.Router()

var authCtrl = require('../controllers/authorization')
var usrCtrl = require('../controllers/user')
var dashCtrl = require('../controllers/dashboard')
var epilogCtrl = require('../controllers/epilog-laser')
var gccCtrl = require('../controllers/gcc-laser')
var trotecCtrl = require('../controllers/trotec-laser')
var rolandVinylCtrl = require('../controllers/roland-vinyl')
var rolandMillingCtrl = require('../controllers/roland-milling')
var prusaCtrl = require('../controllers/prusa-3dprint')
var apiCtrl = require('../controllers/api')
var jobsCtrl = require('../controllers/jobs-table')

// Get Registration Page
router.get('/', usrCtrl.registration)
router.get('/terminal', function (req, res) {
  res.render('terminal')
})

// Get Login Page
router.get('/login', usrCtrl.login)

// Get Dashboard Page if Authorized
router.get('/dashboard', authCtrl.isLoggedIn, dashCtrl.dashboard)
router.get('/dashboard/profile', authCtrl.isLoggedIn, dashCtrl.profile)
router.get('/dashboard/wizard', authCtrl.isLoggedIn, dashCtrl.wizard)
router.get('/dashboard/settings', authCtrl.isLoggedIn, dashCtrl.settings)
router.get('/dashboard/settings/discovered-printers', authCtrl.isLoggedIn, dashCtrl.discoveredPrinters)
router.get('/dashboard/logs', authCtrl.isLoggedIn, dashCtrl.logs)
router.get('/dashboard/jobs', authCtrl.isLoggedIn, jobsCtrl.controller)
router.get('/dashboard/monitor', authCtrl.isLoggedIn, dashCtrl.siren)

router.get('/dashboard/control/laser/epilog', authCtrl.isLoggedIn, epilogCtrl.controller)
router.get('/dashboard/control/laser/trotec', authCtrl.isLoggedIn, trotecCtrl.controller)
router.get('/dashboard/control/laser/gcc', authCtrl.isLoggedIn, gccCtrl.controller)
router.get('/dashboard/control/vinyl/roland', authCtrl.isLoggedIn, rolandVinylCtrl.controller)
router.get('/dashboard/control/milling/roland', authCtrl.isLoggedIn, rolandMillingCtrl.controller)
router.get('/dashboard/control/3dprint/prusa', authCtrl.isLoggedIn, prusaCtrl.controller)

router.get('/dashboard/control/laser/epilog/process', authCtrl.isLoggedIn, epilogCtrl.process)
router.get('/dashboard/control/laser/trotec/process', authCtrl.isLoggedIn, trotecCtrl.process)
router.get('/dashboard/control/laser/gcc/process', authCtrl.isLoggedIn, gccCtrl.process)
router.get('/dashboard/control/vinyl/roland/material', authCtrl.isLoggedIn, rolandVinylCtrl.process)
router.get('/dashboard/control/milling/roland/process', authCtrl.isLoggedIn, rolandMillingCtrl.process)

// Post User Registation Form
router.post('/', usrCtrl.registrationForm)

// Post User Login Form for Authentication
router.post('/login', authCtrl.login)

// Post User Password Request Form
router.post('/login/request/', usrCtrl.passwordRequest)

// Post File to upload
router.post('/dashboard/upload/', authCtrl.isLoggedIn, dashCtrl.upload)

// Post Machine configuration
router.post('/dashboard/configure/', authCtrl.isLoggedIn, dashCtrl.configure)

// Post Machine update
router.post('/dashboard/machine/update/', authCtrl.isLoggedIn, dashCtrl.machineUpdate)

// Post User update
// router.post('/dashboard/user/update', authCtrl.isLoggedIn, dashCtrl.userUpdate);

// Post Profile update
router.post('/dashboard/profile/change', authCtrl.isLoggedIn, dashCtrl.profileUpdate)

// Post fabrication job settings
router.post('/dashboard/control/laser/epilog', authCtrl.isLoggedIn, epilogCtrl.upload)
router.post('/dashboard/control/laser/trotec', authCtrl.isLoggedIn, trotecCtrl.upload)
router.post('/dashboard/control/laser/gcc', authCtrl.isLoggedIn, gccCtrl.upload)
router.post('/dashboard/control/vinyl/roland', authCtrl.isLoggedIn, rolandVinylCtrl.upload)
router.post('/dashboard/control/milling/roland', authCtrl.isLoggedIn, rolandMillingCtrl.upload)
router.post('/dashboard/control/3dprint/prusa', authCtrl.isLoggedIn, prusaCtrl.upload)

// Post Password change
router.post('/dashboard/password/change', authCtrl.isLoggedIn, dashCtrl.changePassword)

// Get User Logout
router.get('/logout', usrCtrl.logout)

// Test api function
router.get('/jobs/:jobid', apiCtrl.queuedJobs)

module.exports = router
