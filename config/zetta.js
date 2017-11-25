const startZetta = (machine) => {
  var logger = require('./winston') 
  var zetta = require('zetta')
  var device  = require ('../lib/fablab/driver/scout')
  
  zetta()
    .name('machine-wrapper')
    .link ('http://pigateway.local:1337')
    .use (device, machine.m.name, machine.url, machine.m.type, machine.m.vendor, machine.m.threshCurr, machine.m.sampleTime, machine.m.dutyCycle)
    .listen(1337, function () {
       logger.info('@zetta: Server started on piwrapper');
    })
}

process.on('message', (machine) => {
  startZetta(machine)
})
