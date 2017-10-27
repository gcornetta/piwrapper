var socket = io.connect( window.location.host + '/progress' );

 socket.on('progress-update', function(percent){
      var barWidth = 'width: ' + (percent.progress).toString() +'%'; 
      $('#progress-bar').attr("style", barWidth);
 });
