var Worker = require('webworker-threads').Worker;

function Path2D (processConfig, img, dpi){
   this.threshold = processConfig.threshold;
   this.offset = processConfig.offset;
   this.diameter = processConfig.diameter;
   this.overlap = processConfig.overlap;
   this.error = processConfig.error;
   this.direction = processConfig.direction; //must be set to true when creating the object
   this.sorting = processConfig.sorting;
   this.sortMerge = processConfig.sortMerge;
   this.sortOrder = processConfig.sortOrder;
   this.sortSequence = processConfig.sortSequence;
   this.img = img; //ver bien en que formato está la imagen
   this.dpi = dpi;
   this.msg = null;
   this.path = null;
}

      //
      // mod_path_image_2D
      //    path from image 2D (intensity)
      //
Path2D.prototype.pathImage2D = function() {
         // set up path Web worker
         var worker = new Worker('./worker.js');
         this.path = [];
         worker.onmessage = function(e) {
            if (e.data[0] == 'prompt')
            // prompt message from worker
               this.msg = e.data[1];
            else if (e.data[0] == 'console')
            // console message from worker
               console.log(e.data[1])
            else if (e.data[0] == 'path') {
               // partial path message from worker
               path = e.data[1]
            } else if (e.data[0] == 'return') {
               // complete path message from worker
               path = e.data[1];
               worker.terminate();// si esto no funciona pongo un event-emitter y la función terminate fuera en un event listener externo
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
         worker.postMessage(["calculatePath2D", args]);
      }

Path2D.prototype.getPath = function (){
   return this.path;
}

Path2D.prototype.getMsg = function (){
   return this.msg;
}