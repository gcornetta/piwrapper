var socket = io.connect(window.location.host);

socket.on('directCommandResult', function(msg) {
    alert(msg);
});

function sendMoveRollandMilling(){
    var x = $("input[name='x']").val();
    var y = $("input[name='y']").val();
    var z = $("input[name='z']").val();
    var zjog = $("input[name='zjog']").val();
    var comm = "PA;PA;VS10;!VZ10;!PZ0,"+zjog+";Z"+x+","+y+","+z+";!MC0;"
    socket.emit('directCommand', comm);
}