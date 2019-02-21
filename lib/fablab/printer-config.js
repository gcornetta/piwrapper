const {
    exec
} = require('child_process')
var Printer = require('node-printer')
var SerialPort = require('serialport')
var logger = require('../../config/winston')
var printerNoCups = require('printer')
var fs = require('fs')

var printer
var printerNameGlobal

module.exports.discoverPrinters = function (callback) {
  exec('sudo lpinfo -v', (error, stdout, stderr) => {
    if (error) {
      logger.error('@printer-config.discoverPrinters: ' + JSON.stringify(error))
    }
    if (!stderr) {
      var printers = []
      var unhandledPrinters = []
      var lines = stdout.split('\n')
      for (var l in lines) {
        if (lines[l].indexOf(':/') !== -1) {
          var words = lines[l].split(' ')
          if (words.length === 2) {
            var printer = {
              'Connection': words[0],
              'DeviceURI': words[1],
              'Name': words[1].slice(words[1].indexOf('://') + 3, words[1].indexOf('%')),
              'Type': 'printer'
            }
            printers.push(printer)
          } else {
            unhandledPrinters.push(lines[l])
          }
        }
      }
    } else {
      logger.error('@printer-config.discoverPrinters: ' + JSON.stringify(stderr))
    }
    discoverSerialDevices(function (err, serialDevices) {
      if (err) {
        logger.error('@printer-config.discoverPrinters: ' + JSON.stringify(err))
        callback(null, printers, unhandledPrinters)
      } else {
        serialDevices.forEach(function (port) {
          if (port.pnpId) {
            var printer = {
              'Connection': 'serial',
              'DeviceURI': port.comName,
              'Name': port.pnpId,
              'Type': 'serial'
            }
            printers.push(printer)
          } else {
            unhandledPrinters.push(port)
          }
        })
      }
      logger.debug('@printer-config.discoverPrinters: ' + JSON.stringify(printers))
      logger.debug('@printer-config.discoverPrinters: ' + JSON.stringify(unhandledPrinters))
      callback(null, printers, unhandledPrinters)
    })
  })
}

function discoverSerialDevices (callback) {
  SerialPort.list(function (err, ports) {
    callback(err, ports)
  })
}

module.exports.addPrinter = function (printer, callback) {
  if (printer.DeviceURI[0] !== '/') {
    exec('sudo lpadmin -p ' + printer.Name + ' -E -v ' + printer.DeviceURI, (error, stdout, stderr) => {
      if (error) {
        logger.error('@printer-config.addPrinter: ' + JSON.stringify(error))
        callback(error)
        return
      }
      if (!stderr) {
        exec('sudo lpoptions -d ' + printer.Name, (error, stdout, stderr) => {
          if (error) {
            logger.error('@printer-config.addPrinter: ' + JSON.stringify(error))
            callback(error)
            return
          }
          if (!stderr) {
            callback(null, stdout)
          } else {
            logger.error('@printer-config.addPrinter: ' + JSON.stringify(stderr))
            callback(stderr)
          }
        })
      } else {
        logger.error('@printer-config.addPrinter: ' + JSON.stringify(stderr))
        callback(stderr)
      }
    })
  } else {
    callback(null, null)
  }
}

module.exports.printFromString = function (printerName, text, callback) {
  try {
    if ((!printer) || (printerNameGlobal !== printerName)) {
      printer = new Printer(printerName)
      printerNameGlobal = printerName
    }
    var jobFromText = printer.printText(text)

    // Listen events from job
    jobFromText.once('sent', function () {
      // jobFromText.on('completed', function() {
      logger.debug('@printer-config.printFromString: Job ' + jobFromText.identifier + 'has been printed')
      jobFromText.removeAllListeners()
      callback(jobFromText)
      // });
    })
  } catch (err) {
    callback(err)
  }
}

module.exports.printFromFile = function (printerName, path, callback) {
  try {
    if ((!printer) || (printerNameGlobal !== printerName)) {
      printer = new Printer(printerName)
      printerNameGlobal = printerName
    }
    var jobFromText = printer.printFile(path)

    // Listen events from job
    jobFromText.once('sent', function () {
      jobFromText.on('completed', function () {
        logger.debug('@printer-config.printFromFile: Job ' + jobFromText.identifier + 'has been printed')
        jobFromText.removeAllListeners()
        callback(jobFromText)
      })
    })
  } catch (err) {
    callback(err)
  }
}

module.exports.printFromFile2 = function (printerName, path, callback) {
  try {
    printerNoCups.printDirect({data:fs.readFileSync(path),
        printer: printerName, // printer name, if missing then will print to default printer
        success:function(jobID){
          console.log("sent to printer with ID: "+jobID);
          callback(null, jobID)
        },
        error:function(err){
          callback(err);
        }
      });
  } catch (err) {
    callback(err)
  }
}
