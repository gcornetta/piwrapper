   function GccVinyl (path, config){
      this.fileExt = '.gcc';
      this.path = path;
      this.width = config.width;
      this.height = config.height;
      this.dpi = config.dpi;
      this.force = parseFloat(config.force);
      this.velocity = parseFloat(config.velocity);
      this.xoffset = config.xoffset;
      this.yoffset = config.yoffset;
      this.startCorner = config. startCorner; 
   }

   function toMillimeters(val){
      return parseFloat(val) * 25.4;
   }

   GccVynil.prototype.cmdString = function (callback) {

      var dx = toMillimeters (this.width / this.dpi);
      var dy = toMillimeters (this.height / this.dpi);
      var nx = this.width;
      var ny = this.height;

      var str = "PA;PA;!ST1;!FS" + this.force + ";VS" + this.velocity + ";\n";
      var scale = 40.0 * dx / (nx - 1.0); // 40mm
      var ox = 0;
      var oy = 0;
      
      if (this.startCorner = 'bottom left') {
         var xoffset = 40.0 * ox;
         var yoffset = 40.0 * oy;
      } else if (this.startCorner = 'bottom right') {
         var xoffset = 40.0 * (ox - dx);
         var yoffset = 40.0 * oy;
      } else if (this.startCorner = 'top left') {
         var xoffset = 40.0 * ox;
         var yoffset = 40.0 * (oy - dy);
      } else { //top right
         var xoffset = 40.0 * (ox - dx);
         var yoffset = 40.0 * (oy - dy);
      }
      // loop over segments
      for (var seg = 0; seg < this.path.length; ++seg) {
         x = xoffset + scale * this.path[seg][0][0];
         y = yoffset + scale * this.path[seg][0][1];
         str += "PU" + x.toFixed(0) + "," + y.toFixed(0) + ";\n"; // move up to start point
         str += "PU" + x.toFixed(0) + "," + y.toFixed(0) + ";\n"; // hack: repeat in case comm dropped
         str += "PD" + x.toFixed(0) + "," + y.toFixed(0) + ";\n"; // move down
         str += "PD" + x.toFixed(0) + "," + y.toFixed(0) + ";\n"; // hack: repeat in case comm dropped
         // loop over points
         for (var pt = 1; pt < this.path[seg].length; ++pt) {
            x = xoffset + scale * this.path[seg][pt][0];
            y = yoffset + scale * this.path[seg][pt][1];
            str += "PD" + x.toFixed(0) + "," + y.toFixed(0) + ";\n"; // move down
            str += "PD" + x.toFixed(0) + "," + y.toFixed(0) + ";\n"; // hack: repeat in case comm dropped
         }
         str += "PU" + x.toFixed(0) + "," + y.toFixed(0) + ";\n"; // move up at last point
         str += "PU" + x.toFixed(0) + "," + y.toFixed(0) + ";\n"; // hack: repeat in case comm dropped
      }
      str += "PU0,0;\n"; // pen up to origin
      str += "PU0,0;\n"; // hack: repeat in case comm dropped
      callback (false, str);
   }

module.exports = GccVinyl;