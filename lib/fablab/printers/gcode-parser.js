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

module.exports.getLines = getLines;