$(document).ready(function() {
    var socket = io.connect( window.location.host + '/syslogger' );
    var container = $('#logger-message');
    
     socket.on ('connect', function(){
	//client requests updates
	socket.emit('ready');
    });

    socket.on('newLog', function(log) {
        if(log.level == 'info') {
          var newItem = $('<div>' + log.timestamp + ' - '+ '<span class="color-info">' + log.level + '</span>'+ ': ' + log.message + '</div>');
        } else if (log.level == 'warn') {
          var newItem = $('<div>' + log.timestamp + ' - '+ '<span class="color-warn">' + log.level + '</span>'+ ': ' + log.message + '</div>');
        } else {
          var newItem = $('<div>' + log.timestamp + ' - '+ '<span class="color-err">' + log.level + '</span>'+ ': ' + log.message + '</div>');
        }
        container.append(newItem);
    });
});

