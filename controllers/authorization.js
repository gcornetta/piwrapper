var passport = require('passport');
var mongoose = require('mongoose');
var User = require('../models/user');

module.exports.login = function(req, res, next){
   passport.authenticate('local',  function(err, user, info){ //Pass name of strategy and a callback to authenticate method
   if (err) throw err;
   if(!user){
     req.session.error_msg = info.message;
     res.redirect('/login');	
   } else {
     req.login(user, function(err) {//you have to login manually otherwise authentication won't work
         if (err) return next(err);
         res.redirect('/dashboard');     
   }); 
  }                 
  })(req, res, next);//Make sure that req, res and next are available to Passport
}

module.exports.isLoggedIn = function (req, res, next){
	if(req.isAuthenticated()){
           return next();
	} else {
	   res.redirect('/login');
	}
}

 