var Device = require('zetta').Device
var util = require('util')
var logger = require('../../../config/winston')
var ADS1x15 = require ('../ads1x15/ADS1x15')
var ADS1115 = 0x01
var Machine = require('../../../models/machine');
//start mongoDB
var db = require('../../../config/db');
var adc = new ADS1x15(ic = ADS1115, address = 0x48)

var connDevice = module.exports = function (name, url, type, vendor, threshold, sampleTime, hysteresis, interval, jobs) {
    Device.call(this)
    this.name = name || 'undefined'
    this.url = url || 'undefined'
    this.type = type || 'undefined'
    this.vendor = vendor || 'undefined'
    this.avgCurrent = 0
    this.state = 'undefined'
    this.threshold = threshold || 'undefined'
    this.sampleTime = sampleTime || 'undefined'
    this.hysteresis = hysteresis || 'undefined'
    this.interval = interval  || 'undefined'
    this.jobs = jobs || {};
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
        if (samples.length > 100){
            samples = []
        }
    }

    reset ()
    self = this

    setInterval (function () {
        const offCurrent = 2; //in mA
        Machine.getJobs(function(err, jobs){
            self.jobs = {};
            for (var i=0; i<jobs.length; i++){
                self.jobs[jobs[i].jobId] = jobs[i].status;
            }
        });

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
        try {
            if (!adc.busy) {
                adc.readADCSingleEnded(0, 2048, 250, function (err, sample) {
                    /*var min = 500
                     var max = 2000
                     var sample = Math.floor(Math.random() * (max - min + 1)) + min */
                    if (err) {
                        logger.error(`@device: ADC error ${err}.`)
                    } else if (sample) {
                        sample = Math.floor((((sample-1655.5)/120)*2000)*1000)/1000 //convert voltage into current
                        sample = Math.abs(sample)
                        samples.push (sample)
                        if (new Date ().getTime () - startTime > self.sampleTime) {
                            self.avgCurrent = Math.floor(samples.reduce(function(a, b){ return a + b; }) /samples.length *1000)/1000
                            if (self.avgCurrent > self.threshold + self.hysteresis) {
                                self.state = 'busy'
                            } else if (self.avgCurrent > offCurrent && self.avgCurrent < self.threshold) {
                                self.state = 'idle'
                            } else if (self.avgCurrent > 0 && self.avgCurrent < offCurrent) {
                                self.state = 'off'
                            } else if(self.avgCurrent >= self.threshold && self.avgCurrent <= (self.threshold + self.hysteresis)) {
                                self.state = self.state
                            } else
                                self.state = 'undefined'
                            reset ()
                        }
                    }
                })
            }
        } catch (e) {
            //logger.error(`@device: ADC error ${e}.`)
        }
    }, self.interval)
}
