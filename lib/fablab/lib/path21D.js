var cp = require('child_process');
var child = cp.fork('lib/fablab/lib/worker.js');

function Path21D (){}

var genPath = function(wp, processConfig) {
            var X = 0
            var Y = 1
            var Z = 2
            var idepth = Math.floor(0.5 + processConfig.dpi * processConfig.cutDepth / 25.4); //comprobar si esta linea es correcta
            var path = [];
            for (var seg = 0; seg < wp.length; ++seg) {
               path[path.length] = [];
               for (var pt = 0; pt < wp[seg].length; ++pt) {
                  path[path.length - 1][path[path.length - 1].length] = [wp[seg][pt][X], wp[seg][pt][Y], -idepth]
               }
            }
            return path;
      }
            
      // mod_path_image_21D
      //    path from image 2.1D (intensity, depth)

Path21D.prototype.getPath = function(processConfig, callback) {
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

        var onMessage = function(e) {
          if (e[0] === 'path'){
              child.removeListener('message', onMessage);
              processConfig.dpi = e[2];
              var auxPath = genPath(e[1], processConfig);
              callback(auxPath, processConfig.dpi);
          }
        }
        child.on('message', onMessage)

        child.send(["calculatePath2D", args]);
}

module.exports = Path21D;