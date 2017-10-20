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
         if (selected  === "pcb"){
            setPcbDiv();
         }else{
            setWaxDiv();
         }
      }
    });

}

$("#pcbFinishings").on('change', function(){setPcbDiv()});

function setPcbDiv(divId){
var selected = $("#pcbFinishings").children(":selected").val();
if (divId){
    selected = divId;
}
  //first hide all divs and then show the correct process div
  $('#fieldset').children('div').each(function(){
      $(this).hide();
    });
    if (selected){
        $('#directionRadios').show();
        $('#'+selected).show();
    }

    $('#finishingsSwitch').hide();
    $('#sortSwitch').show();
}

$("#waxFinishings").on('change', setWaxDiv);

function setWaxDiv(){
var selected = $("#waxFinishings").children(":selected").val();
  //first hide all divs and then show the correct process div
  $('#fieldset').children('div').each(function(){
      $(this).hide();
    });
    $('#'+selected).show();

    if (selected === "finish_cut"){
        $('#finishingsSwitch').show();
        $('#sortSwitch').hide();
    }else{
        $('#finishingsSwitch').hide();
        $('#sortSwitch').show();
    }
}


$("#materials-roland").on('change', function(){
  var selected = $(this).children(":selected").val(); 
  //Calls the function and passes to it the selection as a parameter. 
  loadEngine(selected);
});

$( "#target" ).submit(function( event ) {
    //event.preventDefault();
  switch ($('#pcbFinishings').val()){
    case 'traces_1_64':
        $('#outline_1_32').empty();
        $('#traces_0_010').empty();
        break;
    case 'outline_1_32':
        $('#traces_1_64').empty();
        $('#traces_0_010').empty();
        break;
    case 'traces_0_010':
        $('#traces_1_64').empty();
        $('#outline_1_32').empty();
        break;
  }
  switch ($('#waxFinishings').val()){
    case 'rough_cut':
        $('#finish_cut').empty();
        break;
    case 'finish_cut':
        $('#rough_cut').empty();
        break;
  }
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


// A function that uses jQuery.ajax to transfer the selected option to the server side,
// and returns the data back from the server.

function loadMachines(){
    $('#deviceUri').empty();
    $('#deviceUri').html('<option value="null">Searching machines...</option>');
    $.ajax({
      url: '/dashboard/settings/discovered-printers',
      type: 'GET',
      data: {},
      dataType: 'html',
      success: function(data){
         $('#deviceUri').empty();
         $('#deviceUri').html(data);
      }
    });

}
   
var socket = io.connect( 'http://localhost:8888/' );

socket.on('directCommandResult', function(msg) {
    alert(msg);
});



function sendMoveRollandMilling(){
    var x = $("input[name='x']").val();
    var y = $("input[name='y']").val();
    var z = $("input[name='z']").val();
    var zjog = $("input[name='zjog']").val();
    var comm = "PA;PA;VS10;!VZ10;!PZ0,"+zjog+";Z"+x+","+y+","+z+";!MC0;"
    console.log(socket)
    socket.emit('directCommand', comm);
}
