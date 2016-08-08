var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');

passport.use(new LocalStrategy({
    passReqToCallback: true 
  },
  function(req, username, password, done) {
   User.getUserByUsername(username, function(err, user){
   	if(err) throw err;
   	if(!user){
   		return done(null, false, {message: 'Unknown User'});
   	}
        
   	User.comparePassword(user, password, function(err, isMatch){
   		if(err) throw err;
                
   		if(isMatch){
   			return done(null, user);
   		} else { 
                        //req.flash('error_msg', 'Invalid password'); 			
                        return done(null, false, {message: 'Invalid password'});
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
