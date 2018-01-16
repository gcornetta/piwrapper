var Scout = require ('zetta').Scout
var util = require ('util')

var device = require ('./device')

var deviceDiscover = module.exports = function (name, url, type, vendor, threshold, sampleTime, dutyCycle, jobs) {
  this.name = name || 'undefined'
  this.url = url || 'undefined'
  this.type = type || 'undefined'
  this.vendor = vendor || 'undefined'
  this.threshold = threshold || 'undefined'                                                                                                                        
  this.sampleTime = sampleTime || 'undefined'                                                                                                                     
  this.interval = parseInt(sampleTime * (100/dutyCycle)) || 'undefined'
  this.jobs = jobs || {}
  Scout.call (this)
}
util.inherits (deviceDiscover, Scout)

deviceDiscover.prototype.init = function (next) {
  var self = this 
 
  setTimeout (function (next) {
    self.discover (device, self.name, self.url, self.type, self.vendor, self.threshold, self.sampleTime, self.interval, self.jobs)
  }, 1000)
  next ()
}
