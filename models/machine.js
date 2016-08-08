var mongoose = require('mongoose');

var JobSchema = new mongoose.Schema({
    owner    : {
        type: String, 
        required: true},
    ownerIP  : {
        type: String, 
        required: true},
    jobNumber: {
        type String, 
        required: true},
    status   : {    //queued, running, cancelled
        type: String, 
        required: true}, 
    createdOn: {
        type: Date,
        "default": Date.now
    }
});


var MachineSchema = new mongoose.Schema({
    vendor: {
        type: String,
        required: true
    }, 
    model: {
        type: String,
        required: true
    }, 
    machineType: {  //laser cutter, vynil cutter, 3D printer, milling machine
        type: String,
        required: true
    },   
    name: { //logical name to assign to a machine
        type: String,
        required: true
    }, 
    model: {
        type: String,
        required: true
    },  
    queuedJobs: [JobSchema]
});

var Machine = module.exports = mongoose.model('Machine', MachineSchema);

module.exports.createUser = function(newMachine, callback){
        newMachine.save(callback);
}

module.exports.addMachineJob = function(machineName, newJob, callback){
        var query = {name: machineName};
        Machine.findOne (query, function(err, machine){
          if (err) throw(err);
          machine.queuedJobs.push(newJob);
          machine.save(callback(null, true));
        });
}

module.exports.getMachineByName = function(username, callback){
    var query = {username: username};
    Machine.findOne(query, callback);
}

module.exports.getMachineById = function(id, callback){
    Machine.findById(id, callback);
}

module.exports.getJobById = function(id, callback){
    Machine.queuedJobs.findById(id, callback);
}

module.exports.removeJobById = function(id, callback){
    Machine.queuedJobs.findByIdAndRemove(id, callback);
}
