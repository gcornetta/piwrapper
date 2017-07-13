var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var JobSchema = new mongoose.Schema({
    jobId    : {
        type: String,
        required: true},
    userId    : {
        type: String},
    ownerIP  : {
        type: String},
    jobPath: {
        type: String},
    status   : {    //pending, queued, running, paused, cancelled
        type: String,
        required: true},
    createdOn: { //consider the idea to use Timestamp type
        type: Date,
        "default": Date.now
    }
});

var AdcSchema = new mongoose.Schema({
    vendor: {
         type: String,
         required: true
    },
    device:   {
         type: String,
         required: true
    }
});

var MachineSchema = new mongoose.Schema({
    vendor: {
        type: String,
        required: true
    },  
    type: {  //laser cutter, vynil cutter, 3D printer, milling machine
        type: String,
        required: true
    },   
    name: { //logical name to assign to a machine
        type: String,
        required: true
    }, 
    isConfigured : Boolean,
    adcDevice : [AdcSchema],  
    queuedJobs: [JobSchema],
    deviceUri: {
        type: String}
});

var Machine = module.exports = mongoose.model('Machine', MachineSchema);

module.exports.createMachine = function(newMachine, callback){
        newMachine.save(callback);
}

module.exports.checkIfMachineConfigured = function(callback){
	var query = {'isConfigured': true};
	Machine.findOne(query, callback);
}

module.exports.updateMachine = function(newConfiguration, callback){
	var query = {'isConfigured': true}; 
	Machine.findOneAndUpdate(query, newConfiguration, {new : true}, callback);
}  

module.exports.addMachineJob = function(newJob, callback){
        Machine.findOne ({}, function(err, machine){
          if (err) throw(err);
          machine.queuedJobs.push(newJob);
          machine.save(callback);
        });
}

module.exports.getMachineByName = function(machineName, callback){
    var query = {name: machineName};
    Machine.findOne(query, callback);
}

module.exports.getMachineById = function(id, callback){
    Machine.findById(id, callback);
}

module.exports.getJobById = function(id, callback){
    Machine.queuedJobs.find({jobId : id}, callback);
}

module.exports.removeJobById = function(id, callback){
    Machine.update({}, { $pull: { queuedJobs : { jobId : id } } }, callback);
}

module.exports.removeJobByOwner = function(owner, callback){
    var query = {owner : owner};
    Machine.queuedJobs.findByOneAndRemove(query, callback);
}

module.exports.updateJob = function(job, callback){
    Machine.findOne ({}, function(err, machine){
              if (err) throw(err);
              for (var i in machine.queuedJobs){
                if (machine.queuedJobs[i].jobId === job.jobId){
                    machine.queuedJobs[i] = job;
                    machine.save(callback);
                    break;
                }
              }
    });
}

module.exports.changeJobStatusById = function(id, newStatus, callback){
    Machine.queuedJobs.findById(id, function(err, job){
       if (err) throw (err);
       if (!job) {
          callback(null, false);
       } else {
          job.status = newStatus;
          job.save(callback(null, true));
       }
    });
}

module.exports.changeJobStatusByOwner = function(owner, newStatus, callback){
    var query = {owner : owner};
    Machine.queuedJobs.findOne(query, function(err, job){
       if (err) throw (err);
       if (!job) {
          callback(null, false);
       } else {
          job.status = newStatus;
          job.save(callback(null, true));
       }
    });	

}

module.exports.getJobStatusById = function (id, callback){
   Machine.queuedJobs.findById(id, callback);
}

module.exports.getJobStatusByOwner = function (owner, callback){
   var query = {owner : owner};
   Machine.queuedJobs.findOne(query, callback);
}
