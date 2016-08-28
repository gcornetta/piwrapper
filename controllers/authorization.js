var passport = require('passport');
var mongoose = require('mongoose');
var infoMsg = require('./lib/messages');
var winston = require('winston');
var User = require('../models/user');

var authMsg = infoMsg.authorizationMsg;

module.exports.login = function(req, res, next){
   passport.authenticate('local',  function(err, user, info){ //Pass name of strategy and a callback to authenticate method
   if (err) throw err;
   if(!user){
     //"Missing credentials" message is generated by the middleware
     //we have to capture it in order to translate it with the i18n package
     if (info.message == 'Missing credentials') {
        req.session.error_msg = authMsg.missingCredentials;
     } else {
        req.session.error_msg = info.message;
     }
     res.redirect('/login');	
   } else {
     req.login(user, function(err) {//you have to login manually otherwise authentication won't work
         if (err) return next(err);
         winston.log('info', '@authorization.login: %s successfully logged in', user.username); 
         res.redirect('/dashboard');     
   }); 
  }                 
  })(req, res, next);//Make sure that req, res and next are available to Passport
}

module.exports.isLoggedIn = function (req, res, next){
	if(req.isAuthenticated()){
           return next();
	} else {
           winston.info('@authorization.isLoggedIn: access attempt without authorization'); 
	   res.redirect('/login');
	}
}

 