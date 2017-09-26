var path = require('path');
var winston = require('winston');
var strftime = require('strftime');
var colors = require('colors');

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

const timestamp = function() {
    return strftime('%b-%d-%Y %H:%M:%S ', new Date()).green;
};

const logFormatter = function(options) {
    // Return string will be passed to logger.

    return options.timestamp() + ('[' + options.level +']').blue +
        ` `+ (options.message ? options.message : ``).blue +
        (options.meta && Object.keys(options.meta).length ?
            `\n\t`+ JSON.stringify(options.meta) : `` ).blue;
};


winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
            level: 'debug',
            timestamp: timestamp,
            formatter: logFormatter,
            colorize: true
});
winston.add(winston.transports.File, {
            level: 'info',
            filename: logfile,
            timestamp: timestamp,
            formatter: logFormatter,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: true,
	    json: false
        });

//conflicts with File transport
/*require('winston-redis').Redis;
winston.add(winston.transports.Redis, {
	    host: 'http://localhost',
	    port:  6379,
	    auth: 'none'
});*/

