   function GenericMill (path, config){
      this.fileExt = '.nc';
      this.path = path;
      this.width = config.width;
      this.dpi = config.dpi;
      this.cutSpeed = 60 * parseFloat(config.cutSpeed);
      this.plungeSpeed = 60 * parseFloat(config.plungeSpeed);
      this.jogHeight = parseFloat(config.jogHeight);
      this.spindleSpeed = parseFloat(config.spindleSpeed);
      this.tool = config.tool;
      this.isCoolantOn = config.isCoolantOn;
      this.x0 = parseFloat(config.x0);
      this.y0 = parseFloat(config.y0);
      this.z0 = parseFloat(config.z0);
      this.xhome = parseFloat(config.xhome);
      this.yhome = parseFloat(config.yhome);
      this.zhome = parseFloat(config.zhome);  
   }

   function toInches(val){
      return val / 25.4;
   }

   GenericMill.prototype.cmdString = function (callback) {
      var dx = this.width / this.dpi;
      var nx = this.width;
      
      var cs = toInches(this.cutSpeed);
      var ps = toInches(this.plungeSpeed);
      var jh = toInches(this.jogHeight);
      var scale = dx / (nx - 1);
      var xoffset = 0;
      var yoffset = 0;
      var zoffset = 0;

      str = "%\n"; // tape start
      // Clear all state: XY plane, inch mode, cancel diameter compensation, cancel length offset
      // coordinate system 1, cancel motion, non-incremental motion, feed/minute mode
      str += "G17\n";
      str += "G20\n";
      str += "G40\n";
      str += "G49\n";
      // assume G55 coordinate system
      str += "G55\n";
      str += "G80\n";
      str += "G90\n";
      str += "G94\n";
      str += "T" + tool + "M06\n"; // tool selection, tool change
      str += "F" + cs.toFixed(4) + "\n"; // feed rate
      str += "S" + this.spindleSpeed + "\n"; // spindle speed
      if (this.isCoolantOn)
         str += "M08\n"; // coolant on
      str += "G00Z" + jh.toFixed(4) + "\n"; // move up before starting spindle
      str += "M03\n"; // spindle on clockwise
      str += "G04 P1\n"; // give spindle 1 second to spin up
      // follow segments
      for (var seg = 0; seg < this.path.length; ++seg) {
         var x = xoffset + scale * this.path[seg][0][0];
         var y = yoffset + scale * this.path[seg][0][1];
         var z = zoffset + scale * this.path[seg][0][2];
         // move up to starting point
         str += "Z" + jh.toFixed(4) + "\n";
         str += "G00X" + x.toFixed(4) + "Y" + y.toFixed(4) + "Z" + jh.toFixed(4) + "\n";
         // move down
         str += "G01Z" + z.toFixed(4) + " F" + ps.toFixed(4) + "\n";
         str += "F" + cs.toFixed(4) + "\n"; //restore XY feed rate
         for (var pt = 1; pt < this.path[seg].length; ++pt) {
            // move to next point
            x = xoffset + scale * this.path[seg][pt][0];
            y = yoffset + scale * this.path[seg][pt][1];
            z = zoffset + scale * this.path[seg][pt][2];
            str += "G01X" + x.toFixed(4) + "Y" + y.toFixed(4) + "Z" + z.toFixed(4) + "\n";
         }
      }
      // finish
      str += "G00Z" + jh.toFixed(4) + "\n"; // move up before stopping spindle
      str += "M05\n"; // spindle stop
      if (!this.isCoolantOn)
         str += "M09\n"; // coolant off
      str += "M30\n"; // program end and reset
      str += "%\n"; // tape end
      // return string
      callback (false, str);
   }

module.exports = GenericMill;