var Device = require('zetta').Device
var util = require ('util')

var SAMPLE_TIME = 1000 // ms
var CURRENT_THRESHOLD = 1000 // mA

var connDevice = module.exports = function (name, type, vendor) {
  Device.call(this)
  this.name = name || 'undefined'
  this.type = type || 'undefined'
  this.vendor = vendor || 'undefined'
  this.avgCurrent = 0
  this.state = 'undefined'
}
util.inherits (connDevice, Device)

connDevice.prototype.init = function (config) {
  config
    .name (this.name)
    .type (this.type)
    .state ('undefined')
    .monitor ('avgCurrent')
    .monitor ('state')

    var self = this

    var startTime = 0
    var samples = []

    function reset () {
      startTime = new Date ().getTime ()
      //self.avgCurrent = 0
      samples = []
    }
    
    reset ()
    self = this

    setInterval (function () {
      //put function to read sensor data here
      //once the function is implemented remove the following 3 lines
        var min = 500
        var max = 2000 
        var sample = Math.floor(Math.random() * (max - min + 1)) + min
        samples.push (sample)
          if (new Date ().getTime () - startTime > SAMPLE_TIME) {
            self.avgCurrent = samples.reduce ((a, b) => a + b, 0) /samples.length
            if (self.avgCurrent > CURRENT_THRESHOLD) {
              self.state = 'busy'
            } else if (self.avgCurrent > 0 && self.avgCurrent < CURRENT_THRESHOLD) {
              self.state = 'idle'
            } else if (self.avgCurrent === 0) {
              self.state = 'off'
            } else
              self.state = 'undefined'
            reset ()
          }    
    }, 60000)
}
