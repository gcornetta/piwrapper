var socket = io.connect( window.location.host + '/dashboard' );

 socket.on('uptime-updated', function(uptime){
      var upt = 'h: ' + uptime.hours + ' m: ' + uptime.minutes + ' s: ' + uptime.seconds; 
      $('#upt').text(upt);
 });

 socket.on ('connect', function(){
	//client requests updates
	socket.emit('core0-update');
	socket.emit('core1-update');
	socket.emit('core2-update');
	socket.emit('core3-update');
});


 socket.on('core0-update', function(val){
        newval = val.cpuload;
	$('#gaugeChart0').epoch({type: 'time.gauge', value: newval}).push(newval);
	setInterval(socket.emit('core0-update', val.cpuload), 1000);
});	

 socket.on('core1-update', function(val){
	newval = val.cpuload;
	$('#gaugeChart1').epoch({type: 'time.gauge', value:  newval}).push(newval);
	setInterval(socket.emit('core1-update', val.cpuload), 1000);

});

 socket.on('core2-update', function(val){
        newval = val.cpuload;
	$('#gaugeChart2').epoch({type: 'time.gauge', value: newval}).push(newval);
	setInterval(socket.emit('core2-update', val.cpuload), 1000);
});

 socket.on('core3-update', function(val){
        newval = val.cpuload;
	$('#gaugeChart3').epoch({type: 'time.gauge', value: newval}).push(newval);
	setInterval(socket.emit('core3-update', val.cpuload), 1000);
});
