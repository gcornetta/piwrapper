   function Epilog (path, config){
      this.fileExt = '.epi';
      this.path = path;
      this.width = config.width;
      this.height = config.height;
      this.dpi = config.dpi;
      this.power = parseFloat(config.power);
      this.speed = parseFloat(config.speed);
      this.rate = parseFloat(config.rate);
      this.xorigin = config.xCoord;
      this.yorigin = config.yCoord;
      this.autofocus = (config.switchAutofocus == 'on');
      this.startCorner = config.origin;  //TODO: Check Uppercase
   }

   function toInches(val){
      return parseFloat(val)/25.4;
   }

   Epilog.prototype.cmdString = function (callback) {
      var dx = this.width / this.dpi;
      var dy = this.height / this.dpi;
      var nx = this.width;
      var ny = this.height;
      var ox = toInches(this.xorigin);
      var oy = toInches(this.yorigin);
      var scale = 600.0 * dx / (nx - 1); // 600 DPI
      
      if (this.startCorner == 'bottom left') {
         var xoffset = 600.0 * ox;
         var yoffset = 600.0 * (oy - dy);
      } else if (this.startCorner == 'bottom right') {
         var xoffset = 600.0 * (ox - dx);
         var yoffset = 600.0 * (oy - dy);
      } else if (this.startCorner == 'top left') {
         var xoffset = 600.0 * ox;
         var yoffset = 600.0 * oy;
      } else { //top right
         var xoffset = 600.0 * (ox - dx);
         var yoffset = 600.0 * oy;
      }
      var str = "%-12345X@PJL JOB NAME=" + this.JobName + "\r\n";
      str += "E@PJL ENTER LANGUAGE=PCL\r\n";
      
      this.autofocus ? str += "&y1A" : str += "&y0A";

      str += "&l0U&l0Z&u600D*p0X*p0Y*t600R*r0F&y50P&z50S*r6600T*r5100S*r1A*rC%1BIN;";
      str += "XR" + this.rate + ";YP" + this.power + ";ZS" + this.speed + ";\n";
      // loop over segments
      for (var seg = 0; seg < this.path.length; ++seg) {
         // loop over points
         x = xoffset + scale * this.path[seg][0][0];
         y = yoffset + scale * (ny - this.path[seg][0][1]);
         if (x < 0) x = 0;
         if (y < 0) y = 0;
         str += "PU" + x.toFixed(0) + "," + y.toFixed(0) + ";" // move up to start point
         for (var pt = 1; pt < this.path[seg].length; ++pt) {
            x = xoffset + scale * this.path[seg][pt][0];
            y = yoffset + scale * (ny - this.path[seg][pt][1]);
            if (x < 0) x = 0;
            if (y < 0) y = 0;
            str += "PD" + x.toFixed(0) + "," + y.toFixed(0) + ";" // move down
         }
         str += "\n";
      }
      str += "%0B%1BPUE%-12345X@PJL EOJ \r\n"
      // end-of-file padding hack from Epilog print driver
      for (var i = 0; i < 10000; ++i)
         str += " ";
      callback (false, str);
   }

module.exports = Epilog;