var Scout = require ('zetta').Scout
var util = require ('util')

var device = require ('./device')

var deviceDiscover = module.exports = function (name, type) {
  this.name = name || 'undefined'
  this.type = type || 'undefined'
  Scout.call (this)
}
util.inherits (deviceDiscover, Scout)

deviceDiscover.prototype.init = function (next) {
  var self = this 
 
  setTimeout (function (next) {
    self.discover (device, self.name, self.type)
  }, 1000)
  next ()
}
