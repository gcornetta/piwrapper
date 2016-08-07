var mongoose = require('mongoose');
var crypto = require('crypto');

// User Schema
var UserSchema = new mongoose.Schema({
	firstname: {
		type: String
	},
	lastname: {
		type: String
	},
	username: {
		type: String,
		index:true
	},
	email: {
		type: String
	},
        issuperuser  : Boolean,
        hash         : String,
        salt         : String
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function(newUser, password, callback){
        newUser.salt = crypto.randomBytes(16).toString('hex');
	newUser.hash = crypto.pbkdf2Sync(password, newUser.salt, 1000, 64).toString('hex');
        newUser.save(callback);
}

module.exports.updatePassword = function(username, newPassword, callback){
        var query = {username: username};
        User.findOne (query, function(err, user){
          console.log(user);
          if (err) throw(err);
          user.salt = crypto.randomBytes(16).toString('hex');
	  user.hash = crypto.pbkdf2Sync(newPassword, user.salt, 1000, 64).toString('hex');
          user.save(callback(null, true));
        });
}
module.exports.getUserByUsername = function(username, callback){
	var query = {username: username};
	User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}

module.exports.checkIfSuperuserExists = function(callback){
	var query = {'issuperuser': true};
	User.findOne(query, callback);
}

module.exports.comparePassword = function(newUser, password, callback){
	var hash = crypto.pbkdf2Sync(password, newUser.salt, 1000, 64).toString('hex');
	if (newUser.hash === hash)
	    callback(null, true);
        else
            callback(null, false);
}