function getLines(data){
    var aux = data.split('\n');
    var returnLines = [];
    var pcIndex;

    for (var i in aux){
        pcIndex = aux[i].indexOf(";");
        if (pcIndex !== -1){
            aux[i] = aux[i].slice(0, pcIndex);
        }
        if (aux[i].length > 0){
            returnLines.push(aux[i])
        }
    }
    return returnLines;
}

var endLines = ['M104 S0','M140 S0','G91','G1 E-1 F300','G1 Z+0.5 E-5 X-20 Y-20 F9000','G1 F2500 X0 Y200','G28 X0','M84','G90']

/*
M104 S0                      ;extruder heater off
M140 S0                      ;heated bed heater off (if you have it)
G91                          ;relative positioning
G1 E-1 F300                  ;retract the filament a bit before lifting the nozzle, to release some of the pressure
G1 Z+0.5 E-5 X-20 Y-20 F9000 ;move Z up a bit and retract filament even more
G1 F2500 X0 Y200			 ;move Y to the front
G28 X0                       ;move X to min endstops, so the head is out of the way
M84                          ;steppers off
G90                          ;absolute positioning
*/

module.exports.getLines = getLines;
module.exports.endLines = endLines;