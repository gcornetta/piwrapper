var machine = require('../../models/machine');
var fifo = require('../../app').fifo;
var formCheck = require('../../common/form-check');
const uuid = require('uuid/v4');
var multiparty = require('multiparty');
var util = require('util');
var fs = require('fs');
var path = require('path');

var pendingJobs = {};

var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

/* GET list of queued jobs */
module.exports.getQueuedJobs = function(req, res) {
  var jobs = fifo.getJobs();
  sendJSONresponse(res, 200, {
    "jobs": JSON.stringify(jobs)
  });
};


/* GET a job by the id */
module.exports.jobsReadOne = function(req, res) {
  var job = fifo.getJobById(req.params.jobid, "api");
  sendJSONresponse(res, 200, {
    "job": JSON.stringify(job)
  });
};


/* POST job file */
module.exports.addJobFile = function(req, res) {
  var form = new multiparty.Form();
  form.parse(req, function(err, fields, files) {
    if (files) {
      var newPath = path.join(__dirname, '/../../public/uploads/designs/local') + '/' + req.user._id+ '/' + req.params.jobid ;
      if (fs.existsSync(path.join(__dirname, '/../../public/uploads/designs/local') + '/' + req.user._id) == false) {
        fs.mkdirSync(path.join(__dirname, '/../../public/uploads/designs/local') + '/' + req.user._id);
      }
      move(files.file[0].path, newPath, function(){
        if (addFilePath(req.params.jobid, newPath)) {
            fifo.push(pendingJobs[req.params.jobid], "api", function(err, job) {
                if (err) {
                    sendJSONresponse(res, 200, err);
                } else {
                    delete pendingJobs[req.params.jobid];
                    sendJSONresponse(res, 200, {
                        "message": "File added"
                    });
                }
            });
            } else {
                sendJSONresponse(res, 200, {
                    "message": "Job don't exist or isn't pending"
                });
            }
      });
    } else {
      sendJSONresponse(res, 200, {
        "message": "Missing attachment"
      });
    }
  });

};

/* POST a new job */
/* /api/jobs */
module.exports.addNewJob = function(req, res) {
  machine.checkIfMachineConfigured(function(err, machine) {
    if (err) throw (err);
    if (!machine) {
      sendJSONresponse(res, 200, {
        "message": "Machine isn't configured"
      });
    } else {
      formCheck.setDefaultValuesIfNull(req, machine);
      var errors = formCheck.checkJSON(req, machine);
      if (errors) {
        sendJSONresponse(res, 200, {
          "message": JSON.stringify(errors)
        });
      } else {
        req.body.userId = req.user._id;
        addToPendingJobs(req.body);
        sendJSONresponse(res, 200, {
          "jobId": req.body.jobId
        });
      }
    }
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
    if (!deletedJob) { //Job doesn't have already a file and isn't in fifo queue
      deletedJob = pendingJobs[req.params.jobid];
    }
    delete pendingJobs[req.params.jobid];
    sendJSONresponse(res, 200, {
      "job": JSON.stringify(deletedJob)
    });
  });
};

/* POST /api/machine */
module.exports.setMachine = function(req, res) {
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
  machine.checkIfMachineConfigured(function(err, machine){
    console.log(machine)
  	if (err) {
          throw err;
          sendJSONresponse(res, 500, {
            "error": err
          });
        } else {
          sendJSONresponse(res, 200, {
            "machine": JSON.stringify(machine)
          });
        }
  });
};

function addToPendingJobs(job, id) {
  //job.userId = req.user._id;
  job.jobId = id || uuid();
  job.status = 'pending'; //status: pending, approved, rejected
  if (pendingJobs[job.jobId]) {
    job.jobPath = pendingJobs[job.jobId].jobPath;
  }
  pendingJobs[job.jobId] = job;
  //fifo.push(job, job.jobPath);
}

function addFilePath(jobId, filePath) {
  if (pendingJobs[jobId]) {
    pendingJobs[jobId].jobPath = filePath;
    return true;
  }
  return false;
}

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
