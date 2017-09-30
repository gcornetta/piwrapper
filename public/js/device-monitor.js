var socket = io.connect( 'http://piwrapper.local:8888/devCurrent' );
var socket2 = io.connect( 'http://piwrapper.local:8888/devStatus' ); 

 socket.on('connect', function () {
  var lineChartData = [{      
       label: "Average Current",                                                                                                                                          
       values:  [{ time: parseInt(new Date()/1000), y: 0 }]
       }]                                                                                                                                           
                                                                                                                                                     
      $('#avgcurr').text('????');                                                                                                               
                                                                                                                                                     
      $('#lineChart').epoch({                                                                                                                        
         type: 'time.line',                                                                                                                          
         data: lineChartData,                                                                                                                        
         axes: ['left', 'right', 'bottom'],                                                                                                          
         range: [0, 2000]                                                                                                                            
       }).push(lineChartData) 
 }) 

  socket2.on('connect', function () {
      $('#devstate').text('undefined');
      $(".progress-bar").css('width', '0%');
 })  
 
 socket.on('new-sample', function(sample){
      var lineChartData = [{                                                                                                                 
            time: parseInt(new Date()/1000),                                                                                   
            y: sample.data
          }]

      $('#avgcurr').text(sample.data);

      var chart = $('#lineChart').epoch({
         type: 'time.line',
         data: lineChartData,
         axes: ['left', 'right', 'bottom'],
         range: [0, 2000]
       })

      chart.push(lineChartData) 
 })

 socket2.on('new-state', function(sample) {
   $('#devstate').text(sample.data);
   
   if (sample.data !== 'undefined') {
     for (var p = 0; p <= 100; p+=10) {
       setTimeout(function () {
         $(".progress-bar").css('width', p.toString() + '%'); 
       }, 200)
     }
   } else {
     for (var p = 100; p === 0; p-=10) {                                                                                                        
       setTimeout(function () {                                                                                                                      
         $(".progress-bar").css('width', p.toString() + '%');                                                                                        
       }, 300)                                                                                                                                       
     }  
   }
 })
