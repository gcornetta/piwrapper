var Worker = require('webworker-threads').Worker;

function Path3D (processConfig, dpi, img){
   this.diameter = processConfig.diameter;
   this.overlap = processConfig.overlap;
   this.error = processConfig.error;
   this.type =;
   this.xz =;
   this.yz =;
   this.bottomZ = processConfig.bottomZ;
   this.bottomI = processConfig.bottomI;
   this.topZ = processConfig.topZ;
   this.topI = processConfig.topI;
   this.depth = processConfig.depth; //no utilizado
   this.dpi = dpi;
   this.img = img;
   this.X = 0;
   this.Y = 1;
   this.Z = 2;
   this.msg = null;
   this.path = null;
}


Path3D.prototype.pathImage3D = function(){
         //
         // set up path Web worker
         //
         var worker = new Worker('./worker.js')
         var path = []
          worker.onmessage = function(e) {
            if (e.data[0] == 'prompt')
            // prompt message from worker
               this.msg = e.data[1];
            else if (e.data[0] == 'console')
            // console message from worker
               console.log(e.data[1])

            else if (e.data[0] == 'path') {
               //
               // partial path message from worker
               //
               this.path = e.data[1]
            } else if (e.data[0] == 'return') {
               //
               // complete path message from worker
               //
               this.path = e.data[1];
               worker.terminate();
            }
         }
         
         var args = {};
         
         args.img = this.img;
         args.diameter = this.diameter;
         args.overlap = this.overlap;
         args.type = this.type;
         args.xz = this.xz;
         args.yz = this.yz;
         args.error = this.error;
         args.bottomZ = this.bottomZ;
         args.bottomY = this.bottomI;
         args.bottomY = this.topZ;
         args.bottomY = this.topI;
         args.dpi = this.dpi;//
         // start worker
         //
         worker.postMessage(["imageOffsetZ", args]);
      }

