var socket = io.connect( 'http://192.168.0.102:8888/progress' );

 socket.on('progress-update', function(percent){
      var barWidth = 'width: ' + (percent.progress).toString() +'%'; 
      $('#progress-bar').attr("style", barWidth);
 });
