var logger = require('../config/winston')
var zetta = require('zetta')
var device = require('../lib/fablab/driver/scout')

const startZetta = (machine) => {
  zetta()
    .name('machine-wrapper2')
    .link('http://pigateway.local:1337')
    .use(device, machine.m.name, machine.url, machine.m.type, machine.m.vendor, machine.m.threshCurr, machine.m.sampleTime, machine.m.hysteresis, machine.m.dutyCycle, machine.jobs)
    .listen(1337, function () {
      logger.info('@zetta: Server started on piwrapper')
    })
}

process.on('message', (message) => {
  startZetta(message.data)
})
