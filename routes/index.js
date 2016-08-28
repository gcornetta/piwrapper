var express = require('express');

var router = express.Router();

var authCtrl = require('../controllers/authorization');
var usrCtrl = require('../controllers/user');
var dashCtrl = require('../controllers/dashboard');
var apiCtrl = require('../controllers/api');


var User = require('../models/user');


// Get Registration Page
router.get('/', usrCtrl.registration);
router.get('/terminal', function(req, res){
                       res.render('terminal')});

// Get Login Page
router.get('/login', usrCtrl.login);

// Get Dashboard Page if Authorized
router.get('/dashboard', authCtrl.isLoggedIn, dashCtrl.dashboard);
router.get('/dashboard/profile', authCtrl.isLoggedIn, dashCtrl.profile);
router.get('/dashboard/wizard', authCtrl.isLoggedIn, dashCtrl.wizard);
router.get('/dashboard/settings', authCtrl.isLoggedIn, dashCtrl.settings);
router.get('/dashboard/logs', authCtrl.isLoggedIn, dashCtrl.logs);

// Post User Registation Form
router.post('/', usrCtrl.registrationForm);

// Post User Login Form for Authentication
router.post('/login', authCtrl.login);

// Post User Password Request Form
router.post('/login/request/', usrCtrl.passwordRequest);

// Post File to upload
router.post('/dashboard/upload/', authCtrl.isLoggedIn, dashCtrl.upload);

// Post Machine configuration
router.post('/dashboard/configure/', authCtrl.isLoggedIn, dashCtrl.configure);
 
// Post Machine update
router.post('/dashboard/machine/update/', authCtrl.isLoggedIn, dashCtrl.machineUpdate);

// Post User update
//router.post('/dashboard/user/update', authCtrl.isLoggedIn, dashCtrl.userUpdate);

// Post Profile update
router.post('/dashboard/profile/change', authCtrl.isLoggedIn, dashCtrl.profileUpdate);

// Post Password change
router.post('/dashboard/password/change', authCtrl.isLoggedIn, dashCtrl.changePassword);


// Get User Logout
router.get('/logout', usrCtrl.logout);

//Test api function 
router.get('/jobs/:jobid', apiCtrl.queuedJobs);


module.exports = router;