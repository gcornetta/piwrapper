var fs = require('fs');
var PNG = require('pngjs').PNG;


function Img (img, dpi){
   this.RED = 0;
   this.GREEN = 1;
   this.BLUE = 2;
   this.ALPHA = 3;
   this.img = img;
   this.dpi = dpi;
}

var imgRead = function (img, callback) {
 
   fs.createReadStream(img)
      .pipe(new PNG({
         filterType: 4
      }));
         
   PNG.on('parsed', function() {
            callback (PNG);
    });

   PNG.on('error'. function(){
      callback(null);
   });
}  

Img.prototype.imgFlatten = function(callback) {
   
   imgRead(this.img, function(img){
      if(!img){ 
         console.log('troubles parsing the image');
         callback(null);
      } else {

         for (var y = 0; y< img.height; y++) {
            for (var x = 0; x< img.width; y++) {
               var idx = (img.width * y + x) << 2;
                  if(img.data[idx+this.ALPHA] != 255){
                     img.data[idx+this.RED] = 255;
                     img.data[idx+this.GREEN] = 255;
                     img.data[idx+this.BLUE]  = 255;
                     img.data[idx+this.ALPHA] = 255;
                  }
            } 
         }
      callback(img);
      }
   });
   
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
   
   imgRead(this.img, function(img){
      if(!img){ 
         console.log('troubles parsing the image');
         callback(null);
      } else {
         var dx = Math.floor(this.dpi * halftone.spotSize * ( 1+ halftone.horSpotSpacing/100) / (2 * 25.4));
         var dy = Math.floor(this.dpi * halftone.spotSize * ( 1+ halftone.verSpotSpacing/100) / (2 * 25.4));
         var r = Math.floor(this.dpi * (halftone.spotSize / 2) / 25.4);
         var dr = Math.floor(this.dpi * (halftone.diameter / 2) / 25.4);
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
            var i = (img.data[idx+this.RED] + img.data[idx+this.GREEN] img.data[idx+this.BLUE])/ (3 *255);
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
         callback(path);
}

module.exports = Img;