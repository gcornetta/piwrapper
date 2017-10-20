'use strict';

function acceptJob(job, index){
    if ((job.status === "pending")||(job.status === "error")){
        socket.emit('acceptJob', job.jobId);
    }else{
        alert("Job already accepted");
    }
}

function editJob(job, index){
    //TODO: Implement this function
    job.status = "edited";
    $table.bootstrapTable('load', jobs);
}

function removeJob(job, index){
    socket.emit('removeJob', job.jobId);
}

function imageJob(job, index){
    window.location.replace(job.jobPath.slice(job.jobPath.indexOf('/public')+7, job.jobPath.length));
}

function dataJob(job, index){
    $('#modalBody').empty();
    try {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", job.jobPath.slice(job.jobPath.indexOf('/public')+7, job.jobPath.length));
        xhr.responseType = "blob";
        xhr.onerror = function() {reject("Network error.")};
        xhr.onload = function() {
            if (xhr.status === 200) {
                var blob = xhr.response;
                var urlCreator = window.URL || window.webkitURL;
                var imageUrl = urlCreator.createObjectURL( blob );
                var img = new Image();
                img.onload= function(){
                    var fileReader = new FileReader();
                    fileReader.onload = function() {
                        var dpi = getDPI(this.result)
                        var alertTxt = "Dpi: "+dpi+"\n";
                        alertTxt = alertTxt.concat("Size in pixels: "+img.width+" x "+img.height+"\n");
                        alertTxt = alertTxt.concat("Size in cm: "+(25.4 * img.width / dpi).toFixed(3)+" x "+(25.4 * img.height / dpi).toFixed(3)+"\n");
                        for (var i in job){
                            if (i !== 'jobPath'){
                                alertTxt = alertTxt.concat(i+" : "+job[i]+"\n");
                            }
                        }
                        $('#modalBody').append(alertTxt);
                    };
                    fileReader.readAsArrayBuffer(xhr.response);
                }
                img.src = imageUrl;
            }
            else {console.log("Loading error:" + xhr.statusText)}
        };
        xhr.send();
    }
    catch(err) {console.log(err.message)}
}

var jobs = [
    /*{
        'id': 1,
        'priority': 1,
        'userId' : '57a491c2c46763f60bf25acd',
        'process' : 'wax',
        'jobPath': '/home/pi/piwrapper/public/uploads/designs/local/57a491c2c46763f60bf25acd/1.png',
        'status': 'pending'
    }*/
];

var socket = io.connect( 'http://localhost:8888' );

socket.on('connect', function(){
    socket.emit('subscribeJobUpdates');
});

socket.on('clearTable', function() {
   jobs = [];
   $table.bootstrapTable('load', jobs);
});

socket.on('addJob', function(job) {
   jobs.push(job);
   $table.bootstrapTable('load', jobs);
});

socket.on('errorAlert', function(err) {
    if (err.err){
        alert(err.err)
    }
});

socket.on('updateJob', function(job){
    for (var j in jobs){
        if (jobs[j].jobId == job.jobId){
            jobs.splice(j, 1);
            jobs.push(job);
            break;
        }
    }
    $table.bootstrapTable('load', jobs);
});

socket.on('deleteJob', function(jobId){
    for (var j in jobs){
        if (jobs[j].jobId == jobId){
            jobs.splice(j, 1);
            break;
        }
    }
    $table.bootstrapTable('load', jobs);
});

socket.on('updateUserPriority', function(userId, priority){
    for (var j in jobs){
        if (jobs[j].userId == userId){
            jobs[j].priority = priority;
        }
    }
    $table.bootstrapTable('load', jobs);
});


//FULL-SCREEN-TABLE-FUNCTIONS

var $table = $('#fresh-table'),
            $alertBtn = $('#alertBtn'),
            full_screen = false,
            window_height;

        $().ready(function(){
            window_height = $(window).height();
            var table_height = window_height - 20;


            $table.bootstrapTable({
                toolbar: ".toolbar",

                showRefresh: false,
                search: true,
                showToggle: false,
                showColumns: false,
                pagination: true,
                striped: true,
                sortable: true,
                height: table_height,
                pageSize: 25,
                pageList: [25,50,100],

                formatShowingRows: function(pageFrom, pageTo, totalRows){
                    //do nothing here, we don't want to show the text "showing x of y from..."
                },
                formatRecordsPerPage: function(pageNumber){
                    return pageNumber + " rows visible";
                },
                icons: {
                    refresh: 'fa fa-refresh',
                    toggle: 'fa fa-th-list',
                    columns: 'fa fa-columns',
                    detailOpen: 'fa fa-plus-circle',
                    detailClose: 'fa fa-minus-circle'
                }
            });

            window.operateEvents = {
                'click .accept': function (e, value, row, index) {
                    acceptJob(row, index);
                },
                'click .remove': function (e, value, row, index) {
                    removeJob(row, index);
                },
                'click .image': function (e, value, row, index) {
                    imageJob(row, index);
                },
                'click .data': function (e, value, row, index) {
                    dataJob(row, index);
                }
            };

            $alertBtn.click(function () {
                alert("You pressed on Alert");
            });


            $(window).resize(function () {
                $table.bootstrapTable('resetView');
            });
        });


        function operateFormatter(value, row, index) {
            return [
                '<a rel="tooltip" title="Accept" class="table-action accept" href="javascript:void(0)">',
                    '<i class="fa fa-rocket"></i>',
                '</a>',
                '<a rel="tooltip" title="Remove" class="table-action remove" href="javascript:void(0)">',
                    '<i class="fa fa-remove"></i>',
                '</a>',
                '<a rel="tooltip" title="Image" class="table-action image" href="javascript:void(0)">',
                    '<i class="fa fa-image"></i>',
                '</a>',
                '<a rel="tooltip" title="Data" class="table-action data" href="javascript:void(0)" data-toggle="modal" data-target="#myModal">',
                    '<i class="fa fa-file-code-o"></i>',
                '</a>'
            ].join('');
        }

function getDPI(buf) {
      //
      // get DPI
      //
      // 8 header
      // 4 len, 4 type, data, 4 crc
      // pHYs 4 ppx, 4 ppy, 1 unit: 0 ?, 1 meter
      // IEND
      //
      var units = 0
      var ppx = 0
      var ppy = 0
      //var buf = event.target.result
      var view = new DataView(buf)
      var ptr = 8
      if (!((view.getUint8(1) == 80) && (view.getUint8(2) == 78) && (view.getUint8(3) == 71))) {
         winston.warn('@img.getDPI: '+ "error: PNG header not found")
         return
      }
      while (1) {
         var length = view.getUint32(ptr)
         ptr += 4
         var type = String.fromCharCode(view.getUint8(ptr), view.getUint8(ptr + 1),
            view.getUint8(ptr + 2), view.getUint8(ptr + 3))
         ptr += 4
         if (type == "pHYs") {
            ppx = view.getUint32(ptr)
            ppy = view.getUint32(ptr + 4)
            units = view.getUint8(ptr + 8)
         }
         if (type == "IEND")
            break
         ptr += length + 4
      }
      if (units == 0) {
         winston.warn('@img.getDPI: '+ "no PNG units not found, assuming 72 DPI")
         ppx = 72 * 1000 / 25.4
      }
      var dpi = ppx * 25.4 / 1000
      return dpi;
   }