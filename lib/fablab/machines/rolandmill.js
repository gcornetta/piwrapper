function RolandMill (path, config) {
  this.fileExt = '.rml'
  this.path = path
  this.width = config.width
  this.dpi = config.dpi
  this.model = config.machines
  this.speed = parseFloat(config.speed)
  this.jog = parseFloat(config.zjog)
  this.x0 = parseFloat(config.x)
  this.y0 = parseFloat(config.y)
  this.z0 = parseFloat(config.z)

  this.xhome = parseFloat(config.xhome)
  this.yhome = parseFloat(config.yhome)
  this.zhome = parseFloat(config.zhome)
}

function toMillimeters (val) {
  return parseFloat(val) * 25.4
}

RolandMill.prototype.cmdString = function (callback) {
  var dx = toMillimeters(this.width / this.dpi)
  var nx = this.width

  if (this.model === 'mdx_15' || this.model === 'mdx_20') {
    var rmlUnit = 40.0
  } else { // models mdx 40 and srm 20
    rmlUnit = 100.0
  }

  var ijog = Math.floor(rmlUnit * this.jog)
  var scale = rmlUnit * dx / (nx - 1)
  var xoffset = rmlUnit * this.x0
  var yoffset = rmlUnit * this.y0
  var zoffset = rmlUnit * this.z0
  var str = 'PA;PA;' // plot absolute
  str += 'VS' + this.speed + ';!VZ' + this.speed + ';'
  str += '!PZ' + 0 + ',' + ijog + ';' // set jog
  str += '!MC1;\n' // turn motor on
    // follow segments
  for (var seg = 0; seg < this.path.length; ++seg) {
        // move up to starting point
    var x = xoffset + scale * this.path[seg][0][0]
    var y = yoffset + scale * this.path[seg][0][1]
    str += 'PU' + x.toFixed(0) + ',' + y.toFixed(0) + ';\n'
        // move down
    var z = zoffset + scale * this.path[seg][0][2]
    str += 'Z' + x.toFixed(0) + ',' + y.toFixed(0) + ',' + z.toFixed(0) + ';\n'
    for (var pt = 1; pt < this.path[seg].length; ++pt) {
            // move to next point
      x = xoffset + scale * this.path[seg][pt][0]
      y = yoffset + scale * this.path[seg][pt][1]
      z = zoffset + scale * this.path[seg][pt][2]
      str += 'Z' + x.toFixed(0) + ',' + y.toFixed(0) + ',' + z.toFixed(0) + ';\n'
    }
        // move up
    str += 'PU' + x.toFixed(0) + ',' + y.toFixed(0) + ';\n'
  }
    // turn off motor and move back
  var xh = rmlUnit * this.xhome
  var yh = rmlUnit * this.yhome
  var zh = rmlUnit * this.zhome
  str += 'PA;PA;!PZ0,' + zh + ';PU' + xh + ',' + yh + ';!MC0;'
    // return string
  callback(false, str) // eslint-disable-line
}

module.exports = RolandMill
