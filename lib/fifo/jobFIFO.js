var priorityFifoFactory = require('./priorityFifoFactory');
var printer = require('../fablab/printerConfig');
var Machine = require('../../models/machine');
var io;
var fifoLocal;
var fifoAPI;
var nextLocal = true;
var printingJob = null;
var machineLib = null;
var pendingJobs = {};

var MAXUSERJOBS = 5;
var MAXUSERS = 5;

module.exports.init = function(){
    fifoLocal = priorityFifoFactory.newPriorityFifo();
    fifoAPI = priorityFifoFactory.newPriorityFifo();
    io = require('../../app').io;
}

module.exports.push = function(job, caller, callback){
    /*switch (caller){
        case "local":
            fifoLocal.push(job, callback);
            break;
        case "api":
            fifoAPI.push(job, callback);
            break;
    }
    this.executeNextJob();*/
    var fifo;
    if (caller == "api"){
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
        pendingJobs[job.jobId] = job;
        io.to('jobUpdates').emit('addJob', JSON.stringify(job));
        callback(null, job);
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
            case "api":
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
        case "api":
            fifoAPI.updatePriority(newPriority, userId);
            break;
    }
}

module.exports.removeJob = function (jobId, caller, callback){
    if (pendingJobs[jobId]){
      var aux = pendingJobs[jobId];
      delete pendingJobs[jobId];
      callback(null, aux);
    }else{
      switch (caller){
        case "local":
            fifoLocal.removeJob(jobId, callback);
            break;
        case "api":
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

module.exports.getJobById = function (jobId, caller){
    if (pendingJobs[jobId]){
      return pendingJobs[jobId];
    }else{
      switch (caller){
        case "local":
            return fifoLocal.getJobById(jobId);
            break;
        case "api":
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
                case "api":
                    fifoAPI.push(aux, callback);
                    break;
        }
        this.executeNextJob();
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
    return retValue;
}

module.exports.executeNextJob = function (){
    /*if (!printingJob){
            printingJob = this.getNextJob();
            if (printingJob){
                if (!machineLib){
                Machine.checkIfMachineConfigured(function(err, machine){
                	if (err) throw (err);
                	switch (machine.type) {
                        case 'Laser cutter':
                            switch (machine.vendor) {
                                case 'Epilog':
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
                            switch (machine.vendor) {
                                case 'GCC':
                                    machineLib = require('../fablab/machines/gccvinyl');
                	            break;
                                case 'Roland':
                                    machineLib = require('../fablab/machines/rolandvinyl');
                	            break;
                	        }
                	        break;
                        case 'Milling machine':
                            switch (machine.vendor) {
                                case 'Roland':
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
                	}
                    machineLib.init(printingJob.jobPath, printingJob.form);
                    machineLib.cmdString(function(err, str){console.log(str)});
                });
            }else{
                machineLib.init(printingJob.jobPath, printingJob.form);
                machineLib.cmdString(function(err, str){console.log(str)});
            }
            }
        }*/
}