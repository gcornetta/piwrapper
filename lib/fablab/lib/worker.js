//
// mod_path_worker.js
//   fab modules path Web Worker

var Img = require('./img');

process.on('message', function (msg) {
    args = msg[1];
    var imgData = new Img(args.imgPath);
        imgData.imgFlatten(function(imgD){
            args.img = imgD;
            args.dpi = imgD.dpi;
            var ret = fn[msg[0]](args)
            process.send(['path', ret, imgD.dpi])
        });
});

//
// define colors
//
var R = 0
var G = 1
var B = 2
var A = 3
//
// define word 0 states
//
var STATE = 0
var EMPTY = 0
var INTERIOR = (1 << 0)
var EDGE = (1 << 1)
var START = (1 << 2)
var STOP = (1 << 3)
//
// define word 1 directions
//
var DIRECTION = 1
var NONE = 0
var NORTH = (1 << 0)
var SOUTH = (1 << 1)
var EAST = (1 << 2)
var WEST = (1 << 3)
//
// define axes
//
var X = 0
var Y = 1
var Z = 2
//
// set up function object
//
var fn = {}
//
// mod_path_worker_get
//    get image value

   function imgGet(row, col, element) {
      return this.data[(this.height - 1 - row) * this.width * 4 + col * 4 + element];
   }
   //
   // mod_path_worker_set
   //   set image value
   //

   function imgSet(row, col, element, value) {
      this.data[(this.height - 1 - row) * this.width * 4 + col * 4 + element] = value;
   }
   //
   // mod_path_worker_dir
   //    return number of site directions
   //

   function imgDir(row, col) {
      var num = 0;
      if (this.get(row, col, DIRECTION) & NORTH) num += 1;
      if (this.get(row, col, DIRECTION) & SOUTH) num += 1;
      if (this.get(row, col, DIRECTION) & EAST) num += 1;
      if (this.get(row, col, DIRECTION) & WEST) num += 1;
      return num;
   }
   //
   // mod_path_worker_find_distances
   //    find Euclidean distance to interior in a thresholded array
   //

   function findDistances(img) {
      img.get = imgGet
      img.set = imgSet
      var view = new DataView(img.data.buffer);
      var nx = img.width;
      var ny = img.height;

         function distance(g, x, y, i) {
            return ((y - i) * (y - i) + g[i][x] * g[i][x]);
         }

         function intersection(g, x, y0, y1) {
            return ((g[y0][x] * g[y0][x] - g[y1][x] * g[y1][x] + y0 * y0 - y1 * y1) / (2.0 * (y0 - y1)));
         }
         //
         // allocate arrays
         //
      var g = [];
      for (var y = 0; y < ny; ++y)
         g[y] = new Uint32Array(nx);
      var h = [];
      for (var y = 0; y < ny; ++y)
         h[y] = new Uint32Array(nx);
      var distances = [];
      for (var y = 0; y < ny; ++y)
         distances[y] = new Uint32Array(nx);
      var starts = new Uint32Array(ny);
      var minimums = new Uint32Array(ny);
      //
      // column scan
      //
      for (var y = 0; y < ny; ++y) {
         //
         // right pass
         //
         var closest = -nx;
         for (var x = 0; x < nx; ++x) {
            if (img.get(y, x, STATE) & INTERIOR) {
               g[y][x] = 0;
               closest = x;
            } else
               g[y][x] = (x - closest);
         }
         //
         // left pass
         //
         closest = 2 * nx;
         for (var x = (nx - 1); x >= 0; --x) {
            if (img.get(y, x, STATE) & INTERIOR)
               closest = x;
            else {
               var d = (closest - x);
               if (d < g[y][x])
                  g[y][x] = d;
            }
         }
      }
      //
      // row scan
      //
      for (var x = 0; x < nx; ++x) {
         var segment = 0;
         starts[0] = 0;
         minimums[0] = 0;
         //
         // down
         //
         for (var y = 1; y < ny; ++y) {
            while ((segment >= 0) &&
               (distance(g, x, starts[segment], minimums[segment]) > distance(g, x, starts[segment], y)))
               segment -= 1;
            if (segment < 0) {
               segment = 0;
               minimums[0] = y;
            } else {
               newstart = 1 + intersection(g, x, minimums[segment], y);
               if (newstart < ny) {
                  segment += 1;
                  minimums[segment] = y;
                  starts[segment] = newstart;
               }
            }
         }
         //
         // up
         //
         for (var y = (ny - 1); y >= 0; --y) {
            var d = Math.sqrt(distance(g, x, y, minimums[segment]));
            view.setUint32((img.height - 1 - y) * 4 * img.width + x * 4, d);
            if (y == starts[segment])
               segment -= 1;
         }
      }
   }
   //
   // mod_path_worker_find_edges
   //    find edges
   //

   function findEdges(img) {
      img.get = imgGet;
      img.set = imgSet;
      //
      // check corners (todo)
      //
      //
      // check border
      //
      for (var row = 1; row < (img.height - 1); ++row) {
         col = 0;
         if (img.get(row, col, STATE) & INTERIOR) {
            var sum =
               (img.get(row + 1, col, STATE) & INTERIOR) + (img.get(row + 1, col + 1, STATE) & INTERIOR) + (img.get(row, col + 1, STATE) & INTERIOR) + (img.get(row - 1, col + 1, STATE) & INTERIOR) + (img.get(row - 1, col, STATE) & INTERIOR);
            if (sum != 5) {
               img.set(row, col, STATE, img.get(row, col, STATE) | EDGE);
            }
         }
         col = img.width - 1;
         if (img.get(row, col, STATE) & INTERIOR) {
            var sum =
               (img.get(row + 1, col, STATE) & INTERIOR) + (img.get(row + 1, col - 1, STATE) & INTERIOR) + (img.get(row, col - 1, STATE) & INTERIOR) + (img.get(row - 1, col - 1, STATE) & INTERIOR) + (img.get(row - 1, col, STATE) & INTERIOR);
            if (sum != 5) {
               img.set(row, col, STATE, img.get(row, col, STATE) | EDGE);
            }
         }
      }
      for (var col = 1; col < (img.width - 1); ++col) {
         row = 0
         if (img.get(row, col, STATE) & INTERIOR) {
            var sum =
               (img.get(row, col - 1, STATE) & INTERIOR) + (img.get(row + 1, col - 1, STATE) & INTERIOR) + (img.get(row + 1, col, STATE) & INTERIOR) + (img.get(row + 1, col + 1, STATE) & INTERIOR) + (img.get(row, col + 1, STATE) & INTERIOR);
            if (sum != 5) {
               img.set(row, col, STATE, img.get(row, col, STATE) | EDGE);
            }
         }
         row = img.height - 1;
         if (img.get(row, col, STATE) & INTERIOR) {
            var sum =
               (img.get(row, col - 1, STATE) & INTERIOR) + (img.get(row - 1, col - 1, STATE) & INTERIOR) + (img.get(row - 1, col, STATE) & INTERIOR) + (img.get(row - 1, col + 1, STATE) & INTERIOR) + (img.get(row, col + 1, STATE) & INTERIOR);
            if (sum != 5) {
               img.set(row, col, STATE, img.get(row, col, STATE) | EDGE);
            }
         }
      }
      //
      // check body
      //
      for (var row = 1; row < (img.height - 1); ++row) {
         for (var col = 1; col < (img.width - 1); ++col) {
            if (img.get(row, col, STATE) & INTERIOR) {
               var sum =
                  (img.get(row, col - 1, STATE) & INTERIOR) + (img.get(row + 1, col - 1, STATE) & INTERIOR) + (img.get(row + 1, col, STATE) & INTERIOR) + (img.get(row + 1, col + 1, STATE) & INTERIOR) + (img.get(row, col + 1, STATE) & INTERIOR) + (img.get(row - 1, col + 1, STATE) & INTERIOR) + (img.get(row - 1, col, STATE) & INTERIOR) + (img.get(row - 1, col - 1, STATE) & INTERIOR);
               if (sum != 8) {
                  img.set(row, col, STATE, img.get(row, col, STATE) | EDGE);
               }
            }
         }
      }
   }
   //
   // mod_path_worker_follow_edges
   //    follow image edges
   //

   function followEdges(img, error) {
      //
      // edge follower
      //
      function follow_edges(row, col) {
         if (img.dir(row, col) != 0) {
            ++segments;
            var x = col;
            var y = row;
            path[path.length] = [
               [x, y]
            ]
            while (1) {
               if (img.get(y, x, DIRECTION) & NORTH) {
                  img.set(y, x, DIRECTION, img.get(y, x, DIRECTION) & ~NORTH);
                  y += 1;
                  path[path.length - 1][path[path.length - 1].length] = [x, y];
               } else if (img.get(y, x, DIRECTION) & SOUTH) {
                  img.set(y, x, DIRECTION, img.get(y, x, DIRECTION) & ~SOUTH);
                  y -= 1;
                  path[path.length - 1][path[path.length - 1].length] = [x, y]
               } else if (img.get(y, x, DIRECTION) & EAST) {
                  img.set(y, x, DIRECTION, img.get(y, x, DIRECTION) & ~EAST);
                  x += 1;
                  path[path.length - 1][path[path.length - 1].length] = [x, y]
               } else if (img.get(y, x, DIRECTION) & WEST) {
                  img.set(y, x, DIRECTION, img.get(y, x, DIRECTION) & ~WEST);
                  x -= 1;
                  path[path.length - 1][path[path.length - 1].length] = [x, y];
               }
               if (img.dir(y, x) == 0) {
                  break
               }
            }
         }
      }
      img.get = imgGet;
      img.set = imgSet;
      img.dir = imgDir;
      var segments = points = 0;
      var path = [];
      //
      // follow border starts
      //
      for (var row = 1; row < (img.height - 1); ++row) {
         col = 0;
         follow_edges(row, col);
         col = img.width - 1;
         follow_edges(row, col);
      }
      for (var col = 1; col < (img.width - 1); ++col) {
         row = 0;
         follow_edges(row, col);
         row = img.height - 1;
         follow_edges(row, col);
      }
      //
      // follow body paths
      //
      for (var row = 1; row < (img.height - 1); ++row) {
         for (var i = 1; i < (img.width - 1); ++i) {
            if (((row + 2) % 2) == 0)
               col = i;
            else
               col = img.width - i - 1;
            follow_edges(row, col);
         }
      }
      return path;
   }

   //
   // mod_path_worker_image_2D_calculate
   //    path from image 2D calculate
   //
fn["calculatePath2D"] = function(args) {
   var img = args.img;  //process_img img is a Uint8ClampedArray object
   //var output_img = args[2]
   var outImg = args.img;
   var threshold = args.threshold;
   var offset = args.offset; //number
   var diameter = args.diameter;
   var overlap = args.overlap;
   var error = args.error;
   var direction = args.direction;
   var sorting = args.sorting;
   var sortMerge = args.sortMerge;
   var sortOrder = args.sortOrder;
   var sortSequence = args.sortSequence;
   var dpi = args.dpi;
   //
   // threshold
   //
   //self.postMessage(["prompt", 'threshold']);
   calcThreshold(img, threshold);
   //
   // find distances
   //
   //self.postMessage(["prompt", 'calculate distances']);
   findDistances(img);
   //
   // offset
   //
   var path = [];
   var pathOrder = [];
   var n = 0;
   var distance = dpi * diameter / (2 * 25.4); //cuidado con mm y pulgadas
   while (true) {
      n += 1;
      //self.postMessage(["prompt", 'offset ' + n + '/' + offset]);
      calcOffset(img, distance, outImg);
      //
      // find edges
      //
      findEdges(outImg);
      //
      // orient edges
      //
      orientEdges(outImg);
      //
      // follow edges
      //
      var offsetPath = followEdges(outImg, error);
      if (offsetPath.length > 0) {
         //
         // vectorize path
         //
         offsetPath = vectorize2D(offsetPath, error);
         //
         // append path
         //
         path = path.concat(offsetPath);
         var segOrder = new Array(offsetPath.length);
         for (var i = 0; i < segOrder.length; ++i)
            segOrder[i] = n;
         pathOrder = pathOrder.concat(segOrder);
      }
      //
      // loop
      //
      //self.postMessage(["path", path]);
      return path;
      if ((n == offset) || (offsetPath.length == 0))
         break;
      distance += (1 - overlap / 100) * dpi * diameter / 25.4; //cuidado con las conversiones mm pulgadas
   }
   //
   // set direction
   //
   if (!direction) {
      for (var seg = 0; seg < path.length; ++seg) {
         for (var pt = 0; pt < (path[seg].length / 2); ++pt) {
            var temp = path[seg][pt];
            path[seg][pt] = path[seg][path[seg].length - pt - 1];
            path[seg][path[seg].length - pt - 1] = temp;
         }
      }
   }
   //
   // sort path
   //
   if (sorting) {
      //self.postMessage(["prompt", 'sort']);
      var sortDistance = sortMerge * dpi * diameter / 25.4; //cuidado con las conversiones
      path = sortWeightedPath(path, pathOrder, sortDistance, sortOrder, sortSequence);
   }
   //
   // return path
   //
   return path;
}

//
// mod_path_worker_image_offset_z
//    z offset Int32 height image
//    todo: faster search
//
fn["imageOffsetZ"] = function(args) {
   var img = args.img;
   var diameter = args.diameter;
   var overlap = args.overlap;
   var type = args.type;
   var xz = args.xz;
   var yz = args.yz;
   var error = args.error;
   var dpi = args.dpi;
   var bottomZ = args.bottomZ;
   var bottomI = args.bottomI;
   var topZ = args.topZ;
   var topI = args.topI;
   var view = new DataView(img.data.buffer);
   //
   // set height
   //
   //self.postMessage(['prompt', 'set height']);
   setImageHeight(img, bottomZ, bottomI, topZ, topI, dpi);
   //
   // set tool
   //
   var ir = Math.floor(0.5 + dpi * diameter / (2 * 25.4));
   var id = Math.floor(0.5 + ((100 - overlap) / 100) * dpi * diameter / 25.4);
   var tool = [];
   for (var row = 0; row < 2 * ir; ++row) {
      for (var col = 0; col < 2 * ir; ++col) {
         var r = Math.sqrt((row - ir) * (row - ir) + (col - ir) * (col - ir))
         if (r < ir) {
            if (type) {
               //
               // flat end
               //
               tool[tool.length] = [row - ir, col - ir, 0];
            } else {
               //
               // ball end
               //
               var iz = Math.sqrt(ir * ir - ((row - ir) * (row - ir) + (col - ir) * (col - ir))) - ir;
               tool[tool.length] = [row - ir, col - ir, iz];
            }
         }
      }
   }

   var path = [];
   //
   // xz
   //
   if (xz) {
      var sign = 1;
      path[path.length] = [];
      for (var row = ir; row <= (img.height - ir); row += id) {
         //self.postMessage(['prompt', 'row ' + row + '/' + img.height]);
         var offset = 0 * (sign + 1) / 2 + (img.width - 1) * (1 - sign) / 2;
         newpath = [];
         for (var col = ir; col < (img.width - ir); ++col) {
            //
            // offset tool
            //
            var rcol = sign * col + offset;
            var izmax = -1e10;
            for (var t = 0; t < tool.length; ++t) {
               var iz = tool[t][2] +
                  view.getInt32((img.height - 1 - (row + tool[t][0])) * 4 * img.width + (rcol + tool[t][1]) * 4, false);
               if (iz > izmax)
                  izmax = iz;
            }
            newpath[newpath.length] = [rcol, row, izmax];
         }
         //
         // vectorize
         //
         newpath = vectorize3DSegment(newpath, error);
         //
         // add to path
         //
         for (var pt = 0; pt < newpath.length; ++pt)
            path[path.length - 1][path[path.length - 1].length] = newpath[pt]
         //self.postMessage(['path', path])
         sign = -sign
      }
   }
   //
   // yz
   //
   if (yz) {
      var sign = -1
      path[path.length] = []
      for (var col = ir; col <= (img.width - ir); col += id) {
         //self.postMessage(['prompt', 'column ' + col + '/' + img.width])
         var offset = 0 * (sign + 1) / 2 + (img.height - 1) * (1 - sign) / 2
         newpath = []
         for (var row = ir; row < (img.height - ir); ++row) {
            //
            // offset tool
            //
            var rrow = sign * row + offset
            var izmax = -1e10
            for (var t = 0; t < tool.length; ++t) {
               var iz = tool[t][2] +
                  view.getInt32((img.height - 1 - (rrow + tool[t][0])) * 4 * img.width + (col + tool[t][1]) * 4, false)
               if (iz > izmax)
                  izmax = iz
            }
            newpath[newpath.length] = [col, rrow, izmax]
            //
            // check clearance
            //
         }
         //
         // vectorize
         //
         newpath = vectorize3DSegment(newpath, error)
         //
         // add to path
         //
         for (var pt = 0; pt < newpath.length; ++pt)
            path[path.length - 1][path[path.length - 1].length] = newpath[pt]
         //self.postMessage(['path', path])
         sign = -sign
      }
   }

   return path
}
//
// mod_path_worker_image_set_height
//    set image intensity to Int32 height
//

function setImageHeight(img, bottomZ, bottomI, topZ, topI, dpi) {
   img.get = imgGet;
   var view = new DataView(img.data.buffer);
   var imax = 256 * 256 * 256 - 1;
   for (var row = 0; row < img.height; ++row) {
      for (var col = 0; col < img.width; ++col) {
         var intensity = (img.get(row, col, 0) + (img.get(row, col, 1) << 8) + (img.get(row, col, B) << 16)) / imax;
         var z = bottomZ + (topZ - bottomZ) * (intensity - bottomI) / (topI - bottomI);
         var iz = Math.floor(0.5 + dpi * z / 25.4);
         view.setInt32((img.height - 1 - row) * 4 * img.width + col * 4, iz);
      }
   }
}

//
// mod_path_worker_offset
//    offset Uint32 distance array
//

function calcOffset(distances, distance, img) {
   img.set = imgSet;
   var view = new DataView(distances.data.buffer);
   for (var row = 0; row < img.height; ++row) {
      for (var col = 0; col < img.width; ++col) {
         if (view.getUint32((distances.height - 1 - row) * distances.width * 4 + col * 4, false) <= distance)
            img.set(row, col, STATE, INTERIOR);
         else
            img.set(row, col, STATE, EMPTY);
         img.set(row, col, DIRECTION, NONE);
      }
   }
}
//
// mod_path_worker_orient_edges
//    orient edges
//

function orientEdges(img) {
   img.get = imgGet;
   img.set = imgSet;
   //
   // orient corners (todo)
   //
   //
   // orient border states
   //
   for (var row = 1; row < (img.height - 1); ++row) {
      col = 0;
      if (img.get(row, col, STATE) & EDGE) {
         if ((img.get(row, col + 1, 0) & INTERIOR) &&
            (!(img.get(row + 1, col, 0) & INTERIOR) || !(img.get(row + 1, col + 1, 0) & INTERIOR))) {
            img.set(row, col, DIRECTION, EAST);
            img.set(row, col, STATE, img.get(row, col, STATE) | START);
         }
      }
      if (img.get(row, col, STATE) & EDGE) {
         if ((img.get(row + 1, col, 0) & INTERIOR) && !(img.get(row - 1, col, 0) & INTERIOR)) {
            img.set(row, col, DIRECTION, 0);
            img.set(row, col, STATE, img.get(row, col, STATE) | STOP);
         }
      }
      col = img.width - 1;
      img.set(row, col, DIRECTION, 0)
      if (img.get(row, col, STATE) & EDGE) {
         if ((img.get(row, col - 1, 0) & INTERIOR) &&
            (!(img.get(row - 1, col, 0) & INTERIOR) || !(img.get(row - 1, col - 1, 0) & INTERIOR))) {
            img.set(row, col, DIRECTION, WEST);
            img.set(row, col, STATE, img.get(row, col, STATE) | START);
         }
      }
      if (img.get(row, col, STATE) & EDGE) {
         if ((img.get(row - 1, col, 0) & INTERIOR) && !(img.get(row + 1, col, 0) & INTERIOR)) {
            img.set(row, col, DIRECTION, 0);
            img.set(row, col, STATE, img.get(row, col, STATE) | STOP);         }
      }
   }
   for (var col = 1; col < (img.width - 1); ++col) {
      row = 0
      img.set(row, col, DIRECTION, 0)
      if (img.get(row, col, STATE) & EDGE) {
         if ((img.get(row + 1, col, STATE) & INTERIOR) &&
            (!(img.get(row, col - 1, STATE) & INTERIOR) || !(img.get(row + 1, col - 1, STATE) & INTERIOR))) {
            img.set(row, col, DIRECTION, NORTH);
            img.set(row, col, STATE, img.get(row, col, STATE) | START);
         }
      }
      if (img.get(row, col, STATE) & EDGE) {
         if ((img.get(row, col - 1, 0) & INTERIOR) && !(img.get(row, col + 1, 0) & INTERIOR)) {
            img.set(row, col, DIRECTION, 0);
            img.set(row, col, STATE, img.get(row, col, STATE) | STOP);
         }
      }
      row = img.height - 1
      img.set(row, col, DIRECTION, 0)
      if (img.get(row, col, STATE) & EDGE) {
         if ((img.get(row - 1, col, STATE) & INTERIOR) &&
            (!(img.get(row, col + 1, 0) & INTERIOR) || !(img.get(row - 1, col + 1, 0) & INTERIOR))) {
            img.set(row, col, DIRECTION, SOUTH);
            img.set(row, col, STATE, img.get(row, col, STATE) | START);
         }
      }
      if (img.get(row, col, STATE) & EDGE) {
         if ((img.get(row, col + 1, 0) & INTERIOR) && !(img.get(row, col - 1, 0) & INTERIOR)) {
            img.set(row, col, DIRECTION, 0);
            img.set(row, col, STATE, img.get(row, col, STATE) | STOP);
         }
      }
   }
   //
   // orient body states
   //
   for (var row = 1; row < (img.height - 1); ++row) {
      for (var col = 1; col < (img.width - 1); ++col) {
         img.set(row, col, DIRECTION, 0);
         if (img.get(row, col, STATE) & EDGE) {
            if ((img.get(row + 1, col, STATE) & INTERIOR) &&
               (!(img.get(row, col - 1, STATE) & INTERIOR) || !(img.get(row + 1, col - 1, STATE) & INTERIOR))) {
               img.set(row, col, DIRECTION, img.get(row, col, DIRECTION) | NORTH);
            }
            if ((img.get(row - 1, col, STATE) & INTERIOR) &&
               (!(img.get(row, col + 1, 0) & INTERIOR) || !(img.get(row - 1, col + 1, 0) & INTERIOR))) {
               img.set(row, col, DIRECTION, img.get(row, col, DIRECTION) | SOUTH);
            }
            if ((img.get(row, col + 1, 0) & INTERIOR) &&
               (!(img.get(row + 1, col, 0) & INTERIOR) || !(img.get(row + 1, col + 1, 0) & INTERIOR))) {
               img.set(row, col, DIRECTION, img.get(row, col, DIRECTION) | EAST);
            }
            if ((img.get(row, col - 1, 0) & INTERIOR) &&
               (!(img.get(row - 1, col, 0) & INTERIOR) || !(img.get(row - 1, col - 1, 0) & INTERIOR))) {
               img.set(row, col, DIRECTION, img.get(row, col, DIRECTION) | WEST);
            }
         }
      }
   }
}
//
// mod_path_worker_sort_weighted
//    sort 2D path weighted
//    todo: more efficient sort
//

function sortWeightedPath(path, pathOrder, mergeDistance, orderWeight, sequenceWeight) {
   if (path.length <= 1)
      return path;
   var newpath = []
   if (sequenceWeight > 0) {
      var istart = 0;
      var iend = path.length - 1;
      var x0 = path[0][path[0].length - 1][X];
      var y0 = path[0][path[0].length - 1][Y];
      newpath[newpath.length] = path[0];
      path.splice(0, 1);
      pathOrder.splice(0, 1);
      var endpath = path[path.length - 1];
      path.splice(path.length - 1, 1);
      pathOrder.splice(pathOrder.length - 1, 1);
   } else {
      var istart = path.length - 1;
      var iend = 0;
      var x0 = path[path.length - 1][path[path.length - 1].length - 1][X];
      var y0 = path[path.length - 1][path[path.length - 1].length - 1][Y];
      newpath[newpath.length] = path[path.length - 1];
      path.splice(path.length - 1, 1);
      pathOrder.splice(pathOrder.length - 1, 1);
      var endpath = path[0];
      path.splice(0, 1);
      pathOrder.splice(0, 1);
   }
   while (path.length > 0) {
      var dmin = Number.MAX_VALUE;
      var wmin = Number.MAX_VALUE;
      for (var seg = 0; seg < path.length; ++seg) {
         var x1 = path[seg][0][0];
         var y1 = path[seg][0][1];
         var d = (x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0);
         var w = (x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0) + orderWeight * pathOrder[seg] + sequenceWeight * (seg / path.length);
         if (w < wmin) {
            wmin = w;
            dmin = d;
            var segmin = seg;
         }
      }
      x0 = path[segmin][path[segmin].length - 1][X];
      y0 = path[segmin][path[segmin].length - 1][Y];
      if (Math.sqrt(dmin) <= mergeDistance)
         newpath[newpath.length - 1] = newpath[newpath.length - 1].concat(path[segmin]);
      else
         newpath[newpath.length] = path[segmin];
      path.splice(segmin, 1);
      pathOrder.splice(segmin, 1);
   }
   newpath[newpath.length] = endpath;
   return newpath;
}
//
// mod_path_worker_threshold
//    threshold RGBA image, 0-1 range
//

function calcThreshold(img, threshold) {
   img.get = imgGet;
   img.set = imgSet;
   var imax = 256 * 256 * 256 - 1;
   for (var row = 0; row < img.height; ++row) {
      for (var col = 0; col < img.width; ++col) {
         var intensity = (img.get(row, col, 0) + (img.get(row, col, 1) << 8) + (img.get(row, col, B) << 16)) / imax;
         if (intensity > threshold)
            img.set(row, col, STATE, INTERIOR);
         else
            img.set(row, col, STATE, EMPTY);
         img.set(row, col, DIRECTION, NONE);
      }
   }
}
//
// mod_path_worker_vectorize2
//    vectorize 2D path
//

function vectorize2D(oldpath, error) {
   var path = [];
   var count = 0;
   for (var seg = 0; seg < oldpath.length; ++seg) {
      var x0 = oldpath[seg][0][X];
      var y0 = oldpath[seg][0][Y];
      path[path.length] = [
         [x0, y0]
      ];
      count += 1;
      var xsum = x0;
      var ysum = y0;
      var sum = 1;
      for (var pt = 1; pt < oldpath[seg].length; ++pt) {
         var xold = x;
         var yold = y;
         var x = oldpath[seg][pt][X]
         var y = oldpath[seg][pt][Y]
         if (sum == 1) {
            xsum += x;
            ysum += y;
            sum += 1;
         } else {
            var xmean = xsum / sum;
            var ymean = ysum / sum;
            var dx = xmean - x0;
            var dy = ymean - y0;
            var d = Math.sqrt(dx * dx + dy * dy);
            var nx = dy / d;
            var ny = -dx / d;
            var l = Math.abs(nx * (x - x0) + ny * (y - y0));
            if (l < error) {
               xsum += x;
               ysum += y;
               sum += 1;
            } else {
               path[path.length - 1][path[path.length - 1].length] = [xold, yold];
               count += 1;
               x0 = xold;
               y0 = yold;
               xsum = xold;
               ysum = yold;
               sum = 1;
            }
         }
         if (pt == (oldpath[seg].length - 1)) {
            path[path.length - 1][path[path.length - 1].length] = [x, y];
            count += 1;
         }
      }
   }
   return path;
}
//
// mod_path_worker_vectorize3
//    vectorize 3D path
//

function vectorize3D(oldpath, error) {
   var path = [];
   var count = 0;
   for (var seg = 0; seg < oldpath.length; ++seg) {
      var x0 = oldpath[seg][0][X];
      var y0 = oldpath[seg][0][Y];
      var z0 = oldpath[seg][0][Z];
      path[path.length] = [
         [x0, y0, z0]
      ];
      count += 1;
      var xsum = x0;
      var ysum = y0;
      var zsum = z0;
      var sum = 1;
      for (var pt = 1; pt < oldpath[seg].length; ++pt) {
         var xold = x;
         var yold = y;
         var zold = z;
         var x = oldpath[seg][pt][X];
         var y = oldpath[seg][pt][Y];
         var z = oldpath[seg][pt][Z];
         if (sum == 1) {
            xsum += x;
            ysum += y;
            zsum += z;
            sum += 1;
         } else {
            var xmean = xsum / sum;
            var ymean = ysum / sum;
            var zmean = zsum / sum;
            var dx = xmean - x0;
            var dy = ymean - y0;
            var dz = zmean - z0;
            var d = Math.sqrt(dx * dx + dy * dy + dz * dz);
            var nx = dx / d;
            var ny = dy / d;
            var nz = dz / d;
            var vx = (x - x0);
            var vy = (y - y0);
            var vz = (z - z0);
            var l = Math.sqrt((vx * vx + vy * vy + vz * vz) - (vx * nx + vy * ny + vz * nz) * (vx * nx + vy * ny + vz * nz));
            if (l < error) {
               xsum += x;
               ysum += y;
               zsum += z;
               sum += 1;
            } else {
               path[path.length - 1][path[path.length - 1].length] = [xold, yold, zold];
               count += 1;
               x0 = xold;
               y0 = yold;
               z0 = zold;
               xsum = xold;
               ysum = yold;
               zsum = zold;
               sum = 1;
            }
         }
         if (pt == (oldpath[seg].length - 1)) {
            path[path.length - 1][path[path.length - 1].length] = [x, y, z];
            count += 1;
         }
      }
   }
   return path;
}
//
// mod_path_worker_vectorize3_segment
//    vectorize 3D path segment
//

function vectorize3DSegment(oldpath, error) {
   var path = [];
   var count = 0;
   var x0 = oldpath[0][X];
   var y0 = oldpath[0][Y];
   var z0 = oldpath[0][Z];
   path[path.length] = [x0, y0, z0];
   count += 1;
   var xsum = x0;
   var ysum = y0;
   var zsum = z0;
   var sum = 1;
   for (var pt = 1; pt < oldpath.length; ++pt) {
      var xold = x;
      var yold = y;
      var zold = z;
      var x = oldpath[pt][X];
      var y = oldpath[pt][Y];
      var z = oldpath[pt][Z];
      if (sum == 1) {
         xsum += x;
         ysum += y;
         zsum += z;
         sum += 1;
      } else {
         var xmean = xsum / sum;
         var ymean = ysum / sum;
         var zmean = zsum / sum;
         var dx = xmean - x0;
         var dy = ymean - y0;
         var dz = zmean - z0;
         var d = Math.sqrt(dx * dx + dy * dy + dz * dz);
         var nx = dx / d;
         var ny = dy / d;
         var nz = dz / d;
         var vx = (x - x0);
         var vy = (y - y0);
         var vz = (z - z0);
         var l = Math.sqrt((vx * vx + vy * vy + vz * vz) - (vx * nx + vy * ny + vz * nz) * (vx * nx + vy * ny + vz * nz));
         if (l < error) {
            xsum += x;
            ysum += y;
            zsum += z;
            sum += 1;
         } else {
            path[path.length] = [xold, yold, zold];
            count += 1;
            x0 = xold;
            y0 = yold;
            z0 = zold;
            xsum = xold;
            ysum = yold;
            zsum = zold;
            sum = 1;
         }
      }
      if (pt == (oldpath.length - 1)) {
         path[path.length] = [x, y, z];
         count += 1;
      }
   }
   return path;
}