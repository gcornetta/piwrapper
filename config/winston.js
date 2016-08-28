var path = require('path');
var winston = require('winston');

var _getTimestamp = function(){
	var d = new Date();

        return (d.getFullYear()).toString() +  
               (d.getMonth()+1).toString()  + 
               (d.getDate()).toString()     + 
               (d.getHours()).toString()    + 
	       (d.getMinutes()).toString()  + 
	       (d.getSeconds()).toString();  
}

//path to log file
var logfile = path.resolve(__dirname, '../logs/' + _getTimestamp().toString() + '.log');

winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
            level: 'info',
            timestamp: true,
            colorize: true
});
winston.add(winston.transports.File, {
            level: 'info',
            filename: logfile,
            timestamp: true,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: true
        });

//conflicts with File transport
/*require('winston-redis').Redis;
winston.add(winston.transports.Redis, {
	    host: 'http://localhost',
	    port:  6379,
	    auth: 'none'
});*/

