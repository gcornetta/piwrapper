var cp = require('child_process')
var child = cp.fork('lib/fablab/lib/worker.js')

function Path25D () {}

var path = []

var genPath = function (wp, processConfig, callback) {
  var X = 0
  var Y = 1

  // var i = processConfig.bottomIntensity + (processConfig.topIntensity - processConfig.bottomIntensity) * (processConfig.z - processConfig.bottomZ) / (processConfig.topZ - processConfig.bottomZ)
  var iz = Math.floor(0.5 + processConfig.dpi * processConfig.z / 25.4)
  for (var seg = 0; seg < wp.length; ++seg) {
    path[path.length] = []
    for (var pt = 0; pt < wp[seg].length; ++pt) {
      path[path.length - 1][path[path.length - 1].length] = [wp[seg][pt][X], wp[seg][pt][Y], iz]
    }
  }
  //
  // loop
  //
  if (processConfig.z <= processConfig.bottomZ) {
    child.removeListener('message', processConfig.onMessage)
    callback(path, processConfig.dpi)
  } else {
    calculatePath2D(processConfig)
  }
}

Path25D.prototype.getPath = function (processConfig, callback) {
  path = []
  processConfig.onMessage = function (e) {
    if (e[0] === 'path') {
      // child.removeListener('message', onMessage);
      processConfig.dpi = e[2]
      genPath(e[1], processConfig, callback)
      // callback(auxPath, e[2]);
    }
  }
  child.on('message', processConfig.onMessage)

  processConfig.z = processConfig.topZ
  processConfig.bottomIntensity = parseFloat(processConfig.bottomIntensity)

  calculatePath2D(processConfig)
}

function calculatePath2D (processConfig) {
  processConfig.z -= processConfig.cutDepth
  if (processConfig.z < processConfig.bottomZ) { processConfig.z = processConfig.bottomZ }
  processConfig.threshold = processConfig.bottomIntensity + (processConfig.topIntensity - processConfig.bottomIntensity) * (processConfig.z - processConfig.bottomZ) / (processConfig.topZ - processConfig.bottomZ)

  var args = {}
  args.imgPath = processConfig.jobPath
  args.threshold = processConfig.threshold
  args.offset = processConfig.offsets
  args.diameter = processConfig.diameter
  args.overlap = processConfig.overlap
  args.error = processConfig.error
  args.direction = true // must be set to true when creating the object
  args.sorting = (processConfig.switchSort === 'on')
  args.sortMerge = processConfig.merge
  args.sortOrder = processConfig.order
  args.sortSequence = processConfig.sequence

  child.send(['calculatePath2D', args])
}

module.exports = Path25D
