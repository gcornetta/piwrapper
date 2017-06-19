// Listens to the event that is trigerred by the user selecting the process in the form,  
// and calls the function with the option that the user selected.

$("#processes-epilog").on('change', function(){
  var selected = $(this).children(":selected").val(); 
  //Calls the function and passes to it the selection as a parameter. 
  loadEpilogContent(selected);
});

 
// A function that uses jQuery.ajax to transfer the selected option to the server side,
// and returns the data back from the server.

function loadEpilogContent(selected){
    $.ajax({
      url: '/dashboard/control/laser/epilog/process',
      type: 'GET',
      data: {'process' : selected},
      dataType: 'html',
      success: function(data){
         $('#feedback').html(data);
      }
    });
}


$("#processes-trotec").on('change', function(){
  var selected = $(this).children(":selected").val(); 
  //Calls the function and passes to it the selection as a parameter. 
  loadTrotecContent(selected);
});

 
// A function that uses jQuery.ajax to transfer the selected option to the server side,
// and returns the data back from the server.

function loadTrotecContent(selected){
    $.ajax({
      url: '/dashboard/control/laser/trotec/process',
      type: 'GET',
      data: {'process' : selected},
      dataType: 'html',
      success: function(data){
         $('#feedback').html(data);
      }
    });

}


$("#processes-gcc").on('change', function(){
  var selected = $(this).children(":selected").val(); 
  //Calls the function and passes to it the selection as a parameter. 
  loadGccContent(selected);
});

 
// A function that uses jQuery.ajax to transfer the selected option to the server side,
// and returns the data back from the server.

function loadGccContent(selected){
    $.ajax({
      url: '/dashboard/control/laser/gcc/process',
      type: 'GET',
      data: {'process' : selected},
      dataType: 'html',
      success: function(data){
         $('#feedback').html(data);
      }
    });

}




$("#processes-roland").on('change', function(){
  var selected = $(this).children(":selected").val(); 
  //Calls the function and passes to it the selection as a parameter. 
  loadRolandContent(selected);
});

 
// A function that uses jQuery.ajax to transfer the selected option to the server side,
// and returns the data back from the server.

function loadRolandContent(selected){
    $.ajax({
      url: '/dashboard/control/milling/roland/process',
      type: 'GET',
      data: {'process' : selected},
      dataType: 'html',
      success: function(data){
         $('#feedback').html(data);
      }
    });

}


$("#materials-roland").on('change', function(){
  var selected = $(this).children(":selected").val(); 
  //Calls the function and passes to it the selection as a parameter. 
  loadEngine(selected);
});

 
// A function that uses jQuery.ajax to transfer the selected option to the server side,
// and returns the data back from the server.

function loadEngine(selected){
    $.ajax({
      url: '/dashboard/control/vinyl/roland/material',
      type: 'GET',
      data: {'material' : selected},
      dataType: 'html',
      success: function(data){
         $('#feedback').html(data);
      }
    });

} 
   
//Calls to the function when the page loads.
//$(window).on('load', loadContent('Cut'));