var express = require('express');
var router = express.Router();

var authCtrl = require('../controllers/authorization');
var usrCtrl = require('../controllers/user');

var User = require('../models/user');


// Get Registration Page
router.get('/', usrCtrl.registration);

// Get Login Page
router.get('/login', usrCtrl.login);

// Get Dashboard Page if Authorized
router.get('/dashboard', authCtrl.isLoggedIn, usrCtrl.dashboard);

// Post User Registation Form
router.post('/', usrCtrl.registrationForm);

// Post User Login Form for Authentication
router.post('/login', authCtrl.login);

// Post User Password Request Form
router.post('/login/request/', usrCtrl.passwordRequest);
 
// Get User Logout
router.get('/logout', usrCtrl.logout);

module.exports = router;