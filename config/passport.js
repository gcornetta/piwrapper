var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var auth = require('./lib/messages');

var User = mongoose.model('User');
var authMsg = auth.authMessage;

passport.use(new LocalStrategy({
    passReqToCallback: true 
  },
  function(req, username, password, done) {
   User.getUserByUsername(username, function(err, user){
   	if(err) throw err;
	if(!user){
   		return done(null, false, {message:  authMsg.unknownUser});
   	}
   	User.comparePassword(user, password, function(err, isMatch){
   		if(err) throw err;
                
   		if(isMatch){
   			return done(null, user);
   		} else { 
                        //req.flash('error_msg', 'Invalid password'); 			
                        return done(null, false, {message: authMsg.invalidPassword});
   		}
   	});
   });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});
