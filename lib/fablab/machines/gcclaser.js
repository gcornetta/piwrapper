function GccLaser (path, jobName, config) {
  this.fileExt = '.gcc'
  this.path = path
  this.jobName = jobName
  this.width = config.width
  this.height = config.height
  this.dpi = config.dpi
  this.power = parseFloat(config.power)
  this.speed = parseFloat(config.speed)
  this.rate = parseFloat(config.rate)
  this.xorigin = config.xorigin
  this.yorigin = config.yorigin
  this.autofocus = config.autofocus
  this.startCorner = config.startCorner
}

function toInches (val) {
  return parseFloat(val) / 25.4
}

GccLaser.prototype.cmdString = function (callback) {
  var dx = this.width / this.dpi
  var dy = this.height / this.dpi
  var nx = this.width
  var ox = toInches(this.xorigin)
  var oy = toInches(this.yorigin)
  var scale = 1016.0 * dx / (nx - 1) // 1016 DPI

  if (this.startCorner === 'bottom left') {
    var xoffset = 1016.0 * ox
    var yoffset = 1016.0 * (oy - dy)
  } else if (this.startCorner === 'bottom right') {
    xoffset = 1016.0 * (ox - dx)
    yoffset = 1016.0 * (oy - dy)
  } else if (this.startCorner === 'top left') {
    xoffset = 1016.0 * ox
    yoffset = 1016.0 * oy
  } else { // top right
    xoffset = 1016.0 * (ox - dx)
    yoffset = 1016.0 * oy
  }
  var str = '%-12345X' // start of job
  str += 'E' // reset
  str += '!m' + this.jobName.length + 'N' + this.jobName // file name

  this.autofocus ? str += '!v16D' : str += '!v16D                '
  str += '!v16R' // Enable Pulse Per Inch for 16 pens, range 0-1
  str += '1111111111111111'
  str += '!v64I' // PPI for 16 pens, 0001-1524
  str += ('0000' + (this.rate.toFixed(0))).slice(-4)
  str += '050005000500050005000500050005000500050005000500050005000500'
  str += '!v64V' // velocity for 16 pens, 0500 = 50%
  str += ('0000' + ((this.speed * 10).toFixed(0))).slice(-4)
  str += '050005000500050005000500050005000500050005000500050005000500'
  str += '!v64P' // power for 16 pens, 0500 = 50%
  str += ('0000' + ((this.power * 10).toFixed(0))).slice(-4)
  str += '050005000500050005000500050005000500050005000500050005000500'
  str += '%1A' // PCL mode
  str += '*t1016R' // raster resolution 1016
  str += '&u1016D' // unit of measure 1016
    // str += "*p"+xoffset.toFixed(0)+"X"; // start cursor X position
    // str += "*p"+yoffset.toFixed(0)+"Y"; // start cursor Y position
  str += '*r1A' // move carriage to cursor
  str += '*rC' // close raster cluster
  str += '%1B;'   // HPGL mode
    // str += "PR;"   // plot relative
  str += 'PA;'   // plot relative
  str += 'SP1;' //
    //
    // loop over segments
    //
  for (var seg = 0; seg < this.path.length; ++seg) {
        //
        // loop over points
        //
    var x = xoffset + scale * this.path[seg][0][0]
    var y = yoffset + scale * this.path[seg][0][1]
    if (x < 0) x = 0
    if (y < 0) y = 0
    str += 'PU' + x.toFixed(0) + ',' + y.toFixed(0) + ';' // move up to start point
    for (var pt = 1; pt < this.path[seg].length; ++pt) {
      x = xoffset + scale * this.path[seg][pt][0]
      y = yoffset + scale * this.path[seg][pt][1]
      if (x < 0) x = 0
      if (y < 0) y = 0
      str += 'PD' + x.toFixed(0) + ',' + y.toFixed(0) + ';' // move down
    }
  }
  str += '%1A' // PCL mode
  str += 'E' // reset
  str += '%-12345X' // end of job
  callback(false, str) // eslint-disable-line
}

module.exports = GccLaser
