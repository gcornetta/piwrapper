const {
  exec
} = require('child_process');
var Printer = require('node-printer');

module.exports.discoverPrinters = function(callback) {
  exec('sudo lpinfo -v', (error, stdout, stderr) => {
    if (error) {
        callback(error);
      return;
    }
    if (!stderr) {
      var printers = [];
      var unhandledPrinters = [];
      var lines = stdout.split('\n');
      for (var l in lines) {
        if (lines[l].indexOf(":/") !== -1) {
          var words = lines[l].split(' ');
          if (words.length === 2) {
            var printer = {
              'Connection': words[0],
              'DeviceURI': words[1],
              'Name': words[1].slice(words[1].indexOf('://')+3, words[1].indexOf('%'))
            }
            printers.push(printer);
          } else {
            unhandledPrinters.push(lines[l]);
          }
        }
      }
      callback(null, printers, unhandledPrinters);
    } else {
       callback(stderr);
    }
  });
}

module.exports.addPrinter = function(printer, callback) {
  exec('sudo lpadmin -p '+printer.Name+' -E -v '+printer.DeviceURI, (error, stdout, stderr) => {
    if (error) {
      callback(error);
      return;
    }
    if (!stderr) {
      exec('sudo lpoptions -d '+printer.Name, (error, stdout, stderr) => {
          if (error) {
            callback(error);
            return;
          }
          if (!stderr) {
            callback(null, stdout);
          } else {
            callback(stderr);
          }
        });
    } else {
       callback(stderr);
    }
  });
}

module.exports.printFromString = function(printerName, text, callback) {
    var printer = new Printer(printerName);
    var jobFromText = printer.printText(text);

    // Listen events from job
    jobFromText.once('sent', function() {
        jobFromText.on('completed', function() {
            console.log('Job ' + jobFromText.identifier + 'has been printed');
            jobFromText.removeAllListeners();
            callback(jobFromText);
        });
    });
}
