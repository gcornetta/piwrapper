'use strict';

var server = require('../../app').server
var eventEmitter = require('../../app').eventEmitter
var WebTerm = require('../webterm/webterm');
var SysInfo = require('../os/os');
var logger = require('../../config/winston') 
var socketio = require('socket.io');
var fifo = require('../../app').fifo;
var siren = require('../siren/siren');
var WebSocket = require('ws');

// Handle socket connections

module.exports.ws = function(server, eventEmitter){
    var io = socketio.listen(server);
    
    io.sockets.on("connection", function(socket) {
        logger.info('@websockets.ws.terminal: Connection established with the client');
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

        socket.on('subscribeJobUpdates', function(data){
          socket.join('jobUpdates');
          var jobs = fifo.getJobs();
          socket.emit('clearTable');
          for (var job in jobs){
            socket.emit('addJob', jobs[job]);
          }
        });

        socket.on('acceptJob', function(jobId){
            fifo.acceptJob(jobId, function (err, job){
                if (!err){
                    socket.emit('updateJob', fifo.getJobById(jobId));
                }
            });
        });

        socket.on('removeJob', function(jobId){
            fifo.removeJob(jobId, null, function(err, job){
                if (!err){
                    socket.emit('deleteJob', job.jobId);
                }
            })
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
      logger.info('@websockets.ws.dashboard: Connection established with the client');

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
    logger.info('@websockets.ws.logger: Connection established with the client');
     
    socket.on('ready', function () {
      logger.on('logging', function ( transport, level, msg, meta) {
        var timestamp = new Date()
        var log = {timestamp: timestamp, level: level, message: msg} 
        syslogger.emit('newLog', log)
      })     
    })
  
      const ws = new WebSocket('ws://piwrapper.local:1337/peer-management')
   
      ws.on('message', function (log) {
        var response = JSON.parse(log)
        var msg = 'Peer connection error ' + '(' + response.data.url + ') ' + response.data.error.syscall + ' ' + response.data.error.code
        syslogger.emit('newLog', {timestamp: response.timestamp, level: 'error', message: msg })
        });
    });

  var progress = io.of('/progress');
    
  progress.on('connection', function(socket){      
      logger.info('@websockets.ws.progress: Connection established with the client');

      eventEmitter.on('upload-progress', function(percent) {   
         socket.emit('progress-update', {progress : percent});
      });  
   	
});
 
 var deviceCurrent = io.of('/devCurrent');
 
 deviceCurrent.on('connection', function(socket){
      logger.info('@websockets.ws.deviceCurrent: Connection established with the client');

      crawl(function (link) {
        const ws = new WebSocket(link.currentSocket)

        ws.on('message', function (sample) {
          deviceCurrent.emit('new-sample', JSON.parse(sample))
        });
      })


});

 var deviceStatus = io.of('/devStatus');

 deviceStatus.on('connection', function(socket){
      logger.info('@websockets.ws.deviceStatus: Connection established with the client');
      
     crawl(function (link) {
       const ws = new WebSocket(link.stateSocket)

       ws.on('message', function (state) {
         deviceStatus.emit('new-state', JSON.parse(state))
       });
     })
});


setInterval(function(){
        SysInfo.getSystemInfo(function (info){ 
		dashboard.emit('uptime-updated', toHms(info.uptime));
	});
    }, 1000);

    return io;
}

var toHms = function(secs) {
  s = Number(secs);
  var h = Math.floor(secs / 3600);
  var m = Math.floor(secs % 3600 / 60);
  var s = Math.floor(secs % 3600 % 60);
  return {hours : h, minutes : m, seconds : s};
}

 
var crawl = function (callback) {
  var wrapperLink
  var deviceLink

  siren.connect('http://piwrapper.local:1337/', conn => {                                                                            
    if (conn.err == null) {                                                                                                                      
       conn.entity.data.links
         .filter(link => link.title !== undefined && link.title.includes('machine-wrapper'))
         .map(link => link.href)
         .forEach(href => siren.connect(href, conn => {
           wrapperLink  = href
           siren.connect(wrapperLink, conn => {
             deviceLink = conn.entity.data.entities[0].links[0].href           
             siren.connect(deviceLink, conn => {
                callback({stateSocket:  conn.entity.data.links[4].href, currentSocket: conn.entity.data.links[3].href})              
             })
           })
         })
        )                                                                                                                                 
    }                                                    
  })
}
