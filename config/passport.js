var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
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

var opts = {};
opts.secretOrKey = process.env.TOKENKEY || "wololo";
opts.jwtFromRequest = ExtractJwt.fromAuthHeader();

passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
  User.getUserById(jwt_payload.id, function(err, user) {
    if (err) {
      return done(err, false, {message: authMsg.invalidToken});
    }
    if (user) {
        if (jwt_payload.expDate > Date.now()){
            return done(null, user, null);
        }else{
            return done(null, false, {message: authMsg.expiredToken});
        }
    } else {
      return done(null, false, {message: authMsg.invalidToken});
    }
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
