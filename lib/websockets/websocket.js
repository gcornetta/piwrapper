'use strict';

var server = require('../../app').server
var eventEmitter = require('../../app').eventEmitter
var WebTerm = require('../webterm/webterm');
var SysInfo = require('../os/os');
var winston = require('winston');
var socketio = require('socket.io');

// Handle socket connections

module.exports.ws = function(server, eventEmitter){
    var io = socketio.listen(server);
    
    io.sockets.on("connection", function(socket) {
        winston.info('@websockets.ws.terminal: Connection established with the client');
        // One terminal per web-socket
        let req = socket.handshake,
            user = req.user,
            terminal = null;

        socket.on('create', function(cols, rows) {
            WebTerm.readSettings(function (err, settings) {
                terminal = new WebTerm({
                    cols: cols,
                    rows: rows,
                    cwd: process.cwd(),
                    socket: socket,
                    start: settings.general.custom_command || undefined,
                    shell: settings.general.shell || process.env.SHELL || "bash",
                    ptyOpts: {},
                });
              });
        });

        socket.on('dataToServer', function(data) {
            if (!terminal) { return; }
            terminal.data(data);
        });

        socket.on('kill', function() {
            if (!terminal) { return; }
            terminal.kill();
        });

        socket.on('resize', function(cols, rows) {
            if (!terminal) { return; }
            terminal.resize(cols, rows);
        });

        socket.on('disconnect', function() {
            if (!terminal) { return; }
            terminal.kill();
            terminal = null;
        });

    });

var dashboard = io.of('/dashboard');
dashboard.on('connection', function(socket){      
      winston.info('@websockets.ws.dashboard: Connection established with the client');

      socket.on('core0-update', function(msg){
        	SysInfo.getCoreUsage(0, function(percent){
                	dashboard.emit('core0-update', {cpuload : percent}); 
		});
	});

	socket.on('core1-update', function(msg){
        	SysInfo.getCoreUsage(1, function(percent){
                	dashboard.emit('core1-update', {cpuload : percent}); 
		});
	});

	socket.on('core2-update', function(msg){
        	SysInfo.getCoreUsage(2, function(percent){
                	dashboard.emit('core2-update', {cpuload : percent}); 
		});
	});

	socket.on('core3-update', function(msg){
        	SysInfo.getCoreUsage(3, function(percent){
                	dashboard.emit('core3-update', {cpuload : percent}); 
		});
	});
	
});

var syslogger = io.of('/syslogger');
syslogger.on('connection', function(socket){      
      winston.info('@websockets.ws.logger: Connection established with the client');
      /*winston.stream({ start: -1 }).on('log', function(log) {
           syslogger.emit('newLog', log);
     });*/

     socket.on('ready', function(){
	winston.stream({ start: -1 }).on('log', function(log) {
           syslogger.emit('newLog', log);
     	});
     });

    /* socket.on('disconnect', function() {
		dashboard.removeAllListeners('connection');
     });*/

});

  var progress = io.of('/progress');
    
  progress.on('connection', function(socket){      
      winston.info('@websockets.ws.progress: Connection established with the client');

      eventEmitter.on('upload-progress', function(percent) {   
         socket.emit('progress-update', {progress : percent});
      });  
   	
});
 

setInterval(function(){
        SysInfo.getSystemInfo(function (info){ 
		dashboard.emit('uptime-updated', toHms(info.uptime));
	});
    }, 1000);

    return io;
}

var toHms = function(secs)
{
  s = Number(secs);
  var h = Math.floor(secs / 3600);
  var m = Math.floor(secs % 3600 / 60);
  var s = Math.floor(secs % 3600 % 60);
  return {hours : h, minutes : m, seconds : s};
}

 