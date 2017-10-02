var SerialPort = require("serialport");
var printer = require('../fablab/printer-config');
var winston = require('winston');
var PNG = require('pngjs').PNG;
var fs = require('fs');
var gcodeParser = require('../fablab/printers/gcode-parser.js');
var SerialPort = require("serialport");
var Machine = require('../../models/machine');
var functions = {};
//TEST

functions.calculateAndPrintJob = function(that, printingJob, path, machineLib, machineVar){
  winston.debug('@print-functions.calculateAndPrintJob: '+ "calculateAndPrintJob")
  fs.createReadStream(printingJob.jobPath)
  .pipe(new PNG({
    filterType: 4
  }))
  .on('parsed', function() {
    winston.debug('@print-functions.calculateAndPrintJob: '+ "img parsed")
    printingJob.height = this.height;
    printingJob.width = this.width;
    path.getPath(printingJob, function(p, dpi){
      winston.debug('@print-functions.calculateAndPrintJob: '+ "path calculated")
      printingJob.dpi = dpi;
      var machineNew = new machineLib(p, printingJob);
      machineNew.cmdString(function(err, str){
        winston.debug('@print-functions.calculateAndPrintJob: '+ "cmd string calculated")
        printer.printFromString(machineVar.name, str, function(job){
          winston.debug('@print-functions.calculateAndPrintJob: '+ "jobFinished");
          that.removeJob(printingJob.jobId, printingJob.caller, function(){
            that.executeNextJob();
          });
        });
        /*winston.debug('@print-functions.calculateAndPrintJob: '+ "jobFinished");
                    that.removeJob(printingJob.jobId, printingJob.caller, function(){
                      that.executeNextJob();
                    });*/
      });
    });
  })
  .on('error', function(err){
    winston.error('@print-functions.calculateAndPrintJob: '+ err);
    requeueJob(printingJob, that);
  });
}

var printCommands = [],
    printPosition = 0,
    serialTimeout = 120000;

functions.Print3dJob = function(that, printingJob, path, machineLib, machineVar){
  winston.debug('@print-functions.Print3dJob: '+ "start")
  fs.readFile(printingJob.jobPath, 'utf8', function(err, data) {
    if (err) {
        winston.error('@print-functions.Print3dJob: '+ err);
        requeueJob(printingJob, that);
    }else{
        winston.debug('@print-functions.Print3dJob: '+ "file readed")
        Machine.checkIfMachineConfigured(function(err, machine){
            if (err){
                winston.error('@print-functions.Print3dJob: '+ err);
                requeueJob(printingJob, that);
            }else{
                winston.debug('@print-functions.Print3dJob: '+ "machine configured")


                printCommands = gcodeParser.getLines(data);

                var serialport = new SerialPort(machine.deviceUri, {
                                            baudRate: machine.baudRate
                                        });

                serialport.on('open', function(){
                    winston.debug('@print-functions.Print3dJob: '+"Serial Port is open.");
                    printPosition = 0;
                    var responseTimeout = setTimeout(function(){winston.error('@print-functions.Print3dJob: Serial timeout!');requeueJob(printingJob, that);}, serialTimeout);
                    serialport.on('data', function(data) {
                        if(data.indexOf("ok") != -1 || data == "start\r"){
                            winston.debug('@print-functions.Print3dJob: '+"Data: "+data);
                            clearTimeout(responseTimeout);
                            if (printCommands[printPosition]){
                                responseTimeout = setTimeout(function(){winston.error('@print-functions.Print3dJob: Serial timeout!');requeueJob(printingJob, that);}, serialTimeout);
                                setTimeout(function(){
                                    printerCommand(serialport, printCommands[printPosition]);
                                },50);
                            }else{ //No more commands
                                that.removeJob(printingJob.jobId, printingJob.caller, function(){
                                    that.executeNextJob();
                                });
                            }
                        } else {
                            winston.debug('@print-functions.Print3dJob: '+"Unhandled data: "+data);
                        }
                    });
                });
                serialport.on('error', function(err) {
                    winston.error('@print-functions.Print3dJob: '+ err.message);
                    requeueJob(printingJob, that);
                });
            }
        });
    }
  });
}

function printerCommand(sp, comm){
    if(comm !== undefined && comm.indexOf(" ") === comm.length - 1){
        comm = comm.substring(0, comm.length - 1);

    }
    winston.debug('@print-functions.printerCommand: '+  comm);

    sp.write(comm + "\n", function(err, results) {
        if(err){
            winston.error('@print-functions.printerCommand: '+ err);
        }

        if(comm !== "M105"){
            printPosition += 1;
        }
    });

}

function requeueJob(printingJob, that){
    that.removeJob(printingJob.jobId, printingJob.caller, function(err, job){
        if (job){
            that.push(printingJob, printingJob.caller, function(){
                that.executeNextJob();
            });
        }else{
            that.executeNextJob();
        }
    });
}

module.exports = functions;