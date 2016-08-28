var request = require('request');

var apiOptions = {
  server : "http://localhost:8888"
};


var _showError = function (req, res, status) {
  var title, content;
  if (status === 404) {   //manage 404 error
    title = "404, page not found";
    content = "It looks like we can't find this page. Sorry.";
  } else if (status === 500) {  //manage 500 error
    title = "500, internal server error";
    content = "There's a problem with our server.";
  } else {                //manage other errors
    title = status + ", something's gone wrong";
    content = "Something, somewhere, has gone just a little bit wrong.";
  }
  res.status(status);
  res.render('generic-text', {
    title : title,
    content : content
  });
};

//===============================Each API page should be rendered this way=====================================
var getQueuedJobs = function (req, res, callback) { //accept a callback as a third parameter
  var requestOptions, path;
  path = "/api/jobs/" + req.params.jobid; //Get locationid parameter from URL and append it to API path
  requestOptions = {  //Set all request options needed to call API
    url : apiOptions.server + path,
    method : "GET",
    json : {}
  };
  request(
    requestOptions,
    function(err, response, body) {
      var data = body;  //Create copy of returned data in new variable
      if (response.statusCode === 200) {  //Check for successful response from API
         callback(req, res, data); //Invoke the callback with the data to be rendered
      } else {
        _showError(req, res, response.statusCode);  //if error call _showError
      }
    }
  );
};

var renderDashboard = function (req, res, queuedJobsDetail) {
  res.render('dashboard-test', { //Reference specific items of data as needed in function
    title: queuedJobsDetail.name,
    pageHeader: {title: queuedJobsDetail.name},

    page: queuedJobsDetail //Pass full queuedJobsDetail data object to view
  });
};

module.exports.queuedJobs = function(req, res){
  getQueuedJobs(req, res, function(req, res, responseData) {  // call getQueuedJobs function, passing a callback function
    renderDashboard(req, res, responseData);                   // that will call renderDashboard function upon completion
  });
};

//===============================================================================================================
