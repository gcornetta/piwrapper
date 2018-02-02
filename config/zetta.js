var logger = require('../config/winston')
var zetta = require('zetta')
var device  = require ('../lib/fablab/driver/scout')
var pm2 = require('pm2')

const startZetta = (machine) => {
  zetta()
    .name('machine-wrapper')
    .link ('http://pigateway.local:1337')
    .use (device, machine.m.name, machine.url, machine.m.type, machine.m.vendor, machine.m.threshCurr, machine.m.sampleTime, machine.m.dutyCycle, machine.jobs)
    .listen(1337, function () {
       logger.info('@zetta: Server started on piwrapper');
    })
}

process.on('message', (message) => {
  startZetta(message.data)
})

let exitHandler = function () {
 pm2.connect (err => {
   if (err) {
     self.log(`${err.toString().toLowerCase()}.`)
     process.exit(2)
   }
   pm2.stop ('zetta', (err, app) => {
     if (err) {
      self.log(`${err.toString().toLowerCase()}.`)
      process.exit(2)
     }
     logger.info ('@zetta: Process terminated...exiting.')
     pm2.disconnect()
     process.exit (0)
   })
 })
}

process.on ('SIGINT', () => {
  logger.info ('@zetta: Detected SIGINT...')
  exitHandler()
})

process.on('SIGTERM', () => {
  logger.info ('@zetta: Detected SIGTERM...')
  exitHandler()
})
