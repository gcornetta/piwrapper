var SerialPort = require("serialport");
var printer = require('../fablab/printer-config');
var logger = require('../../config/winston');
var PNG = require('pngjs').PNG;
var fs = require('fs');
var gcodeParser = require('../fablab/printers/gcode-parser.js');
var SerialPort = require("serialport");
var Machine = require('../../models/machine');
var functions = {};

var printCommands = [],
    printPosition = 0,
    serialTimeout = 120000,
    responseTimeout,
    serialport,
    printingJobGlobal;

functions.calculateAndPrintJob = function(that, printingJob, path, machineLib, machineVar){
  printingJobGlobal = printingJob;
  logger.debug('@print-functions.calculateAndPrintJob: '+ "calculateAndPrintJob")
  fs.createReadStream(printingJobGlobal.jobPath)
  .pipe(new PNG({
    filterType: 4
  }))
  .on('parsed', function() {
    logger.debug('@print-functions.calculateAndPrintJob: '+ "img parsed")
    printingJobGlobal.height = this.height;
    printingJobGlobal.width = this.width;
    var printingJobCopy = JSON.parse(JSON.stringify(printingJobGlobal));
    path.getPath(printingJobGlobal, function(p, dpi){
      logger.debug('@print-functions.calculateAndPrintJob: '+ "path calculated")
      printingJobGlobal = printingJobCopy;
      printingJobGlobal.dpi = dpi;
      var machineNew = new machineLib(p, printingJobGlobal);
      machineNew.cmdString(function(err, str){
        logger.debug('@print-functions.calculateAndPrintJob: '+ "cmd string calculated")
        console.log(str)
        printer.printFromString(machineVar.name, str, function(job){
          logger.debug('@print-functions.calculateAndPrintJob: '+ "jobFinished");
          that.removeJob(printingJobGlobal.jobId, printingJobGlobal.caller, function(){
            that.executeNextJob();
          });
        });

        /*setTimeout(function(){
        logger.debug('@print-functions.calculateAndPrintJob: '+ "jobFinished");
                            that.removeJob(printingJobGlobal.jobId, printingJobGlobal.caller, function(){
                              that.executeNextJob();
                            });
        }, 3000);*/
      });
    });
  })
  .on('error', function(err){
    logger.error('@print-functions.calculateAndPrintJob: '+ err);
    repushJob(that);
  });
}

functions.printStringJob = function(machineVar, str, callback){
    printer.printFromString(machineVar.name, str, function(jobFromText){
        logger.debug('@print-functions.calculateAndPrintJob: '+ "jobFinished");
        callback(jobFromText);
    });
}

functions.calculateAndPrintJobFile = function(that, printingJob, path, machineLib, machineVar){
  printingJobGlobal = printingJob;
  logger.debug('@print-functions.calculateAndPrintJob: '+ "calculateAndPrintJob")
  fs.createReadStream(printingJobGlobal.jobPath)
  .pipe(new PNG({
    filterType: 4
  }))
  .on('parsed', function() {
    logger.debug('@print-functions.calculateAndPrintJob: '+ "img parsed")
    printingJobGlobal.height = this.height;
    printingJobGlobal.width = this.width;
    var printingJobCopy = JSON.parse(JSON.stringify(printingJobGlobal));
    path.getPath(printingJobGlobal, function(p, dpi){
      logger.debug('@print-functions.calculateAndPrintJob: '+ "path calculated")
      printingJobGlobal = printingJobCopy;
      printingJobGlobal.dpi = dpi;
      var machineNew = new machineLib(p, printingJobGlobal);
      machineNew.cmdString(function(err, str){
        logger.debug('@print-functions.calculateAndPrintJob: '+ "cmd string calculated")
        console.log(str)
        printer.printFromString(machineVar.name, str, function(job){
          logger.debug('@print-functions.calculateAndPrintJob: '+ "jobFinished");
          that.removeJob(printingJobGlobal.jobId, printingJobGlobal.caller, function(){
            that.executeNextJob();
          });
        });
        logger.debug('@print-functions.calculateAndPrintJob: '+ str)
        fs.writeFile(printingJobGlobal.jobId+"epilog", str, function(err, data) {
          if(err) {
            return console.log(err);
          }
          printer.printFromFile(machineVar.name, printingJobGlobal.jobId+"epilog", function(job){
            logger.debug('@print-functions.calculateAndPrintJob: '+ "jobFinished");
            that.removeJob(printingJobGlobal.jobId, printingJobGlobal.caller, function(){
              that.executeNextJob();
            });
          });
        });
      });
    });
  })
  .on('error', function(err){
    logger.error('@print-functions.calculateAndPrintJob: '+ err);
    repushJob(that);
  });
}

functions.Print3dJob = function(that, printingJob, path, machineLib, machineVar){
  printingJobGlobal = printingJob;
  logger.debug('@print-functions.Print3dJob: '+ "start")
  fs.readFile(printingJobGlobal.jobPath, 'utf8', function(err, data) {
    if (err) {
        logger.error('@print-functions.Print3dJob: '+ err);
        repushJob(that);
    }else{
        logger.debug('@print-functions.Print3dJob: '+ "file readed")
        Machine.checkIfMachineConfigured(function(err, machine){
            if (err){
                logger.error('@print-functions.Print3dJob: '+ err);
                repushJob(that);
            }else{
                logger.debug('@print-functions.Print3dJob: '+ "machine configured")
                printCommands = gcodeParser.getLines(data);
                serialport = new SerialPort(machine.deviceUri, {
                                            baudRate: machine.baudRate
                                        });

                serialport.on('open', function(){
                    serialport.flush(function(){
                        logger.debug('@print-functions.Print3dJob: '+"Serial Port is open.");
                        serialport.on('data', function(data) {
                            readLine(that, data);
                        });
                    })
                });
                serialport.on('error', function(err) {
                    logger.error('@print-functions.Print3dJobError: '+ err);
                    repushJob(that);
                });
                serialport.on('close', function(err) {
                    logger.error('@print-functions.Print3dJobClose: '+ err);
                    repushJob(that);
                });
            }
        });
    }
  });
}

function printerCommand(comm){
    /*
    Don't send empty lines. But we do have to send something, so send
    m105 instead.
    Don't send the M0 or M1 to the machine, as M0 and M1 are handled as
    an LCD menu pause.
    */
    if((comm === "")||(comm === "M0")||(comm === "M1")){
        comm = "M105";
    }
    logger.debug('@print-functions.printerCommand: '+  comm);

    serialport.write(comm + "\n", function(err, results) {
        if(err){
            logger.error('@print-functions.printerCommand: '+ err);
        }
        printPosition ++;
    });
}

const { StringDecoder } = require('string_decoder');
const decoder = new StringDecoder('utf8');


var data = '';
function readLine (that, buffer, delimiter, encoding) {
    if (typeof delimiter === 'undefined' || delimiter === null) { delimiter = '\n' }
    if (typeof encoding === 'undefined' || encoding === null) { encoding = 'utf8' }
    // Delimiter buffer saved in closure
    // Collect data
    data += buffer.toString(encoding);
    // Split collected data by delimiter
    var parts = data.split(delimiter);
    data = parts.pop();
    parts.forEach(function(part) {
      readCommand(that, part);
    });
}

var fs = require('fs');
var log;

function readCommand(that, data){
    /*log = printCommands[printPosition-1] + ": " + data +"\n"
    fs.appendFile("log", log, function(err) {
        if(err) {
            return console.log(err);
        }*/
        clearTimeout(responseTimeout);
        if((data.indexOf("Error:") != -1)||(data.indexOf("!!") != -1)){
            logger.error('@print-functions.readCommand: '+ data);
            repushJob(that);
        } else if(data.indexOf("T:") != -1){
            //TODO: Check if temperature can be more than 999ºC
            var temp = (data.slice(data.indexOf("T:")+2, data.indexOf("T:")+6));
            logger.debug('@print-functions.readCommand: Temperature: '+  temp);
            if(data.indexOf("B:") != -1){
                    temp = (data.slice(data.indexOf("B:")+2, data.indexOf("B:")+6));
                    logger.debug('@print-functions.readCommand: Bed temperature: '+  temp);
            }
        } else if((data.indexOf("_min") != -1)||(data.indexOf("_max") != -1)){
            logger.debug('@print-functions.readCommand: Min/max: '+  data);
        } else if((data.indexOf("resend") != -1)||(data.indexOf("Resend") != -1)||(data.indexOf("rs") != -1)){
            logger.debug('@print-functions.readCommand: Resend: '+  data);
            printPosition--;
            sendNextCommand(that);
        }

        if(data.indexOf("ok") === 0 || data.indexOf("start")!= -1){
            logger.debug('@print-functions.readCommand: ok: '+data);
            sendNextCommand(that);
        }
    //});
}

function sendNextCommand(that, retries){
    retries = retries || 0;
    var comm = printCommands[printPosition];
    if (comm){
        var timeout = serialTimeout;
        if (comm.indexOf("M109")||comm.indexOf("M190")){
            timeout = serialTimeout*5;
        }
        responseTimeout = setTimeout(function(){
            logger.error('@print-functions.Print3dJob: Serial timeout!');
            if (ret > 5){
                logger.error('@print-functions.Print3dJob: Job cancelled');
                repushJob(that);
            }else{
                retries++;
                logger.error('@print-functions.Print3dJob: Retrying '+ retries);
                sendNextCommand(that, retries);
            }
        }, timeout);
        printerCommand(printCommands[printPosition]);
    }else{ //No more commands
        that.removeJob(printingJobGlobal.jobId, printingJobGlobal.caller, function(){
            that.executeNextJob();
        });
    }
}

function repushJob(that){
    that.removeJob(printingJobGlobal.jobId, printingJobGlobal.caller, function(err, job){
        if (job){
            printingJobGlobal.status = "error"
            that.push(printingJobGlobal, printingJobGlobal.caller, function(err, job){
                that.executeNextJob();
            });
        }else{
            that.executeNextJob();
        }
    });
}

module.exports = functions;