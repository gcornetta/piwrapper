var formidable = require('formidable');
var fs = require('fs');
var path = require('path');
var Machine = require('../models/machine');
var winston = require('winston');
var fifo = require('../lib/fifo/jobFIFO');
var eventEmitter = require('../app').eventEmitter;
var sync = require('synchronize');
var dashboard = require('./lib/dashboard');

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
dashboardPage.displayControl = true;
dashboardPage.currentPanelName = panelNames.control;
dashboardPage.currentPanelRoute = '/dashboard/control/milling/roland';

Machine.checkIfMachineConfigured(function(err, machine){
	if (err) throw (err);
	dashboardPage.machine = { name      : machine.name,
        	                  type      : machine.type,
                	          vendor    : machine.vendor,
                        	  adcVendor : machine.adcDevice[0].vendor,
                          	  adcDevice : machine.adcDevice[0].device
        	        	} ;
         res.render('dashboard', dashboardPage);
      	});               
}

var _validate = function (req, res) {
        errors = [];
  
 	var process = req.body.process;
        var diameter = req.body.diameter;
        var overlap = req.body.overlap;
        var error = req.body.error;
        var threshold = req.body.threshold;
        var merge = req.body.merge;
        var order = req.body.order;
        var sequence = req.body.sequence;
        var process = req.body.process;
        
        var force = req.body.force;
        var velocity = req.body.velocity;
        var xCoord = req.body.xCoord;
        var yCoord = req.body.yCoord;
   
        var path = req.body.path;;

    
	// Validation
        req.checkBody('path', validationMsg.path).notEmpty();
        req.checkBody('material', validationMsg.material).notEmpty();

        req.checkBody('diameter', validationMsg.diameter).notEmpty().isDecimal();
        req.checkBody('offsets', validationMsg.offsets).notEmpty().isInt();
        req.checkBody('overlap', validationMsg.overlap).notEmpty().isInt({ min: 1, max: 100 });
        req.checkBody('error', validationMsg.error).notEmpty().isDecimal();
        req.checkBody('threshold', validationMsg.threshold).notEmpty().isFloat({ min: 0, max: 1 });
        req.checkBody('merge', validationMsg.merge).notEmpty().isDecimal();
        req.checkBody('order', validationMsg.order).notEmpty().isInt();
        req.checkBody('sequence', validationMsg.sequence).notEmpty().isInt();

          
         req.checkBody('force', validationMsg.power).notEmpty().isInt({ min: 1, max: 100 });
         req.checkBody('velocity', validationMsg.speed).notEmpty().isInt({ min: 1, max: 100 });
         req.checkBody('xCoord', validationMsg.xCoord).notEmpty().isInt({ min: 0, max: 50 });
         req.checkBody('yCoord', validationMsg.yCoord).notEmpty().isInt({ min: 0, max: 50 });

	var errors = req.validationErrors();  

        if ( path != undefined && !(path.endsWith(".png") || path.endsWith(".svg"))) {
           if(!errors) {
              errors = [{param : 'vendor', msg : 'Unsupported graphic format'}];
           } else {  
              errors.push({param : 'vendor', msg : 'Unsupported graphic format'});
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
      // store all uploads in the upload directory
      if (jobCounter[req.user._id] != undefined) {
         (jobCounter[req.user._id].counter)++;  //increment counter
      } else {
         var job = {};
         job.counter = 1;
         job.path = path.join(__dirname, '/../public/uploads/designs/local') + '/' + req.user._id;
         if (fs.existsSync(job.path) == false) {
            fs.mkdirSync(job.path);
         }
         jobCounter[req.user._id] = job;   
      }
      form.uploadDir = jobCounter[req.user._id].path;

      newFileName = (jobCounter[req.user._id].counter).toString() + '.' + fileExt;
      fs.rename(file.path, path.join(jobCounter[req.user._id].path, newFileName)); 
      fifoData.jobPath = path.join(jobCounter[req.user._id].path, newFileName);
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
           case 'diameter'        : req.body.diameter = value; 
                                    break;
           case 'offsets'         : req.body.offsets = value; 
                                    break;
           case 'overlap'         : req.body.overlap = value; 
                                    break;
           case 'error'           : req.body.error = value; 
                                    break;
           case 'threshold'       : req.body.threshold = value; 
                                    break;
           case 'merge'           : req.body.merge = value; 
                                    break;
           case 'order'           : req.body.order = value; 
                                    break;
           case 'sequence'        : req.body.sequence = value; 
                                    break;
           case 'force'           : req.body.power = value; 
                                    break;
           case 'velocity'        : req.body.speed = value; 
                                    break;
           case 'switchSort'      : req.body.switchSort = value; 
                                    break;
           case 'xCoord'          : req.body.xCoord = value; 
                                    break;
           case 'yCoord'          : req.body.yCoord = value; 
                                    break;
           case 'origin'          : req.body.origin = value; 
                                    break;
           case 'material'        : req.body.material = value; 
                                    break;
        }
        fifoData.form = fields;
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
          console.log(JSON.stringify(errors));
          if(errors.length >0){
           dashboardPage.errors = errors;
          } else {
            dashboardPage.errors = null; 
            fifoData.userId = req.user._id;
            fifoData.status = 'pending'; //status: pending, approved, rejected
            fifo.push(fifoData, fifoData.jobPath);
            dashboardPage.uploadSuccess = true; 
            var uploadMessage = 'Design succsessfully uploaded to /public/uploads/designs/local. ' + 'User id: ' + req.user._id + ' File: ' +  req.body.filename;
            req.flash('success_msg', uploadMessage);
            var flashUpload = req.flash('success_msg')[0];                       
            dashboardPage.flashUpload = flashUpload;
            req.session.flash = [];
         }
           
           setTimeout(function(){res.render('dashboard', dashboardPage);}, 1000);
       });
     });


  // log any errors that occur
  form.on('error', function(err) {
    winston.log('error', '@dashboard.uploadJob: an error has occured: %s', err);
  });

  // parse the incoming request containing the form data
  form.parse(req);

}



module.exports.process = function (req, res) {

   dashboardPage.currentPanelName = panelNames.control;
   dashboardPage.currentPanelRoute = '/dashboard/control';
   winston.info('@dashboard.process: the process selected is ' + req.query.process);

   if (req.query.material == 'vinyl') {
      res.render('partials/process/vinyl-cutters/roland/cut-vinyl', dashboardPage);
   }
   if (req.query.material == 'epoxy') {
      res.render('partials/process/vinyl-cutters/roland/cut-epoxy', dashboardPage);
   }
   if (req.query.material == 'copper') {
      res.render('partials/process/vinyl-cutters/roland/cut-copper', dashboardPage);
   }
}