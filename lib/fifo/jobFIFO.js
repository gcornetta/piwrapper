var fifo = require('fifo')();
var winston = require('winston');

module.exports.push = function(job){
  fifo.push(job);
  winston.info('@fifo.push: new job pushed into the FIFO');
  winston.info('@fifo.push: job details ' + JSON.stringify(job));
}