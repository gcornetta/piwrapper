var Worker = require('webworker-threads').Worker;

function Path22D (processConfig, imgInfo, img){
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
   this.imgThick = imgInfo.thick;
   this.img = img;
   this.X = 0;
   this.Y = 1;
   this.Z = 2;
   this.msg = null;
   this.path = null;
}

var genPath = function(wp) {
            // loop over segments
            for (var seg = 0; seg < wp.length; ++seg) {
               var z = 0
               this.path[this.path.length] = []
               //
               // loop over z values
               //
               while (z < this.imgThick) {
                  z += this.imgDepth;
                  if (z > this.imgThick)
                     z = this.imgThick;
                  var iz = Math.floor(0.5 + this.imgDpi * z / 25.4); //comprobar esta linea
                  //
                  // start new segment if ends don't meet
                  //
                  if ((this.path[this.path.length - 1].length > 0) && ((wp[seg][0][X] != wp[seg][wp[seg].length - 1][X]) || (wp[seg][0][Y] != wp[seg][wp[seg].length - 1][Y])))
                     this.path[this.path.length] = [];
                     //
                     // add points
                     //
                  for (var pt = 0; pt < wp[seg].length; ++pt) {
                     this.path[this.path.length - 1][this.path[this.path.length - 1].length] = [wp[seg][pt][X], wp[seg][pt][Y], -iz];
                  }
               }
            }
      }
            
      
      //
      // mod_path_image_22D
      //    path from image 2.2D (intensity, depth, thickness)
      //

 
Path22D.prototype.pathImage22D = function() {
         // get images
         //
         var process_canvas = findEl("mod_process_canvas")
         var output_canvas = findEl("mod_output_canvas")
         var process_ctx = process_canvas.getContext("2d")
         process_ctx.drawImage(input_canvas, 0, 0)
         var process_img = process_ctx.getImageData(0, 0, process_canvas.width, process_canvas.height)
         var output_ctx = output_canvas.getContext("2d")
         var output_img = output_ctx.getImageData(0, 0, output_canvas.width, output_canvas.height)

         // set up path Web worker
         var worker = new Worker('./worker.js')
         var workerPath = [];
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
               path = e.data[1]

            } else if (e.data[0] == 'image') {
               //
               // image (debugging) message from worker
               //probablemente hay que borrar estas lineas
               img = e.data[1]
               ui.ui_clear()
               canvas = findEl("mod_output_canvas")
               canvas.width = img.width
               canvas.height = img.height
               canvas.style.display = "inline"
               var ctx = canvas.getContext("2d")
               ctx.putImageData(img, 0, 0)
            } else if (e.data[0] == 'return') {
               // path message from worker
               if (e.data[1] != -1) {
                  // path returned, call continue event
                  workerPath = e.data[1]
                  genPath (workerPath);
                  worker.terminate();
               }
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

         worker.postMessage(["calculatePath2D", args ]);
      }

Path22D.prototype.getPath = function (){
   return this.path;
}

Path22D.prototype.getMsg = function (){
   return this.msg;
}