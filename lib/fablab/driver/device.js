var Device = require('zetta').Device
var util = require('util')
var logger = require('../../../config/winston')
var ADS1x15 = require ('../ads1x15/ADS1x15')
var ADS1115 = 0x01
var adc = new ADS1x15(ic = ADS1115, address = 0x48)

var connDevice = module.exports = function (name, url, type, vendor, threshold, sampleTime, interval) {
  Device.call(this)
  this.name = name || 'undefined'
  this.url = url || 'undefined'
  this.type = type || 'undefined'
  this.vendor = vendor || 'undefined'
  this.avgCurrent = 0
  this.state = 'undefined'
  this.threshold = threshold || 'undefined'
  this.sampleTime = sampleTime || 'undefined'
  this.interval = interval  || 'undefined'
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
       let sampleRates =  [860, 475, 250, 128, 64, 32, 16, 8]
       let sps = 8

       for ( let i = 0; i < sampleRates.length; i++) {
          if (Math.ceil(1000/self.sampleTime) > sampleRates[i]) {
            sps = sampleRates[i]
            break 
          }
        }
        if (!adc.busy) {
          adc.readADCSingleEnded(0, 2048, 250, function (err, sample) {
            /*var min = 500
             var max = 2000 
             var sample = Math.floor(Math.random() * (max - min + 1)) + min */
            if (err) {
              logger.error(`@device: ADC error ${err}.`)
            } else if (sample) {
              sample = Math.floor(((sample - 1650)/120 *2000)*1000)/1000 //convert voltage into current
              samples.push (sample)
              if (new Date ().getTime () - startTime > self.sampleTime) {
                self.avgCurrent = samples.reduce ((a, b) => a + b, 0) /samples.length
                if (self.avgCurrent > self.threshold) {
                  self.state = 'busy'
                } else if (self.avgCurrent > 0 && self.avgCurrent < self.threshold) {
                  self.state = 'idle'
                } else if (self.avgCurrent === 0) {
                  self.state = 'off'
                } else
                  self.state = 'undefined'
                reset ()
              }
            }
          })
        }
     }, self.interval)
}
