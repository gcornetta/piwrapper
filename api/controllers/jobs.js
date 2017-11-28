var machine = require('../../models/machine');
var fifo = require('../../app').fifo;
var formCheck = require('../../common/form-check');
const uuid = require('uuid/v4');
var multiparty = require('multiparty');
var util = require('util');
var fs = require('fs');
var path = require('path');

var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

/* GET list of queued jobs */
module.exports.getQueuedJobs = function(req, res) {
  var jobs = fifo.getJobs();
  /*sendJSONresponse(res, 200, {
    "jobs": JSON.stringify(jobs)
  });*/
  var lightJobs = [];
  for (var i in jobs){
    lightJobs.push({
        'id': jobs[i].jobId,
        'status': jobs[i].status,
        'process': jobs[i].process,
        'queue': jobs[i].caller,
        'priority': jobs[i].priority
    })
  }
  sendJSONresponse(res, 200, {
      "jobs": JSON.stringify(lightJobs)
    });
};


/* GET a job by the id */
module.exports.jobsReadOne = function(req, res) {
  var job = fifo.getJobById(req.params.jobid, "api");
  sendJSONresponse(res, 200, {
    "job": JSON.stringify(job)
  });
};


/* POST a new job */
/* /api/jobs */
module.exports.addNewJob = function(req, res) {
  var form = new multiparty.Form();
  form.parse(req, function(err, fields, files) {
    machine.checkIfMachineConfigured(function(err, machine) {
    if (err) throw (err);
    if (!machine) {
      sendJSONresponse(res, 200, {
        "message": "Machine isn't configured"
      });
    } else {
      req.body = req.query
      formCheck.setDefaultValuesIfNull(req, machine);
      var errors = formCheck.checkJSON(req, machine);
      if (errors) {
        sendJSONresponse(res, 200, {
          "message": JSON.stringify(errors)
        });
      } else {
        var job = req.body;
        job.userId = req.user._id;
        job.jobId = uuid();
        job.status = 'pending'; //status: pending, approved, rejected
        if (files && files.file && files.file[0]) {
            if (!files.file[0].path.endsWith(".png")) {
                sendJSONresponse(res, 200, {"message": "Unsupported graphic format"});
            } else {
                var newPath = path.join(__dirname, '/../../public/uploads/designs/local') + '/' + req.user._id+ '/' + job.jobId ;
                if (fs.existsSync(path.join(__dirname, '/../../public/uploads/designs/local') + '/' + req.user._id) == false) {
                    fs.mkdirParent(path.join(__dirname, '/../../public/uploads/designs/local') + '/' + req.user._id, null, function(err){
                        if (err) {
                            sendJSONresponse(res, 200, err);
                        }else{
                            move(files.file[0].path, newPath, function(){
                                job.jobPath = newPath;
                                fifo.push(job, "api", function(err, job) {
                                    if (err) {
                                        sendJSONresponse(res, 200, err);
                                    } else {
                                        sendJSONresponse(res, 200, {"jobId": job.jobId});
                                    }
                                });
                            });
                        }
                    });
                }else{
                    move(files.file[0].path, newPath, function(){
                        job.jobPath = newPath;
                        fifo.push(job, "api", function(err, job) {
                            if (err) {
                                sendJSONresponse(res, 200, err);
                            } else {
                                sendJSONresponse(res, 200, {"jobId": job.jobId});
                            }
                        });
                    });
                }
            }
        } else {
            sendJSONresponse(res, 200, {"message": "Missing attachment"});
        }
      }
    }
    });
  });
};

/* PUT /api/jobs/:jobid */
module.exports.jobsUpdateOne = function(req, res) {
  machine.checkIfMachineConfigured(function(err, machine) {
    if (err) throw (err);
    if (!machine) {
      sendJSONresponse(res, 200, {
        "message": "Machine isn't configured"
      });
    } else {
      if (Object.keys(req.body).length === 0){
        req.body = req.query
      }
      formCheck.setDefaultValuesIfNull(req, machine);
      var errors = formCheck.checkJSON(req, machine);
      if (errors) {
        sendJSONresponse(res, 200, {
          "message": JSON.stringify(errors)
        });
      } else {
        req.body.jobId = req.params.jobid;
        fifo.update(req.body, "api", function(err, jobUpdated) {
          if (err) {
            sendJSONresponse(res, 200, err);
          } else {
            sendJSONresponse(res, 200, {
              "job": JSON.stringify(jobUpdated)
            });
          }
        });
      }
    }
  });
};

/* DELETE /api/jobs/:jobid */
module.exports.jobsDeleteOne = function(req, res) {
  fifo.removeJob(req.params.jobid, "api", function(err, deletedJob) {
    if (err) throw (err);
    sendJSONresponse(res, 200, {
      "job": JSON.stringify(deletedJob)
    });
  });
};

/* POST /api/machine */
module.exports.setMachine = function(req, res) {
  if (Object.keys(req.body).length === 0){
    req.body = req.query
  }
  var newConfiguration = {
    vendor: req.body.vendor,
    type: req.body.type,
    name: req.body.name,
    isConfigured: true,
    adcDevice: req.body.adcDevice,
    deviceUri: req.body.deviceUri
  };
  machine.updateMachine(newConfiguration, function(err, machine) {
    if (err) {
      throw err;
      sendJSONresponse(res, 500, {
        "error": err
      });
    } else {
      sendJSONresponse(res, 200, {
        "message": "Machine updated successfully"
      });
    }

  });
};

/* GET /api/machine */
module.exports.getMachine = function(req, res) {
  machine.checkIfMachineConfigured(function(err, machineObj){
    var retMachine = {
        'machineId': machineObj._id,
        'type': machineObj.type,
        'vendor': machineObj.vendor
    }
  	if (err) {
          throw err;
          sendJSONresponse(res, 500, {
            "error": err
          });
        } else {
          sendJSONresponse(res, 200, {
            "machine": JSON.stringify(retMachine)
          });
        }
  });
};

function move(oldPath, newPath, callback) {
    fs.rename(oldPath, newPath, function (err) {
        if (err) {
            if (err.code === 'EXDEV') {
                copy();
            } else {
                callback(err);
            }
            return;
        }
        callback();
    });

    function copy() {
        var readStream = fs.createReadStream(oldPath);
        var writeStream = fs.createWriteStream(newPath);

        readStream.on('error', callback);
        writeStream.on('error', callback);

        readStream.on('close', function () {
            fs.unlink(oldPath, callback);
        });

        readStream.pipe(writeStream);
    }
}

fs.mkdirParent = function(dirPath, mode, callback) {
  //Call the standard fs.mkdir
  fs.mkdir(dirPath, mode, function(error) {
    //When it fail in this way, do the custom steps
    if (error && error.errno === 34) {
      //Create all the parents recursively
      fs.mkdirParent(path.dirname(dirPath), mode, callback);
      //And then the directory
      fs.mkdirParent(dirPath, mode, callback);
    }
    //Manually run the callback since we used our own callback to do all these
    callback && callback(error);
  });
};
