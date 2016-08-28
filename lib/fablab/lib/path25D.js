var Worker = require('webworker-threads').Worker;

function Path25D (processConfig, dpi, img){
   this.offset = processConfig.offset;
   this.diameter = processConfig.diameter;
   this.overlap = processConfig.overlap;
   this.error = processConfig.error;
   this.direction = processConfig.direction;
   this.sorting = processConfig.sorting;
   this.sortMerge = processConfig.sortMerge;
   this.sortOrder = processConfig.sortOrder;
   this.sortSequence = processConfig.sortSequence;
   this.bottomZ = processConfig.bottomZ;
   this.bottomI = processConfig.bottomI;
   this.topZ = processConfig.topZ;
   this.topI = processConfig.topI;
   this.depth = processConfig.depth;
   this.dpi = dpi;
   this.img = img;
   this.X = 0;
   this.Y = 1;
   this.Z = 2;
   this.msg = null;
   this.path = null;
}

var genPath = function(wp, w) {
   var z = this.topZ;
   var i = this.topI;
   var iz = Math.floor(0.5 + this.dpi * this.topZ / 25.4);  
   for (var seg = 0; seg < wp.length; ++seg) {
      this.path[this.path.length] = [];
      for (var pt = 0; pt < wp[seg].length; ++pt) {
         this.path[this.path.length - 1][this.path[this.path.length - 1].length] = [wp[seg][pt][X], wp[seg][pt][Y], iz]
      }
   }  
   if (z <= this.bottomZ) {
     w.terminate();
   } else {
      z -= this.depth
      if (z < this.bottomZ)
         z = this.bottomZ;
         var i = this.bottomI + (this.topI - this.bottomI) * (z - this.bottomZ) / (this.topZ - this.bottomZ);
         var iz = Math.floor(0.5 + this.dpi * z / 25.4);

         
         var args = {};
         
         args.img = this.img;
         args.threshold = i;
         args.offset = this.offset;
         args.diameter = this.diameter;
         args.overlap = this.overlap;
         args.error = this.error;
         args.direction = this.direction;
         args.sorting = this.sorting;
         args.sortMerge = this.sortMerge;
         args.sortOrder = this.sortOrder;
         args.sortSequence = this.sortSequence;
         args.dpi = this.dpi;

         w.postMessage(["calculatePath2D", args ]);
   }
}


Path25D.prototype.pathImage25D = function(){
         // get images
         //
         var input_canvas = findEl("mod_input_canvas")
         var process_canvas = findEl("mod_process_canvas")
         var output_canvas = findEl("mod_output_canvas")
         var input_ctx = input_canvas.getContext("2d")
         var input_img = input_ctx.getImageData(0, 0, input_canvas.width, input_canvas.height)
         var process_ctx = process_canvas.getContext("2d")
         process_ctx.drawImage(input_canvas, 0, 0)
         var process_img = process_ctx.getImageData(0, 0, process_canvas.width, process_canvas.height)
         var output_ctx = output_canvas.getContext("2d")
         var output_img = output_ctx.getImageData(0, 0, output_canvas.width, output_canvas.height)
         // set up path Web worker
         //
         var worker = new Worker('./worker.js')
         var workerPath = [];
         worker.onmessage = function(e) {
            if (e.data[0] == 'prompt')
            // prompt message from worker
               this.msg = 'layer ' + this.topZ + '/' + this.bottomZ + ' : ' + e.data[1];
            else if (e.data[0] == 'console')
            // console message from worker
               console.log(e.data[1])
            else if (e.data[0] == 'path') {
               // partial path message from worker
               //
               workerPath = e.data[1]
            } else if (e.data[0] == 'return') {
               // path message from worker
               var workerPath = e.data[1];
               // accumulate layer
               genPath(workerPath, worker);
               } 
            }
   }

Path25D.prototype.getPath = function (){
   return this.path;
}

Path25D.prototype.getMsg = function (){
   return this.msg;
}