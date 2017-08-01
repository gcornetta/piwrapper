var cp = require('child_process');
var child = cp.fork('lib/fablab/lib/worker.js');

function Path22D (){}

var genPath = function(wp, processConfig) {
            var X = 0
            var Y = 1
            // loop over segments
            var path = [];
            for (var seg = 0; seg < wp.length; ++seg) {
               var z = 0
               path[path.length] = []
               //
               // loop over z values
               //
               processConfig.thickness = parseFloat(processConfig.thickness);
               processConfig.cutDepth = parseFloat(processConfig.cutDepth);
               while (z < processConfig.thickness) {
                  z += processConfig.cutDepth;
                  if (z > processConfig.thickness)
                     z = processConfig.thickness;
                  var iz = Math.floor(0.5 + processConfig.dpi * z / 25.4); //comprobar esta linea
                  //
                  // start new segment if ends don't meet
                  //
                  if ((path[path.length - 1].length > 0) && ((wp[seg][0][X] != wp[seg][wp[seg].length - 1][X]) || (wp[seg][0][Y] != wp[seg][wp[seg].length - 1][Y])))
                     path[path.length] = [];
                     //
                     // add points
                     //
                  for (var pt = 0; pt < wp[seg].length; ++pt) {
                     path[path.length - 1][path[path.length - 1].length] = [wp[seg][pt][X], wp[seg][pt][Y], -iz];
                  }
               }
            }
            return path;
      }
            
      
      //
      // mod_path_image_22D
      //    path from image 2.2D (intensity, depth, thickness)
      //

 
Path22D.prototype.getPath = function(processConfig, callback) {
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

module.exports = Path22D;