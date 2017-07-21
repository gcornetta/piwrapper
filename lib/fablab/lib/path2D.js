var cp = require('child_process');
var child = cp.fork('lib/fablab/lib/worker.js');

function Path2D (){}

//
// mod_path_image_2D
//    path from image 2D (intensity)
//
Path2D.prototype.pathImage2D = function(processConfig, callback) {
  var args = {};
  args.imgPath = processConfig.jobPath;
  args.threshold = processConfig.threshold;
  args.offset = processConfig.offsets;
  args.diameter = processConfig.diameter;
  args.overlap = processConfig.overlap;
  args.error = processConfig.error;
  args.direction = true; //must be set to true when creating the object
  args.sorting = (processConfig.switchSort == 'on');
  args.sortMerge = processConfig.merge;
  args.sortOrder = processConfig.order;
  args.sortSequence = processConfig.sequence;

  // set up path Web worker
  this.path = [];
  var onMessage = function(e) {
    if (e[0] === 'path'){
        child.removeListener('message', onMessage);
        callback(e[1], e[2]);
    }
  }
  child.on('message', onMessage)

  child.send(["calculatePath2D", args]);
}

module.exports = Path2D;
