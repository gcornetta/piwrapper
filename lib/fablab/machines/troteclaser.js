function TrotecLaser (path, jobName, config){
      this.fileExt = '.tro';
      this.path = path;
      this.jobName = jobName;
      this.width = config.width;
      this.height = config.height;
      this.dpi = config.dpi;
      this.model = config.model;
      this.power = 100 * parseFloat(config.power);
      this.frequency = parseFloat(config.frequency);
      this.velocity = parseFloat(config.velocity);
      this.ox = parseFloat(config.xorigin);
      this.oy = parseFloat(config.yorigin);
      this.startCorner = config. startCorner;
   }

   function toMillimeters(val){
      return parseFloat(val) * 25.4;
   }

   TrotecLaser.prototype.trotecCmdString = function (callback) {
      if (this.model == 'Speedy 100 flex fiber') {
         var umPerInc = 5;
         var str = "SL4\n"; // fiber pulse
      } else if  (this.model == 'Speedy 400') {
         var umPerInc = 5.097;
         var str = "SL0\n"; // CO2
      } else { // Speedy 100,  Speedy 100 Flexx CO2
         var umPerInc = 5;
         var str = "SL0\n"; // CO2
      }

      var dx = toMillimeters(this.width / this.dpi);
      var dy = toMillimeters(this.height / this.dpi);
      var nx = this.width;
      var ny = this.height;

      var scale = 1000 * (dx / (nx - 1)) / umPerInc;
      var vel = this.velocity * 1000 / umPerInc;
      var xorg = 2600; // Speedy
      var yorg = 800;  // Speedy

      if (this.startCorner == 'bottom left') {
         var xoffset = xorg + 1000 * this.ox / umPerInc;
         var yoffset = yorg + 1000 * (this.oy - dy) / umPerInc;
      } else if (this.startCorner == 'bottom right') {
         var xoffset = xorg + 1000 * (this.ox - dx) / umPerInc;
         var yoffset = yorg + 1000 * (this.oy - dy) / umPerInc;
      } else if (this.startCorner == 'top left') {
         var xoffset = xorg + 1000 * this.ox / umPerInc;
         var yoffset = yorg + 1000 * this.oy / umPerInc;
      } else {//top right
         var xoffset = xorg + 1000 * (this.ox - dx) / umPerInc;
         var yoffset = yorg + 1000 * this.oy / umPerInc;
      }

      str += "ED3\n"; // exhaust on
      str += "ED4\n"; // air assist on
      str += "VS" + vel.toFixed(0) + "\n"; // set velocity
      str += "LF" + this.frequency.toFixed(0) + "\n"; // set frequency
      str += "LP" + this.power.toFixed(0) + "\n"; // set power
      str += "EC\n"; // execute
      //
      // loop over segments
      //
      for (var seg = 0; seg < this.path.length; ++seg) {
         // loop over points
         x = xoffset + scale * this.path[seg][0][0];
         y = yoffset + scale * (ny - this.path[seg][0][1]);
         if (x < 0) x = 0;
         if (y < 0) y = 0;
         str += "PA" + x.toFixed(0) + "," + y.toFixed(0) + "\n"; // move to start point
         str += "PD\n"; // laser on
         for (var pt = 1; pt < this.path[seg].length; ++pt) {
            x = xoffset + scale * this.path[seg][pt][0];
            y = yoffset + scale * (ny - this.path[seg][pt][1]);
            if (x < 0) x = 0;
            if (y < 0) y = 0;
            str += "PA" + x.toFixed(0) + "," + y.toFixed(0) + "\n"; // move to next point
         }
         str += "PU\n"; // laser off
         str += "EC\n"; // execute
      }
      str += "EO3\n"; // exhaust off
      str += "EO4\n"; // air assist off
      str += "PA0,0\n"; // move home   
      str += "EC\n"; // execute
      callback (false, str);
   }

module.exports = TrotecLaser;