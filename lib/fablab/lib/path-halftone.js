//var cp = require('child_process');
//var child = cp.fork('lib/fablab/lib/worker.js');
var Img = require('./img');

function PathHalftone (){}

//
// mod_path_image_2D
//    path from image 2D (intensity)
//
PathHalftone.prototype.getPath = function(processConfig, callback) {
  var args = {};
  args.imgPath = processConfig.jobPath;
  args.diameter = processConfig.diameter;
  args.spotSize = processConfig.spotSize;
  args.spotMin = processConfig.minSpotsize;
  args.horSpotSpacing = processConfig.horSpotspace;
  args.verSpotSpacing = processConfig.verSpotspace;
  args.spotPoints = processConfig.pointSpot;

  // set up path Web worker
  this.path = [];
  var imgData = new Img(args.imgPath);
  imgData.imgHalftone(args, function(halftonePath, dpi){
    callback(halftonePath, dpi)
  });
  /*var onMessage = function(e) {
    if (e[0] === 'path'){
        child.removeListener('message', onMessage);
        callback(e[1], e[2]);
    }
  }
  child.on('message', onMessage)

  child.send(["calculatePath2D", args]);*/
}

module.exports = PathHalftone;
