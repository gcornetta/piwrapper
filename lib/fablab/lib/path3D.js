var cp = require('child_process')
var child = cp.fork('lib/fablab/lib/worker.js')

function Path3D () {}

Path3D.prototype.getPath = function (processConfig, callback) {
  var args = {}

  args.imgPath = processConfig.jobPath
  args.diameter = processConfig.diameter
  args.overlap = processConfig.overlap
  args.type = (processConfig.type === 'flat')
  args.xz = (processConfig.xz === 'on')
  args.yz = (processConfig.yz === 'on')
  args.error = processConfig.error
  args.bottomZ = processConfig.bottomZ
  args.bottomI = processConfig.bottomIntensity
  args.topZ = processConfig.topZ
  args.topI = processConfig.topIntensity

  var onMessage = function (e) {
    if (e[0] === 'prompt') {
      this.msg = e[1]
    } else if (e[0] === 'console') {
      console.log(e[1])
    } else if (e[0] === 'path') {
      //
      // partial path message from worker
      //
      child.removeListener('message', onMessage)
      callback(e[1], e[2])
    } else if (e[0] === 'return') {
      //
      // complete path message from worker
      //
      child.removeListener('message', onMessage)
      callback(e[1], e[2])
    }
  }
  child.on('message', onMessage)

  child.send(['imageOffsetZ', args])
}

module.exports = Path3D
