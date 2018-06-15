var Machine = require('../../models/machine');
var priorityFifoFactory = require('./priority-fifo-factory');
var printFunctions = require('./print-functions');
var logger = require('../../config/winston')
var io = require('../../app').io;
var fs = require('fs');
var pathFunction;
var path;
var io;
var fifoLocal;
var fifoAPI;
var nextLocal = true;
var printingJob = null;
var machineLib = null;
var machineVar = null;
var pendingJobs = {};
var finishedJobs = {};

var MAXUSERJOBS = 5;
var MAXUSERS = 5;

module.exports.init = function(){
  fifoLocal = priorityFifoFactory.newPriorityFifo(MAXUSERS);
  fifoAPI = priorityFifoFactory.newPriorityFifo(MAXUSERS);
  io = require('../../app').io;
  var that = this;
  Machine.getJobs(function(err, jobs){
      if(!err){
        for (var i=0; i<jobs.length; i++){
          if ((jobs[i].status === "running")||(jobs[i].status === "queued")){
            jobs[i].status = "pending";
          }
          pendingJobs[jobs[i].jobId] = jobs[i];
          io.to('jobUpdates').emit('addJob', jobs[i]);
        }
      }
  })
}

module.exports.push = function(job, caller, callback){
  /*switch (caller){
  case "local":
  fifoLocal.push(job, callback);
  break;
  case "global":
  fifoAPI.push(job, callback);
  break;
}
this.executeNextJob();*/
var fifo;
if (caller == "global"){
  fifo = fifoAPI;
}else{
  fifo = fifoLocal;
}
if ((fifo.getUsersLength() > MAXUSERS-1)&&(fifo.getUserJobsLength(job.userId) === 0)){
  callback({err: "Job not added. User limit exceeded"});
}else if (fifo.getUserJobsLength(job.userId) > MAXUSERJOBS-1){
  callback({err: "Job not added. Jobs per user limit exceeded"});
}else{
    job.caller = caller;
    job.createdOn = Date.now()/1000;
    Machine.addMachineJob(job, function (err, product, num){
        if (!err){
            pendingJobs[job.jobId] = job;
            io.to('jobUpdates').emit('addJob', job);
            callback(null, job);
            /*******DEBUG**********
            this.acceptJob(job.jobId, function(){});
            *///*******DEBUG**********
        }else{
            callback({err: JSON.stringify(err)}, null);
        }
    });
}
}

module.exports.update = function(job, caller, callback){
  if (pendingJobs[job.jobId]){
    job.userId = pendingJobs[job.jobId].userId;
    job.status = pendingJobs[job.jobId].status;
    job.jobPath = pendingJobs[job.jobId].jobPath;
    job.caller = pendingJobs[job.jobId].caller;
    pendingJobs[job.jobId] = job;
    callback(null, pendingJobs[job.jobId]);
  }else{
    switch (caller){
      case "local":
      fifoLocal.update(job, callback);
      break;
      case "global":
      fifoAPI.update(job, callback);
      break;
    }
  }
}

module.exports.updatePriority = function(newPriority, userId, caller){
  switch (caller){
    case "local":
    fifoLocal.updatePriority(newPriority, userId);
    break;
    case "global":
    fifoAPI.updatePriority(newPriority, userId);
    break;
  }
}

module.exports.removeJob = function (jobId, caller, callback){
  if (pendingJobs[jobId]){
    Machine.removeJobById(jobId, function(err){
        if (err) {logger.error('@job-fifo.remove db error: '+ err)}
        var aux = pendingJobs[jobId];
        io.to('jobUpdates').emit('deleteJob', jobId);
        fs.unlink(aux.jobPath, function(err) {if (err) {logger.error('@job-fifo.remove file error: '+ err)}});
        delete pendingJobs[jobId];
        callback(null, aux);
    });
  }else if (finishedJobs[jobId]){
    Machine.removeJobById(jobId, function(err){
        if (err) {logger.error('@job-fifo.remove db error: '+ err)}
        var aux = finishedJobs[jobId];
        io.to('jobUpdates').emit('deleteJob', jobId);
        fs.unlink(aux.jobPath, function(err) {if (err) {logger.error('@job-fifo.remove file error: '+ err)}});
        delete finishedJobs[jobId];
        callback(null, aux);
    });
  }else{
    if ((printingJob)&&(printingJob.jobId === jobId)){
      printingJob = null;
    }
    switch (caller){
      case "local":
      fifoLocal.removeJob(jobId, callback);
      break;
      case "global":
      fifoAPI.removeJob(jobId, callback);
      break;
      default:
      fifoAPI.removeJob(jobId, function(err, job){
        if (err){
          fifoLocal.removeJob(jobId, callback);
        }else{
          callback(err, job);
        }
      });
      break;
    }
  }
}

module.exports.cancelJob = function (jobId, caller, callback){
  if (caller === "global"){
      var that = this;
      var auxJob = this.getJobById(jobId);
      var filePath = auxJob.jobPath;
      auxJob.jobPath = auxJob.jobPath+"copy";
      fs.closeSync(fs.openSync(auxJob.jobPath, 'w'));
      that.update(auxJob, auxJob.caller, function(err, obj){
        that.removeJob(jobId, caller, function(err, cancelledJob){
          cancelledJob.status = "cancelled";
          cancelledJob.jobPath = filePath;
          console.log(filePath)
          finishedJobs[jobId]= cancelledJob;
          Machine.addMachineJob(cancelledJob, function (err, product, num){
              if (!err){
                  io.to('jobUpdates').emit('addJob', cancelledJob);
                  callback(null, cancelledJob);
              }else{
                  callback({err: JSON.stringify(err)}, null);
              }
           });
        })
      });
  }else{
    this.removeJob(jobId, caller, callback)
  }

}

module.exports.finishJob = function (jobId, caller, callback){
    if ((printingJob)&&(printingJob.jobId === jobId)){
      printingJob = null;
    }
    switch (caller){
      case "local":
      fifoLocal.removeJob(jobId, function (err, finishedJob){
        if (err){
            callback(err);
        }else{
            finishedJob.status = "finished";
            finishedJobs[jobId]= finishedJob;
            Machine.addMachineJob(finishedJob, function (err, product, num){
                if (!err){
                    io.to('jobUpdates').emit('addJob', finishedJob);
                    callback(null, finishedJob);
                }else{
                    callback({err: JSON.stringify(err)}, null);
                }
            });
        }
      });
      break;
      case "global":
      fifoAPI.removeJob(jobId, function (err, finishedJob){
        if (err){
            callback(err);
        }else{
            finishedJob.status = "finished";
            finishedJobs[jobId]= finishedJob;
            Machine.addMachineJob(finishedJob, function (err, product, num){
                if (!err){
                    io.to('jobUpdates').emit('addJob', finishedJob);
                    callback(null, finishedJob);
                }else{
                    callback({err: JSON.stringify(err)}, null);
                }
            });
        }
      });
      break;
    }
}

module.exports.getJobById = function (jobId, caller){
  if (pendingJobs[jobId]){
    return pendingJobs[jobId];
  }else if (finishedJobs[jobId]){
    return finishedJobs[jobId];
  }else{
    switch (caller){
      case "local":
      return fifoLocal.getJobById(jobId);
      break;
      case "global":
      return fifoAPI.getJobById(jobId);
      break;
      default:
      var job = fifoAPI.getJobById(jobId);
      if (!job){
        return fifoLocal.getJobById(jobId);
      }else{
        return job;
      }
    }
  }
}

module.exports.acceptJob = function (jobId, callback){
  if (pendingJobs[jobId]){
    var aux = pendingJobs[jobId];
    aux.status = "queued";
    delete pendingJobs[jobId];
    switch (aux.caller){
      case "local":
      fifoLocal.push(aux, callback);
      break;
      case "global":
      fifoAPI.push(aux, callback);
      break;
    }
    this.executeNextJob();
  }
}

module.exports.acceptJobTEST = function (jobId, callback){
  if (pendingJobs[jobId]){
    var aux = pendingJobs[jobId];
    aux.status = "queued";
    delete pendingJobs[jobId];
    switch (aux.caller){
      case "local":
      fifoLocal.push(aux, callback);
      break;
      case "global":
      fifoAPI.push(aux, callback);
      break;
    }
    //this.executeNextJob();
  }
}

module.exports.getNextJob = function (){
  var nextJob;
  if (nextLocal){
    nextJob = fifoLocal.getNextJob();
  }else{
    nextJob = fifoAPI.getNextJob();
  }
  if (!nextJob){
    nextLocal = !nextLocal;
    if (nextLocal){
      nextJob = fifoLocal.getNextJob();
    }else{
      nextJob = fifoAPI.getNextJob();
    }
  }
  return nextJob;
}

module.exports.lastJobCompleted = function (){
  var nextJob;
  if (nextLocal){
    nextJob = fifoLocal.lastJobCompleted();
  }else{
    nextJob = fifoAPI.lastJobCompleted();
  }
  nextLocal = !nextLocal;
  if (!nextJob){
    if (nextLocal){
      nextJob = fifoLocal.lastJobCompleted();
    }else{
      nextJob = fifoAPI.lastJobCompleted();
    }
    nextLocal = !nextLocal;
  }
  return nextJob;
}

module.exports.getJobs = function (){
  var retValue = fifoLocal.getJobs().concat(fifoAPI.getJobs());
  for (var j in pendingJobs){
    retValue.push(pendingJobs[j]);
  }
  for (var j in finishedJobs){
    retValue.push(finishedJobs[j]);
  }
  return retValue;
}

module.exports.getJobStatusObject = function (){
  var jobs = this.getJobs();
  var retValue = {};
  for (var i in jobs){
    retValue[jobs[i].jobId] = jobs[i].status;
  }
  return retValue;
}

module.exports.executeNextJob = function (){
  var that = this;
  if (!printingJob){
    printingJob = this.getNextJob();
    if (printingJob){
      if (!machineLib){
        Machine.checkIfMachineConfigured(function(err, machine){
          if (err) throw (err);
          machineVar = machine;
          switch (machineVar.type) {
            case 'Laser cutter':
            switch (machineVar.vendor) {
              case 'Epilog':
              switch (printingJob.process){
                case 'cut':
                    pathFunction = require('../fablab/lib/path2D');
                    path = new pathFunction();
                    break;
                case 'halftone':
                    pathFunction = require('../fablab/lib/path-halftone');
                    path = new pathFunction();
                    break;
              }
              machineLib = require('../fablab/machines/epilog');
              break;
              case 'GCC':
              machineLib = require('../fablab/machines/gcclaser');
              break;
              case 'Trotec':
              machineLib = require('../fablab/machines/troteclaser');
              break;
            }
            break;
            case 'Vinyl cutter':
            switch (machineVar.vendor) {
              case 'GCC':
              machineLib = require('../fablab/machines/gccvinyl');
              break;
              case 'Roland':
              pathFunction = require('../fablab/lib/path2D');
              path = new pathFunction();
              machineLib = require('../fablab/machines/rolandvinyl');
              break;
            }
            break;
            case 'Milling machine':
            switch (machineVar.vendor) {
              case 'Roland':
              switch (printingJob.process){
                case 'pcb':
                    switch (printingJob.pcbFinishing){
                        case 'traces_1_64':
                            pathFunction = require('../fablab/lib/path21D');
                            path = new pathFunction();
                            break;
                        case 'outline_1_32':
                            pathFunction = require('../fablab/lib/path22D');
                            path = new pathFunction();
                            break;
                        case 'traces_0_010':
                            pathFunction = require('../fablab/lib/path21D');
                            path = new pathFunction();
                            break;
                      }
                    break;
                case 'wax':
                    switch (printingJob.waxFinishing){
                        case 'rough_cut':
                            pathFunction = require('../fablab/lib/path25D');
                            path = new pathFunction();
                            break;
                        case 'finish_cut':
                            pathFunction = require('../fablab/lib/path3D');
                            path = new pathFunction();
                            break;
                      }
                    break;
              }
              machineLib = require('../fablab/machines/rolandmill');
              break;
              case 'Othermill':
              machineLib = require('../fablab/machines/othermill');
              break;
            }
            break;
            case 'Laser micromachining':  //TODO: Add this machine
                machineLib = require('../fablab/machines/epilog');
            break;
            case '3D printer':
                switch (machineVar.vendor) {
                    case 'Prusa':
                        //machineLib = require('../fablab/machines/prusa');
                        break;
                }
            break;
          }
          switch (machineVar.type) {
            case 'Laser cutter':
                if (machineVar.vendor === 'Epilog'){
                    printFunctions.calculateAndPrintJobFile(that, printingJob, path, machineLib, machineVar);
                    break;
                }
                break;
            case 'Vinyl cutter':
                printFunctions.calculateAndPrintJob(that, printingJob, path, machineLib, machineVar);
                break;
            case 'Milling machine':
                if (machineVar.vendor === 'Roland'){
                    if(printingJob.machines === 'srm_20'){
                        printFunctions.calculateAndPrintLp(that, printingJob, path, machineLib, machineVar);
                    }else{
                        printFunctions.calculateAndPrintJob(that, printingJob, path, machineLib, machineVar);
                    }
                    break;
                }
                break;
            case '3D printer':
                printFunctions.Print3dJob(that, printingJob, path, machineLib, machineVar);
                break;
          }
        });
      }else{
        switch (machineVar.type) {
                    case 'Laser cutter':
                        if (machineVar.vendor === 'Epilog'){
                            printFunctions.calculateAndPrintJobFile(that, printingJob, path, machineLib, machineVar);
                            break;
                        }
                        break;
                    case 'Vinyl cutter':
                        printFunctions.calculateAndPrintJob(that, printingJob, path, machineLib, machineVar);
                        break;
                    case 'Milling machine':
                        if (machineVar.vendor === 'Roland'){
                            if(printingJob.machines === 'srm_20'){
                                printFunctions.calculateAndPrintLp(that, printingJob, path, machineLib, machineVar);
                            }else{
                                printFunctions.calculateAndPrintJob(that, printingJob, path, machineLib, machineVar);
                            }
                            break;
                        }
                        break;
                    case '3D printer':
                        printFunctions.Print3dJob(that, printingJob, path, machineLib, machineVar);
                        break;
                  }
      }
    }
  }
}


