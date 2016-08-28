var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
}; 



/* GET list of queued jobs */
module.exports.getQueuedJobs = function(req, res) {
   sendJSONresponse(res, 200, {
      "message": "getQueuedJobs to be implemented"
    });
};



/* GET a job by the id */
module.exports.jobsReadOne = function(req, res) {
   sendJSONresponse(res, 200, {
      "message": "jobsReadOne to be implemented"
    });
};

/* POST a new job */
/* /api/jobs */
module.exports.addNewJob = function(req, res) {
  sendJSONresponse(res, 200, {
      "message": "addNewJob to be implemented"
    });
};

/* PUT /api/jobs/:jobid */
module.exports.jobsUpdateOne = function(req, res) {
   sendJSONresponse(res, 200, {
      "message": "jobsUpdateOne to be implemented"
    });
};

/* DELETE /api/jobs/:jobid */
module.exports.jobsDeleteOne = function(req, res) {
     sendJSONresponse(res, 200, {
      "message": "jobsDeleteOne to be implemented"
    });
};
