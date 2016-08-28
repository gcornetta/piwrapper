var Worker = require('webworker-threads').Worker;

function Path21D (processConfig, imgInfo, img){
   this.threshold = processConfig.threshold;
   this.offset = processConfig.offset;
   this.diameter = processConfig.diameter;
   this.overlap = processConfig.overlap;
   this.error = processConfig.error;
   this.direction = processConfig.direction;
   this.sorting = processConfig.sorting;
   this.sortMerge = processConfig.sortMerge;
   this.sortOrder = processConfig.sortOrder;
   this.sortSequence = processConfig.sortSequence;
   this.imgDepth = imgInfo.depth;
   this.imgDpi = imgInfo.dpi;
   this.img = img;
   this.X = 0;
   this.Y = 1;
   this.Z = 2;
   this.msg = null;
   this.path = null;
}

var genPath = function(wp) {
            // set z
            var idepth = Math.floor(0.5 + this.imgDpi * this.imgDepth / 25.4); //comprobar si esta linea es correcta
            var this.path = [];
            for (var seg = 0; seg < wp.length; ++seg) {
               this.path[this.path.length] = [];
               for (var pt = 0; pt < wp[seg].length; ++pt) {
                  this.path[this.path.length - 1][this.path[this.path.length - 1].length] = [wp[seg][pt][X], wp[seg][pt][Y], -idepth]
               }
            }
      }
            
      // mod_path_image_21D
      //    path from image 2.1D (intensity, depth)

Path21D.prototype.pathImage21D = function() {
         // set up path Web worker
         //
         var worker = new Worker('./worker.js')
         var workerPath = [];
         worker.onmessage = function(e) {
            if (e.data[0] == 'prompt')
            // prompt message from worker
               this.msg = e.data[1];
            else if (e.data[0] == 'console')
            // console message from worker
               console.log(e.data[1]);
            else if (e.data[0] == 'path') {
               // partial path message from worker
               workerPath = e.data[1]
            } else if (e.data[0] == 'return') {
               // path message from worker
               workerPath = e.data[1]

               genPath (workerPath);
               worker.terminate();
            }
         }
         
         var args = {};
         
         args.img = this.img;
         args.threshold = this.threshold;
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
         // start worker
         worker.postMessage(["calculatePath2D", args ]);
      }

Path21D.prototype.getPath = function (){
   return this.path;
}

Path21D.prototype.getMsg = function (){
   return this.msg;
}