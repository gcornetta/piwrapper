var SerialPort = require('serialport')
var printer = require('../fablab/printer-config')
var logger = require('../../config/winston')
var PNG = require('pngjs').PNG
var fs = require('fs')
var gcodeParser = require('../fablab/printers/gcode-parser.js')
var Machine = require('../../models/machine')
var exec = require('child_process').exec
var filePath = require('path')
var mkdirp = require('mkdirp')
var functions = {}
var printing = false

var printCommands = []
var printPosition = 0
var serialTimeout = 120000
var responseTimeout
var serialport
var printingJobGlobal

functions.calculateAndPrintJob = function (that, printingJob, path, MachineLib, machineVar) {
  if (!printing) {
    printing = true
    calculateJob(that, printingJob, path, MachineLib, machineVar, function (str) {
      printer.printFromString(machineVar.name, str, function (job) {
        logger.debug('@print-functions.calculateAndPrintJob: ' + 'jobFinished')
        that.finishJob(printingJobGlobal.jobId, printingJobGlobal.caller, function () {
          printing = false
          that.executeNextJob()
        })
      })
    })
  } else {
    repushJob(that, 'busy')
  }
}

functions.calculateAndPrintJobFile = function (that, printingJob, path, MachineLib, machineVar) {
  if (!printing) {
    printing = true
    calculateJob(that, printingJob, path, MachineLib, machineVar, function (str) {
      fs.writeFile(printingJobGlobal.jobId + 'JobFile', str, function (err, data) {
        if (err) {
          logger.error('@print-functions.calculateAndPrintJobFile: ' + err)
          repushJob(that)
        } else {
            printer.printFromFile2(machineVar.name, printingJobGlobal.jobId + 'JobFile', function (err, job) {
              if (!err){
                  //fs.unlink(printingJobGlobal.jobId + 'JobFile', function (err) { if (err) { logger.error('@print-functions.calculateAndPrintJobFile: ' + err) } })
                  logger.debug('@print-functions.calculateAndPrintJobFile: ' + 'jobFinished')
                  console.log(job)
                  that.finishJob(printingJobGlobal.jobId, printingJobGlobal.caller, function () {
                    printing = false
                    that.executeNextJob()
                  })
              }else{
                logger.error('@print-functions.calculateAndPrintJobFile: ' + err)
                repushJob(that)
              }
            })
        }
      })
    })
  } else {
    repushJob(that, 'busy')
  }
}

functions.calculateAndSaveJobFile = function (that, printingJob, path, MachineLib, machineVar) {
  if (!printing) {
    printing = true
    calculateJob(that, printingJob, path, MachineLib, machineVar, function (str) {
      var jobPath = filePath.join(__dirname, '/../../public/printFiles') + '/' + printingJob.userId
      if (fs.existsSync(jobPath) === false) {
        mkdirp.sync(jobPath)
      }
      fs.writeFile(jobPath + '/' + printingJobGlobal.jobId, str, function (err, data) {
        if (err) {
          logger.error('@print-functions.calculateAndSaveJobFile: ' + err)
          repushJob(that)
        } else {
            that.finishJob(printingJobGlobal.jobId, printingJobGlobal.caller, function () {
                printing = false
                that.executeNextJob()
            })
        }
      })
    })
  } else {
    repushJob(that, 'busy')
  }
}

functions.calculateAndPrintLp = function (that, printingJob, path, MachineLib, machineVar) {
  if (!printing) {
    printing = true
    calculateJob(that, printingJob, path, MachineLib, machineVar, function (str) {
      fs.writeFile(printingJobGlobal.jobId + 'JobFile', str, function (err, data) {
        if (err) {
          logger.error('@print-functions.calculateAndPrintLp: ' + err)
          repushJob(that)
        }
        var cmd = 'sudo python mod_print.py /dev/usb/lp0 ";" "' + printingJobGlobal.jobId + 'JobFile' + '"'
        exec(cmd, function (error, stdout, stderr) {
          console.log(stdout)
          fs.unlink(printingJobGlobal.jobId + 'JobFile', function (err) { if (err) { logger.error('@print-functions.calculateAndPrintLp: ' + err) } })
          if (error === null) {
            logger.debug('@print-functions.calculateAndPrintLp: ' + 'jobFinished')
            that.finishJob(printingJobGlobal.jobId, printingJobGlobal.caller, function () {
              printing = false
              that.executeNextJob()
            })
          } else {
            logger.error('@print-functions.calculateAndPrintLp: ' + stderr)
            repushJob(that)
          }
        })
      })
    })
  } else {
    repushJob(that, 'busy')
  }
}

functions.printStringJob = function (machineVar, str, callback) {
  if (!printing) {
    printing = true
    fs.writeFile('StringJobFile', str, function (err, data) {
      if (err) {
        logger.error('@print-functions.printStringJob: ' + err)
        printing = false
        callback(err)
      } else {
        var cmd = 'sudo python mod_print.py /dev/usb/lp0 ";" "StringJobFile"'
        exec(cmd, function (error, stdout, stderr) {
          fs.unlink('StringJobFile', function (err) { if (err) { logger.error('@print-functions.printStringJob: ' + err) } })
          if (error === null) {
            logger.debug('@print-functions.printStringJob: ' + 'jobFinished')
            printing = false
            callback()
          } else {
            logger.error('@print-functions.printStringJob: ' + stdout)
            printing = false
            callback(stdout)
          }
        })
      }
    })
  } else {
    callback({msg: 'Machine busy'}) // eslint-disable-line
  }
}

function calculateJob (that, printingJob, path, MachineLib, machineVar, callback) {
  printingJobGlobal = printingJob
  logger.debug('@print-functions.calculateJob: ' + 'calculateAndPrintJob')
  fs.createReadStream(printingJobGlobal.jobPath)
      .pipe(new PNG({
        filterType: 4
      }))
      .on('parsed', function () {
        logger.debug('@print-functions.calculateJob: ' + 'img parsed')
        printingJobGlobal.height = this.height
        printingJobGlobal.width = this.width
        var printingJobCopy = JSON.parse(JSON.stringify(printingJobGlobal))
        path.getPath(printingJobGlobal, function (p, dpi) {
          logger.debug('@print-functions.calculateJob: ' + 'path calculated')
          printingJobGlobal = printingJobCopy
          printingJobGlobal.dpi = dpi
          var machineNew = new MachineLib(p, printingJobGlobal)
          machineNew.cmdString(function (err, str) {
            logger.debug('@print-functions.calculateJob: ' + 'cmd string calculated')
            if (err) {
              logger.error('@print-functions.calculateJob: ' + err)
              repushJob(that)
            } else {
              callback(str)
            }
          })
        })
      })
      .on('error', function (err) {
        logger.error('@print-functions.calculateAndPrintJob: ' + err)
        repushJob(that)
      })
}

functions.Print3dJob = function (that, printingJob, path, MachineLib, machineVar) {
  if (!printing) {
    printing = true
    printingJobGlobal = printingJob
    printPosition = 0
    logger.debug('@print-functions.Print3dJob: ' + 'start')
    fs.readFile(printingJobGlobal.jobPath, 'utf8', function (err, data) {
      if (err) {
        logger.error('@print-functions.Print3dJob: ' + err)
        repushJob(that)
      } else {
        logger.debug('@print-functions.Print3dJob: ' + 'file readed')
        Machine.checkIfMachineConfigured(function (err, machine) {
          if (err) {
            logger.error('@print-functions.Print3dJob: ' + err)
            repushJob(that)
          } else {
            logger.debug('@print-functions.Print3dJob: ' + 'machine configured')
            printCommands = gcodeParser.getLines(data)
            serialport = new SerialPort(machine.deviceUri, {
              baudRate: machine.baudRate
            })

            serialport.on('open', function () {
              serialport.flush(function () {
                logger.debug('@print-functions.Print3dJob: ' + 'Serial Port is open.')
                serialport.on('data', function (data) {
                  readLine(that, data)
                })
              })
            })
            serialport.on('error', function (err) {
              logger.error('@print-functions.Print3dJobError: ' + err)
              repushJob(that)
            })
            serialport.on('close', function (err) {
              logger.error('@print-functions.Print3dJobClose: ' + err)
              repushJob(that)
            })
          }
        })
      }
    })
  } else {
    repushJob(that, 'busy')
  }
}

function printerCommand (comm) {
  /*
   Don't send empty lines. But we do have to send something, so send
   m105 instead.
   Don't send the M0 or M1 to the machine, as M0 and M1 are handled as
   an LCD menu pause.
   */
  if ((comm === '') || (comm === 'M0') || (comm === 'M1')) {
    comm = 'M105'
  }
  logger.debug('@print-functions.printerCommand: ' + comm)

  serialport.write(comm + '\n', function (err, results) {
    if (err) {
      logger.error('@print-functions.printerCommand: ' + err)
    }
    printPosition++
  })
}

var data = ''
function readLine (that, buffer, delimiter, encoding) {
  if (typeof delimiter === 'undefined' || delimiter === null) { delimiter = '\n' }
  if (typeof encoding === 'undefined' || encoding === null) { encoding = 'utf8' }
  // Delimiter buffer saved in closure
  // Collect data
  data += buffer.toString(encoding)
  // Split collected data by delimiter
  var parts = data.split(delimiter)
  data = parts.pop()
  parts.forEach(function (part) {
    readCommand(that, part)
  })
}

function readCommand (that, data) {
  /* log = printCommands[printPosition-1] + ": " + data +"\n"
   fs.appendFile("log", log, function(err) {
   if(err) {
   return console.log(err);
   } */
  clearTimeout(responseTimeout)
  if ((data.indexOf('Error:') !== -1) || (data.indexOf('!!') !== -1)) {
    logger.error('@print-functions.readCommand: ' + data)
    repushJob(that)
  } else if (data.indexOf('T:') !== -1) {
    // TODO: Check if temperature can be more than 999ºC
    var temp = (data.slice(data.indexOf('T:') + 2, data.indexOf('T:') + 6))
    logger.debug('@print-functions.readCommand: Temperature: ' + temp)
    if (data.indexOf('B:') !== -1) {
      temp = (data.slice(data.indexOf('B:') + 2, data.indexOf('B:') + 6))
      logger.debug('@print-functions.readCommand: Bed temperature: ' + temp)
    }
  } else if ((data.indexOf('_min') !== -1) || (data.indexOf('_max') !== -1)) {
    logger.debug('@print-functions.readCommand: Min/max: ' + data)
  } else if ((data.indexOf('resend') !== -1) || (data.indexOf('Resend') !== -1) || (data.indexOf('rs') !== -1)) {
    logger.debug('@print-functions.readCommand: Resend: ' + data)
    printPosition--
    sendNextCommand(that)
  }

  if (data.indexOf('ok') === 0 || data.indexOf('start') !== -1) {
    logger.debug('@print-functions.readCommand: ok: ' + data)
    sendNextCommand(that)
  }
  // });
}

function sendNextCommand (that, retries) {
  retries = retries || 0
  var comm = printCommands[printPosition]
  if (comm) {
    var timeout = serialTimeout
    if (comm.indexOf('M109') || comm.indexOf('M190')) {
      timeout = serialTimeout * 5
    }
    responseTimeout = setTimeout(function () {
      logger.error('@print-functions.Print3dJob: Serial timeout!')
      if (retries > 5) {
        logger.error('@print-functions.Print3dJob: Job cancelled')
        repushJob(that)
      } else {
        retries++
        logger.error('@print-functions.Print3dJob: Retrying ' + retries)
        sendNextCommand(that, retries)
      }
    }, timeout)
    printerCommand(printCommands[printPosition])
  } else { // No more commands
    if (printingJobGlobal.status === 'stopping') {
      repushJob(that)
    } else {
      that.finishJob(printingJobGlobal.jobId, printingJobGlobal.caller, function () {
        serialport.close(function (err, results) {
          if (err) {
            logger.error('@print-functions.sendNextCommand: ' + err)
          }
          logger.debug('@print-functions.sendNextCommand: port closed: ' + results)
          printing = false
          that.executeNextJob()
        })
      })
    }
  }
}

functions.cancel3DPrint = function () {
  if (printing) {
    printPosition = 0
    printCommands = gcodeParser.endLines
    printingJobGlobal.status = 'stopping'
  }
}

function repushJob (that, status) {
  that.removeJob(printingJobGlobal.jobId, printingJobGlobal.caller, function (err, job) {
    if (!err && job) {
      printingJobGlobal.status = status || 'error'
      that.push(printingJobGlobal, printingJobGlobal.caller, function (err, job) {
        if (!err && status !== 'busy') {
          printing = false
          that.executeNextJob()
        }
      })
    } else {
      if (status !== 'busy') {
        printing = false
        that.executeNextJob()
      }
    }
  })
}

functions.isMachinePrinting = function () {
  return printing
}

module.exports = functions
