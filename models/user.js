var mongoose = require('mongoose')
var crypto = require('crypto')

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
    index: true
  },
  email: {
    type: String
  },
  pathtophoto: {
    type: String,
    'default': null
  },
  lastlogged: {
    type: Date
  },
  issuperuser: Boolean,
  hash: String,
  salt: String
})

var User = module.exports = mongoose.model('User', UserSchema)

module.exports.createUser = function (newUser, password, callback) {
  newUser.salt = crypto.randomBytes(16).toString('hex')
  newUser.hash = crypto.pbkdf2Sync(password, newUser.salt, 1000, 64).toString('hex')
  newUser.save(callback)
}

module.exports.updateUserById = function (id, newProfile, callback) {
  var query = {_id: id}
  User.findOneAndUpdate(query, newProfile, {new: true}, function (err, user) {
    if (err) throw err
    if (!user) {
      callback(false, null) // eslint-disable-line
    } else {
      callback(true, user) // eslint-disable-line
    }
  })
}

module.exports.updatePassword = function (username, newPassword, callback) {
  var query = {username: username}
  User.findOne(query, function (err, user) {
    if (err) throw (err)
    user.salt = crypto.randomBytes(16).toString('hex')
    user.hash = crypto.pbkdf2Sync(newPassword, user.salt, 1000, 64).toString('hex')
    user.save(callback(null, true))
  })
}
module.exports.getUserByUsername = function (username, callback) {
  var query = {username: username}
  User.findOne(query, callback)
}

module.exports.getPhotoPathByUsername = function (username, callback) {
  var query = {username: username}
  User.findOne(query, function (err, user) {
    if (err) throw (err)
    if (user.pathtophoto) {
      callback(null, user.pathtophoto)
    } else {
      callback(true, null) // eslint-disable-line
    }
  })
}

module.exports.getLastLogByUsername = function (username, callback) {
  var query = {username: username}
  User.findOne(query, function (err, user) {
    if (err) throw (err)
    if (user.lastlogged) {
      callback(null, user.lastlogged)
    } else {
      callback(true, null) // eslint-disable-line
    }
  })
}

module.exports.updatePhotoPathByUsername = function (username, path, callback) {
  var query = {username: username}
  User.findOne(query, function (err, user) {
    if (err) throw (err)
    user.pathtophoto = path
    user.save(callback(null, true))
  })
}

module.exports.updateLastLogByUsername = function (username, callback) {
  var query = {username: username}
  User.findOne(query, function (err, user) {
    if (err) throw (err)
    user.lastlogged = new Date()
    user.save(callback(null, true))
  })
}

module.exports.getUserById = function (id, callback) {
  User.findById(id, callback)
}

module.exports.checkIfSuperuserExists = function (callback) {
  var query = {'issuperuser': true}
  User.findOne(query, callback)
}

module.exports.comparePassword = function (newUser, password, callback) {
  var hash = crypto.pbkdf2Sync(password, newUser.salt, 1000, 64).toString('hex')
  if (newUser.hash === hash) { callback(null, true) } else { callback(null, false) }
}
