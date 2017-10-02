var os = require('os');
var cpuStat = require('cpu-stat');
var logger = require('../../config/winston') 

module.exports.getSystemInfo = function(callback) {
	var sysInfo = {
                arch    : os.arch(),
                cpus    : os.cpus(),   
                freemem : os.freemem(),
                loadavg : os.loadavg(),
                platform: os.platform(),
                release : os.release(),
                totalmem: os.totalmem(),
                type    : os.type(),
                uptime  : os.uptime()
	};
        callback(sysInfo);
}


module.exports.getCoresNum = function() {
	return cpuStat.totalCores();
}

module.exports.getCoresClk = function() {
        cpuClk = []; 

	for (var i = 0; i<cpuStat.totalCores(); i++) {
		cpuClk [i] = cpuStat.clockMHz(i); 
	}
        return cpuClk;
}

module.exports.getAvgClk = function () {
        return cpuStat.avgClockMHz();
}


module.exports.getCoreUsage = function (coreNum, callback) {
      cpuStat.usagePercent({coreIndex: coreNum, sampleMs: 1000}, function(err, percent, seconds) {
               	if (err) 
                  logger.error ('@os.getCoreUsage. Error: ' + err); 
                else 
		 callback (parseFloat(percent)/100);
	});
}

