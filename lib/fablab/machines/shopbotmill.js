   function ShopbotMill (path, config){
      this.fileExt = '.sbp';
      this.path = path;
      this.width = config.width;
      this.dpi = config.dpi;
      this.isInches = config.isInches;
      this.cutSpeed = parseFloat(config.cutSpeed) / 25.4;
      this.plungeSpeed = parseFloat(config.plungeSpeed) / 25.4;
      this.jogSpeed = parseFloat(config.jogSpeed) / 25.4;
      this.jogHeight = parseFloat(config.jogHeight) / 25.4 ;
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

   function toInches(isinches, val){
      return isinches ? val : val *25.4;
   }

   ShopbotMill.prototype.cmdString = function (callback) {
      
      var dx = toInches(this.isInches, this.width / this.dpi);
      var nx = this.width;
      var cs = toInches(this.isInches, this.cutSpeed);
      var ps = toInches(this.isInches, this.plungeSpeed);
      var js = toInches(this.isInches, this.jogSpeed);
      var jh = toInches(this.isInches, this.jogHeight);
      
      var scale = dx / (nx - 1);
      var xoffset = 0;
      var yoffset = 0;
      var zoffset = 0;
      str = "SA\r\n"; // set to absolute distances
      str += "TR," + this.spindleSpeed + ",1\r\n"; // set spindle speed
      str += "SO,1,1\r\n"; // set output number 1 to on
      str += "pause,2\r\n"; // let spindle come up to speed
      str += "MS," + cs.toFixed(4) + "," + ps.toFixed(4) + "\r\n"; // set xy,z speed
      str += "JS," + js.toFixed(4) + "," + js.toFixed(4) + "\r\n"; // set jog xy,z speed
      str += "JZ," + jh.toFixed(4) + "\r\n"; // move up
      // follow segments
      for (var seg = 0; seg < this.path.length; ++seg) {
         // move up to starting point
         x = xoffset + scale * this.path[seg][0][0];
         y = yoffset + scale * this.path[seg][0][1];
         str += "MZ," + jh.toFixed(4) + "\r\n";
         str += "J2," + x.toFixed(4) + "," + y.toFixed(4) + "\r\n";
         // move down
         z = zoffset + scale * this.path[seg][0][2];
         str += "MZ," + z.toFixed(4) + "\r\n";
         for (var pt = 1; pt < this.path[seg].length; ++pt) {
            // move to next point
            x = xoffset + scale * this.path[seg][pt][0];
            y = yoffset + scale * this.path[seg][pt][1];
            z = zoffset + scale * this.path[seg][pt][2];
            str += "M3," + x.toFixed(4) + "," + y.toFixed(4) + "," + z.toFixed(4) + "\r\n";
         }
      }
      // return
      str += "MZ," + jh.toFixed(4) + "\r\n";
      callback (false, str);
   }

module.exports = ShopbotMill;