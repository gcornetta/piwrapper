var machine = require('../../models/machine');
var fifo = require('../../app').fifo;
var formCheck = require('../../common/form-check');
const uuid = require('uuid/v4');
var formidable = require('formidable')
var util = require('util');
var fs = require('fs');
var mkdirp = require('mkdirp')
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
      jobs: lightJobs
    });
};


/* GET a job by the id */
module.exports.jobsReadOne = function(req, res) {
  var job = fifo.getJobById(req.params.jobid, "global");
  sendJSONresponse(res, 200, {
    job: job
  });
};


/* POST a new job */
/* /api/jobs */
module.exports.addNewJob = function(req, res) {

  var form = new formidable.IncomingForm()                                                                                                   
  form.keepExtensions = true                                                                                                                 

  form.parse(req, function(err, fields, files) {
    machine.checkIfMachineConfigured(function(err, machine) {
    if (!machine) {
      sendJSONresponse(res, 200, {
        code: 20,
        message: 'Machine not found',
        details: err
      });
    } else {
      req.body = req.query
      formCheck.setDefaultValuesIfNull(req, machine);
      var errors = formCheck.checkJSON(req, machine);
      if (errors) {
        sendJSONresponse(res, 200, {
          code: 21,
          message: 'Bad request',
          details: errors
        });
      } else {
        var job = req.body;
        job.userId = job.user || req.user._id;
        delete job.user;
        job.jobId = uuid();
        job.status = 'pending'; //status: pending, approved, rejected
        if (files && files.file) {
            var format;
            if (machine.type === "3D printer"){
                format = ".gcode";
            }else{
                format = ".png";
            }
            if (!files.file.path.endsWith(format)) {
                sendJSONresponse(res, 200, {
                  code: 22,
                  message: 'Unsupported file format',
                  details: files.file
                });
            } else {
                var newPath = path.join(__dirname, '/../../public/uploads/designs/global') + '/' + req.user._id+ '/' + job.jobId ;
                if (fs.existsSync(path.join(__dirname, '/../../public/uploads/designs/global') + '/' + req.user._id) == false) {
                    mkdirp(path.join(__dirname, '/../../public/uploads/designs/global') + '/' + req.user._id, function(err){
                        if (err) {
                            sendJSONresponse(res, 200, {
                                code: 23,
                                message: 'Mkdirp error',
                                details: err
                            });
                        }else{
                            move(files.file.path, newPath, function(){
                                if (files.auxFile){
                                    move(files.auxFile.path, newPath+"_aux", function(){
                                        job.auxFile = newPath+"_aux";
                                        job.jobPath = newPath;
                                        fifo.push(job, "global", function(err, job) {
                                            if (err) {
                                                sendJSONresponse(res, 200, {
                                                    code: 24,
                                                    message: 'Fifo error',
                                                    details: err
                                                });
                                            } else {
                                                sendJSONresponse(res, 200, {jobId: job.jobId});
                                            }
                                        });
                                    })
                                }else{
                                    job.jobPath = newPath;
                                    fifo.push(job, "global", function(err, job) {
                                        if (err) {
                                            sendJSONresponse(res, 200, {
                                                code: 24,
                                                message: 'Fifo error',
                                                details: err
                                            });
                                        } else {
                                            sendJSONresponse(res, 200, {jobId: job.jobId});
                                        }
                                    });
                                }
                            });
                        }
                    });
                }else{
                    move(files.file.path, newPath, function(){
                                if (files.auxFile){
                                    move(files.auxFile.path, newPath+"_aux", function(){
                                        job.auxFile = newPath+"_aux";
                                        job.jobPath = newPath;
                                        fifo.push(job, "global", function(err, job) {
                                            if (err) {
                                                sendJSONresponse(res, 200, {
                                                    code: 24,
                                                    message: 'Fifo error',
                                                    details: err
                                                });
                                            } else {
                                                sendJSONresponse(res, 200, {jobId: job.jobId});
                                            }
                                        });
                                    })
                                }else{
                                    job.jobPath = newPath;
                                    fifo.push(job, "global", function(err, job) {
                                        if (err) {
                                            sendJSONresponse(res, 200, {
                                                code: 24,
                                                message: 'Fifo error',
                                                details: err
                                            });
                                        } else {
                                            sendJSONresponse(res, 200, {jobId: job.jobId});
                                        }
                                    });
                                }
                    });
                }
            }
        } else {
            sendJSONresponse(res, 200, {
                code: 25,
                message: 'Missing attachment',
                details: files
            });
        }
      }
    }
    });
  });
};

/* PUT /api/jobs/:jobid */
module.exports.jobsUpdateOne = function(req, res) {
  machine.checkIfMachineConfigured(function(err, machine) {
    if (!machine) {
      sendJSONresponse(res, 200, {
        code: 20,
        message: 'Machine not found',
        details: err
      });
    } else {
      if (Object.keys(req.body).length === 0){
        req.body = req.query
      }
      formCheck.setDefaultValuesIfNull(req, machine);
      var errors = formCheck.checkJSON(req, machine);
      if (errors) {
        sendJSONresponse(res, 200, {
          code: 21,
          message: 'Bad request',
          details: errors
        });
      } else {
        req.body.jobId = req.params.jobid;
        fifo.update(req.body, 'api', function(err, jobUpdated) {
          if (err) {
            sendJSONresponse(res, 200, {
                code: 24,
                message: 'Fifo error',
                details: err
            });
          } else {
            sendJSONresponse(res, 200, {
              job: jobUpdated
            });
          }
        });
      }
    }
  });
};

/* DELETE /api/jobs/:jobid */
module.exports.jobsDeleteOne = function(req, res) {
  fifo.removeJob(req.params.jobid, 'api', function(err, deletedJob) {
    if (err) {
        sendJSONresponse(res, 200, {
            code: 24,
            message: 'Fifo error',
            details: err
        });
    }else{
        sendJSONresponse(res, 200, {
            message: 'OK',
            details: "Job deleted successfully"
        });
    }
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
      deviceUri: req.body.deviceUri,
      hysteresis: req.body.hysteresis,
      dutyCycle: req.body.dutyCycle,
      baudRate: req.body.baudRate,
      sampleTime: req.body.sampleTime,
      threshCurr: req.body.threshCurr
  };
  machine.updateMachine(newConfiguration, function(err, machine) {
    if (err) {
      sendJSONresponse(res, 500, {
        code: 26,
        message: 'Machine update error',
        details: err
        });
    } else {
      sendJSONresponse(res, 200, {
        message: 'Machine updated successfully'
      });
    }

  });
};

/* GET /api/machine */
module.exports.getMachine = function(req, res) {
  machine.checkIfMachineConfigured(function(err, machineObj){
    var retMachine = {
        machineId: machineObj._id,
        type: machineObj.type,
        vendor: machineObj.vendor
    }
  	if (err) {
          sendJSONresponse(res, 500, {
            code: 20,
            message: 'Machine not found',
            details: err
          });
        } else {
          sendJSONresponse(res, 200, {
            machine: retMachine
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

