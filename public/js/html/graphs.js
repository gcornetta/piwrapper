var socket = io.connect( 'http://192.168.0.100:8888' );

socket.on('connect', function(){

});

socket.on('clearTable', function() {

});

var data = [{values:[]}, {values:[]}];
var chart;

$(function() {
    chart = $('#real-time-line').epoch({
                    type: 'time.line',
                    data: data,
                    axes: ['left', 'bottom', 'right']
                });

    setInterval(function() {
        chart.push([{time: Date.now()/1000, y: Math.round(Math.random()*100)},{time: Date.now()/1000, y: 100}]);
    }, 1000);
    chart.push([{time: Date.now()/1000, y: Math.round(Math.random()*100)},{time: Date.now()/1000, y: 0}]);
});

/*window.addEventListener('resize', function () {
    $('#real-time-line').empty();
    chart = $('#real-time-line').epoch({
                        type: 'time.line',
                        data: data,
                        axes: ['left', 'bottom', 'right']
                    });
    console.log("resize")
})*/