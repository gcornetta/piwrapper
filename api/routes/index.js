var express = require('express');
var router = express.Router();

var jobsCtrl = require('../controllers/jobs');

// jobs (todo: protect routes)
router.get('/jobs', jobsCtrl.getQueuedJobs);
router.post('/jobs', jobsCtrl.addNewJob);
router.get('/jobs/:jobid', jobsCtrl.jobsReadOne);
router.put('/jobs/:jobid', jobsCtrl.jobsUpdateOne);
router.delete('/jobs/:jobid', jobsCtrl.jobsDeleteOne);

module.exports = router
 