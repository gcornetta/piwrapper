var priorityFifoFactory = require('./priorityFifoFactory');
var printer = require('../fablab/printerConfig');
var Machine = require('../../models/machine');
var fifoLocal;
var fifoAPI;
var nextLocal = true;
var printingJob = null;
var machineLib = null;

module.exports.init = function(){
    fifoLocal = priorityFifoFactory.newPriorityFifo();
    fifoAPI = priorityFifoFactory.newPriorityFifo();
}

module.exports.push = function(job, caller, callback){
    switch (caller){
        case "local":
            fifoLocal.push(job, callback);
            break;
        case "api":
            fifoAPI.push(job, callback);
            break;
    }
    this.executeNextJob();
}

module.exports.update = function(job, caller, callback){
    switch (caller){
        case "local":
            fifoLocal.update(job, callback);
            break;
        case "api":
            fifoAPI.update(job, callback);
            break;
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

module.exports.getJobById = function (jobId, caller){
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

module.exports.getNextJob = function (){
    var nextJob;
    if (nextLocal){
        nextJob = fifoLocal.getNextJob();
    }else{
        nextJob = fifoAPI.getNextJob();
    }
    nextLocal = !nextLocal;
    if (!nextJob){
        if (nextLocal){
            nextJob = fifoLocal.getNextJob();
        }else{
            nextJob = fifoAPI.getNextJob();
        }
        nextLocal = !nextLocal;
    }
    return nextJob;
}

module.exports.getJobs = function (){
    return fifoLocal.getJobs().concat(fifoAPI.getJobs());
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