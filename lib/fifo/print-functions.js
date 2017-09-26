var SerialPort = require("serialport").SerialPort;
var printer = require('../fablab/printer-config');
var winston = require('winston');
var PNG = require('pngjs').PNG;
var fs = require('fs');
var functions = {};

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
  });
  /*winston.debug('@print-functions.calculateAndPrintJob: '+ "jobFinished");
            that.removeJob(printingJob.jobId, printingJob.caller, function(){
              that.executeNextJob();
            });*/
}


functions.Print3dJob = function(that, printingJob, path, machineLib, machineVar){
  fs.readFile(printingJob.jobPath, 'utf8', function(err, data) {
    if (err) {
        winston.error('@print-functions.Print3dJob: '+ err);
    }else{
        //winston.debug('@Print3dJob: '+ data);
        var lines = data.split('\n');
        //for(var i = 0;i < lines.length;i++){
        for(var i = 0;i < 15;i++){
            if (lines[i][0]!==";"){
                winston.debug('@print-functions.Print3dJob: '+ "line")
                winston.debug('@print-functions.Print3dJob: '+ lines[i])
            }
        }
        //TEST1
        /*var serialport = new SerialPort(machineVar.deviceUri);
        serialport.on('open', function(){
          winston.debug('@print-functions.Print3dJob: '+ 'Serial Port Opend');
          serialport.on('data', function(data){
              winston.debug('@print-functions.Print3dJob: '+ data[0]);
          });

          serialport.write(data, function(err) {
            if (err) {
              return winston.error('@print-functions.Print3dJob: '+ 'Error on write: ', err.message);
            }
            winston.debug('@print-functions.Print3dJob: '+ 'message written');
          });
        });*/
    }
  });
}

module.exports = functions;