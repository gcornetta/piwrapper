var formidable = require('formidable');
var fs = require('fs');
var path = require('path');
var Machine = require('../models/machine');
var logger = require('../config/winston') 
var fifo = require('../app').fifo;
var eventEmitter = require('../app').eventEmitter;
var sync = require('synchronize');
var dashboard = require('./lib/dashboard');
const uuid = require('uuid/v4');
var formCheck = require('../common/form-check');
var mkdirp = require('mkdirp');

var dashboardPage = dashboard.dashboardPage;
var panelNames    = dashboard.panelNames;
var validationMsg = dashboard.validationMsg;

var jobCounter = [];

module.exports.controller = function (req, res) {

dashboardPage.displayProfile = false;
dashboardPage.displayWizard = false;
dashboardPage.displayTerminal = false;
dashboardPage.displaySettings = false;
dashboardPage.displayLogs = false;
dashboardPage.uploadSuccess = false;
dashboardPage.displayJobsTable = false;
dashboardPage.displayMonitor = false
dashboardPage.displayControl = true;
dashboardPage.currentPanelName = panelNames.control;
dashboardPage.currentPanelRoute = '/dashboard/control/3dprint/prusa';

Machine.checkIfMachineConfigured(function(err, machine){
	if (err) throw (err);
	if (!dashboardPage.userName){
	    res.redirect('/dashboard');
	}else{
	    dashboardPage.errors = null;
	    dashboardPage.machine = { name      : machine.name,
        	                  type      : machine.type,
                	          vendor    : machine.vendor,
                        	  adcVendor : machine.adcDevice[0].vendor,
                          	  adcDevice : machine.adcDevice[0].device
        	        	} ;
         res.render('dashboard', dashboardPage);
    }
});
}

var _validate = function (req, res) {
        var path = req.body.path;
        req.checkBody('path', validationMsg.path).notEmpty();
	    var errors = formCheck.checkJSON(req, dashboardPage.machine);

        if ( path != undefined && !(path.endsWith(".gcode"))) {
           if(!errors) {
              errors = [{param : 'vendor', msg : 'Unsupported file format'}];
           } else {  
              errors.push({param : 'vendor', msg : 'Unsupported file format'});
           } 
        } 
        
        if (errors.length == undefined) 
           return [];
        else
           return errors;
}

module.exports.upload = function (req, res) {
  // create an incoming form object
  var form = new formidable.IncomingForm();
  var newFileName;
  var fifoData = {};
  var fields = [];

  dashboardPage.uploadSuccess = false;

  // specify that we want to allow the user to upload only one file in a single request
  form.multiples = false;
  
  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  form.on('file', function(field, file) {
    var fileExt = (file.name).split('.').pop();
    if (fileExt != "") {
      var jobPath = path.join(__dirname, '/../public/uploads/designs/local') + '/' + req.user._id;
      if (fs.existsSync(jobPath) == false) {
        mkdirp.sync(jobPath);
      }
      fifoData.jobId = uuid();
      form.uploadDir = jobPath;
      newFileName = fifoData.jobId + '.' + fileExt;

      fs.readFile(file.path, function (err, data) {
              if (err) throw err;
              fs.writeFile(path.join(jobPath, newFileName), data, function (err) {
                  if (err) console.log(err);
              });
              fs.unlink(file.path, function (err) {
                  if (err) console.log(err);
              });
            });

      fifoData.jobPath = path.join(jobPath, newFileName);
      req.body.path = fifoData.jobPath;
      req.body.filename = newFileName;
    } else {
      req.body.path ="";
    } 
  });

    form.on('field', function (field, value) {
        fields[field] = value;
        //add form info to req object
        switch (field) {
        //Machines
           case 'machine'        : req.body.machine = value;
                                   break;
        }
        for (var f in fields){
            fifoData[f] = fields[f];
        }
    });

    //Callback for file upload progress.
    form.on('progress', function (bytesReceived, bytesExpected) {
        var percent = Math.round((bytesReceived/bytesExpected)*100);
        (res.eventEmitter).emit('upload-progress', percent);
    });

     // once all the files have been uploaded, send a response to the client
     form.on('end', function() {
        sync.fiber(function () {
          errors = _validate(req, res);
          if(errors.length >0){
           dashboardPage.errors = errors;
           setTimeout(function(){res.render('dashboard', dashboardPage);}, 1000);
          } else {
            dashboardPage.errors = null;
            fifoData.userId = req.user._id;
            fifoData.username = req.user.username;
            fifoData.status = 'pending'; //status: pending, approved, rejected
            fifo.push(fifoData, "local", function(err, job){
                            if (err){
                                logger.error('@controllers.prusa_3dprint: '+err.err);
                                dashboardPage.errors = [{ param: 'jobs', msg: err.err, value: undefined }];
                            }else{
                                dashboardPage.uploadSuccess = true;
                                var uploadMessage = 'Design succsessfully uploaded to /public/uploads/designs/local. ' + 'User id: ' + req.user._id + ' File: ' +  req.body.filename;
                                req.flash('success_msg', uploadMessage);
                                var flashUpload = req.flash('success_msg')[0];
                                dashboardPage.flashUpload = flashUpload;
                                req.session.flash = [];
                            }
                            setTimeout(function(){res.render('dashboard', dashboardPage);}, 1000);
                        });
         }
       });
     });


  // log any errors that occur
  form.on('error', function(err) {
    logger.log('error', '@dashboard.uploadJob: an error has occured: %s', err);
  });

  // parse the incoming request containing the form data
  form.parse(req);

}
