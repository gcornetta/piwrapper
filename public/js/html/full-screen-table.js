'use strict';

function acceptJob(job, index){
    if (job.status === "pending"){
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

var socket = io.connect( 'http://192.168.0.100:8888' );

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
                'click .edit': function (e, value, row, index) {
                    editJob(row, index);
                },
                'click .remove': function (e, value, row, index) {
                    removeJob(row, index);
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
                '<a rel="tooltip" title="Edit" class="table-action edit" href="javascript:void(0)">',
                    '<i class="fa fa-edit"></i>',
                '</a>',
                '<a rel="tooltip" title="Remove" class="table-action remove" href="javascript:void(0)">',
                    '<i class="fa fa-remove"></i>',
                '</a>'
            ].join('');
        }