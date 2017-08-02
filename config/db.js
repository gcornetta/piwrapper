var mongoose = require('mongoose');
var winston = require('winston');
var gracefulShutdown;
var dbURI = 'mongodb://piwrapper.local/usersDB';

mongoose.connect(dbURI);

//Connection events
//Monitoring for successful connection through mongoose
mongoose.connection.on('connected', function(){
  winston.log('info', 'Mongoose connected to %s', dbURI);
});

//Checking for connection error
mongoose.connection.on('error', function(err){
  winston.log('error', 'Mongoose connection error %s', err);
});

//Checking for disconnection event
mongoose.connection.on('disconnected', function() {
  winston.info('Mongoose disconnected');
});

//Capture App termination/restart events
//To be called when process is restarted or terminated
gracefulShutdown = function(msg, callback){
  mongoose.connection.close(function(){
    winston.log('info', 'Mongoose disconnected through %s', msg);
    callback();
  });
};

//Listen to SIGUSR2 which is what nodemon uses
process.once('SIGUSR2', function(){
  gracefulShutdown('nodemon restart', function(){
    process.kill(process.pid, 'SIGUSR2');
  });
});

//Listen to SIGINT emitted on application termination
process.on('SIGINT', function(){
  gracefulShutdown('app termination', function(){
    process.exit(0);
  });
});

//Bring in your schemas and models
require('../models/user');
require('../models/machine');
