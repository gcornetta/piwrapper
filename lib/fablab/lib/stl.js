var fs = require('fs');
var STL = require('stl.js');


function Stl (file, dpi){
   this.file = file;
   this.dpi = dpi;
   this.bb = require('node-stl').NodeStl(file);
   this.width = Math.floor(dpi*(this.bb.boundingBox[0]/25.4));
   this.height = Math.floor(dpi*(this.bb.boundingBox[1]/25.4));
   this.bbx = this.bb.boundingBox[0];
   this.bby = this.bb.boundingBox[1];
   this.bbz = this.bb.boundingBox[2];
   this.img = new Uint8ClampedArray(this.width * this.height * 4);
   this.zmax = -Number.MAX_VALUE;
   this.zmin = Number.MAX_VALUE;
   this.RED = 0;
   this.GREEN = 1;
   this.BLUE = 2;
   this.ALPHA = 3;
   this.stl = {};
}

var stlRead = function (callback) {
   var stl;
   fs.createReadStream(this.file)
      .pipe(new STL.ParseStream())
      .construct()
      .on('data', function (chunk) {
         stl = chunk;//check if = is ok otherwise should be +=
   })
   .on('finish', callback(stl));
}  

var stlImgSet = function (row, col, pixelElem, val) {
   this.img[(this.height - 1 - row) * this.width * 4 + col * 4 + pixelElem] = val;
}

 var  stlTriangleHeight = function(t) {

   var p0 = t.vertices[0];
   var x0 = p0[0];
   var y0 = p0[1];
   var z0 = p0[2];
   var p1 = t.vertices[1];
   var x1 = p1[0];
   var y1 = p1[1];
   var z1 = p1[2];
   var p2 = t.vertices[2];
   var x2 = p2[0];
   var y2 = p2[1];
   var z2 = p2[2];
   
   //get max and min z
   var maxZ = Math.max.apply(null, [z0, z1, z2]);
   //in ECMAScript 6: var maxZ = Math.max(...[z0, z1, z2])
   var minZ = Math.min.apply(null, [z0, z1, z2]);

   if (maxZ > this.zmax) {
      this.zmax = maxZ;
   }

   if (minZ < this.zmin) {
      this.zmin = minZ;
   }

   if (x1 < (x0+((x2-x0)*(y1-y0))/(y2-y0)))
      var dir = 1;
   else
      var dir = -1;

   // set z values
   //
   var view = new DataView(this.img); 
   if (y2 != y1) {
      for (var y = y1; y <= y2; ++y) {
         if (y < 0) continue;
         if (y > (this.height - 1)) break;
         x12 = Math.floor(0.5+x1+(y-y1)*(x2-x1)/(y2-y1));
         z12 = z1+(y-y1)*(z2-z1)/(y2-y1);
         x02 = Math.floor(0.5+x0+(y-y0)*(x2-x0)/(y2-y0));
         z02 = z0+(y-y0)*(z2-z0)/(y2-y0);
         if (x12 != x02)
            var slope = (z02-z12)/(x02-x12);
         else
            var slope = 0;
         var x = x12 -dir; 
         while (x != x02) {
            x += dir
            if ((x < 0) || (x > (this.width-1))) continue
            var z = z12+slope*(x-x12)
            if (z > view.getFloat32((this.height-1-y)*4*this.width+x*4))
               view.setFloat32((this.height-1-y)*4*this.width+x*4,z)
         }
      }
   }
   
   if (y1 != y0) {
      for (var y = y0; y <= y1; ++y) {
         if (y < 0) continue
         if (y > (img.height-1)) break
         x01 = Math.floor(0.5+x0+(y-y0)*(x1-x0)/(y1-y0))
         z01 = z0+(y-y0)*(z1-z0)/(y1-y0)
         x02 = Math.floor(0.5+x0+(y-y0)*(x2-x0)/(y2-y0))
         z02 = z0+(y-y0)*(z2-z0)/(y2-y0)
         if (x01 != x02)
            var slope = (z02-z01)/(x02-x01)
         else
            var slope = 0
            var x = x01-dir; 
         while (x != x02) {
            x += dir
            if ((x < 0) || (x > (img.width-1))) continue
            var z = z01+slope*(x-x01)
            if (z > view.getFloat32((this.height-1-y)*4*this.width+x*4))
               view.setFloat32((this.height-1-y)*4*this.width+x*4,z)
         }
      }
   }
}


Stl.prototype.stlHeightMap = function(mesh,img) {
   stlRead(function(stl){
      if(!stl){
         console.log('cannot parse stl file');
      } else {
         this.stl = stl;
         
         if (stl.format == 'ascii'){
            console.log('not an stl binary file');
            return; //better to return sameting or accept or call a callback
         } else {

            var trianglesNumber = stl.header.count;
            
            var zclear = -1e10;
            var view = new DataView(this.img);
            for (var row = 0; row < this.height; ++row)
               for (var col = 0; col < this.width; ++col)
                  view.setFloat32(row*4*this.width+col*4,zclear);

            for (var t = 0; t < trianglesNumber; ++t)
               stlTriangleHeight(stl.triangles[t]);

            //
            // set background
            //
            for (var row = 0; row < img.height; ++row)
               for (var col = 0; col < img.width; ++col) {
                  var z = view.getFloat32((img.height-1-row)*4*img.width+col*4)
                  if (z == zclear)
                     view.setFloat32((img.height-1-row)*4*img.width+col*4,this.zmax)
               }

            //
            // map height to intensity
            //
            var imax = 256 * 256 * 256 - 1
            for (var row = 0; row < img.height; ++row)
               for (var col = 0; col < img.width; ++col) {
                  var z = view.getFloat32((img.height-1-row)*4*img.width+col*4);
                  var i = Math.floor(imax*(z-this.zmin)/(this.zmax-this.zmin));
                  stlImgSet(row,col,this.RED,(i & 255));
                  stlImgSet(row,col,this.GREEN,((i >> 8) & 255));
                  stlImgSet(row,col,this.BLUE,((i >> 16) & 255));
                  stlImgSet(row,col,this.ALPHA,255);
               }
         }
      }
   });     
}

Stl.prototype.getStl = function() {
   if(!this.stl){
      stlRead(function(stl){
         this.stl = stl;
      });
      return this.stl;
   } else {
      return this.stl;
   }
}

Stl.prototype.getBoundingBox = function(callback) {
   return this.bb.boundingBox;  
}   

Stl.prototype.getWidth = function(){
   return this.width;
}

module.exports = Stl;