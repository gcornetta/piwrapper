var fs = require('fs');
var PNG = require('pngjs').PNG;


function Img (img){
   this.RED = 0;
   this.GREEN = 1;
   this.BLUE = 2;
   this.ALPHA = 3;
   this.img = img;

   //calculate DPI
   var readImg = fs.readFileSync(img);
   this.dataView = new DataView(readImg.buffer);
   this.dpi = getDPI(this.dataView);
}

var imgRead = function (img, callback) {
   fs.createReadStream(img)
      .pipe(new PNG({
         filterType: 4
      }))
      .on('parsed', function() {
            callback({data: this.data, width: this.width, height: this.height});
      })
      .on('error', function(){
        callback(null);
   });
}

Img.prototype.imgFlatten = function(callback) {
   var that = this;
   imgRead(this.img, function(img){
      if(!img){
         console.log('troubles parsing the image');
         callback(null);
      } else {
         for (var i = 0; i<img.data.length; i+=4){
            if(img.data[i+this.ALPHA] != 255){
                img.data[i+this.RED] = 255;
                img.data[i+this.GREEN] = 255;
                img.data[i+this.BLUE]  = 255;
                img.data[i+this.ALPHA] = 255;
            }
         }
      img.dpi = that.dpi;
      callback(img);
      }
   });
}

Img.prototype.imgInvert = function(callback){

   imgRead(this.img, function(img){
      if(!img){
         console.log('troubles parsing the image');
         callback(null);
      } else {

         for (var y = 0; y< img.height; y++) {
            for (var x = 0; x< img.width; y++) {
               var idx = (img.width * y + x) << 2;
               // invert color
               img.data[idx+this.RED] = 255 - img.data[idx+this.RED];
               img.data[idx+this.GREEN] = 255 - img.data[idx+this.GREEN];
               img.data[idx+this.BLUE] = 255 - img.data[idx+this.BLUE];
            }
         }
      }
      callback(img);
   });
}

Img.prototype.imgHalftone = function (halftone, callback) {
   var that = this;
   imgRead(this.img, function(img){
      if(!img){
         console.log('troubles parsing the image');
         callback(null);
      } else {
         var dx = Math.floor(that.dpi * halftone.spotSize * ( 1+ halftone.horSpotSpacing/100) / (2 * 25.4));
         var dy = Math.floor(that.dpi * halftone.spotSize * ( 1+ halftone.verSpotSpacing/100) / (2 * 25.4));
         var r = Math.floor(that.dpi * (halftone.spotSize / 2) / 25.4);
         var dr = Math.floor(that.dpi * (halftone.diameter / 2) / 25.4);
         var rmin = Math.floor(r * halftone.spotMin / 100);
         var y = Math.floor(dy); //rows
         var x = Math.floor(dx); //columns
         var delta = 2 * dx;
         var path = [];

         while(y + r < img.height){
            if ((x + r) >= img.width) {
               x -= 3 * dx;
               y += dy;
               delta = -2 * dx;
            } else if ((x - r) < 0) {
               x += dx;
               y += dy;
               delta = 2 * dx;
            }
            var idx = (img.width * y + x) << 2;
            var i = (img.data[idx+that.RED] + img.data[idx+that.GREEN] + img.data[idx+that.BLUE])/ (3 *255);
            if ((i * (r - dr)) > rmin) {
               path[path.length] = [];
                var radius = r - dr;
                while (radius > 0) {
                  for (var n = 0; n <= halftone.spotPoints; ++n) {
                     var angle = 2 * Math.PI * n / halftone.spotPoints;
                     var xx = Math.floor(x + i * radius * Math.cos(angle));
                     var yy = Math.floor(y + i * radius * Math.sin(angle));
                     path[path.length - 1][path[path.length - 1].length] = [xx, yy];
                }
                   if ((dr > 0) && spot_fill) {radius -= 2 * dr;}
                     else break;
               }
            }
            x += delta;
         }
         callback(path, that.dpi);
      }
   });
}

function getDPI(view) {
      //
      // get DPI
      //
      // 8 header
      // 4 len, 4 type, data, 4 crc
      // pHYs 4 ppx, 4 ppy, 1 unit: 0 ?, 1 meter
      // IEND
      //
      var units = ppx = ppy = 0
      //var buf = event.target.result
      //var view = new DataView(buf)
      var ptr = 8
      if (!((view.getUint8(1) == 80) && (view.getUint8(2) == 78) && (view.getUint8(3) == 71))) {
         console.log("error: PNG header not found")
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
         console.log("no PNG units not found, assuming 72 DPI")
         ppx = 72 * 1000 / 25.4
      }
      var dpi = ppx * 25.4 / 1000
      return dpi;
   }

module.exports = Img;