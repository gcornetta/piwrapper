var winston = require ('winston')
var zetta = require('zetta')
var device  = require ('../lib/fablab/driver/scout')
var Machine = require('../models/machine')

Machine.checkIfMachineConfigured( function (err, machine) {
  if (err) throw err
  zetta()
    .name('machine-wrapper')
    .link ('http://pigateway.local:1337')
    .use (device, machine.name, machine.type, machine.vendor)
    .listen(1337, function () {
       winston.info('@zetta: Server started on piwrapper');
    })
  })
