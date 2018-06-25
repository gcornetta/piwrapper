function getLines (data) {
  var aux = data.split('\n')
  var returnLines = []
  var pcIndex

  for (var i in aux) {
    pcIndex = aux[i].indexOf(';')
    if (pcIndex !== -1) {
      aux[i] = aux[i].slice(0, pcIndex)
    }
    if (aux[i].length > 0) {
      returnLines.push(aux[i])
    }
  }
  return returnLines
}

var endLines = ['M104 S0', 'M140 S0', 'G91', 'G1 E-1 F300', 'G1 Z+30 E-5 X-20 Y-20 F9000', 'G1 F2500 X0 Y200', 'G28 X0', 'M84', 'G90']

module.exports.getLines = getLines
module.exports.endLines = endLines
