function OxfordLaser (path, jobName, config){
      this.fileExt = '.pgm';
      this.path = path;
      this.jobName = jobName;
      this.width = config.width;
      this.dpi = config.dpi;
      this.power = parseFloat(config.power);
      this.feed = parseFloat(config.feed);
      this.jog = parseFloat(config.jog);
   }

   function toMillimeters(val){
      return parseFloat(val) * 25.4;
   }

   OxfordLaser.prototype.oxfordCmdString = function (callback) {
      str = "; oxford laser micromachining \r\n";
      str += "; " + this.jobName + this.fileExt + "\r\n";
      str += "G90\r\n"; // absolute coordinate mode
      str += "G71\r\n"; // mm units, mm/s velocity
      str += "G92 X0 Y0\r\n"; // software home
      str += "G108\r\n"; // no deceleration to zero velocity; todo: make option
      str += "BEAMOFF\r\n";
      str += "FARCALL \"ATTENUATOR.PGM\" s" + power + "\r\n";
      str += "MSGCLEAR -1\r\n";
      str += "MSGDISPLAY 1, \"Program Started\"\r\n";
      //str += "MSGDISPLAY 1, "{#F3 #F}" "Time is #TS"\r\n";
      //str += "OPENSHUTTER\r\n";
      
      var dx = toMillimeters(this.width / this.dpi);
      var nx = this.width;
      
      var scale = dx / (nx - 1);
      var xoffset = 0;
      var yoffset = 0;
      var zoffset = 0;
      //
      // follow segments
      //
      for (var seg = 0; seg < path.length; ++seg) {
         var x = xoffset + scale * this.path[seg][0][0];
         var y = yoffset + scale * this.path[seg][0][1];
         // move to starting point
         str += "G1 X" + x.toFixed(5) + " Y" + y.toFixed(5) + " F" + this.jog + "\r\n";
         str += "BEAMON\r\n"; // beam on
         for (var pt = 1; pt < this.path[seg].length; ++pt) {
            // move to next point
            x = xoffset + scale * this.path[seg][pt][0];
            y = yoffset + scale * this.path[seg][pt][1];
            str += "G1 X" + x.toFixed(5) + " Y" + y.toFixed(5) + " F" + feed + "\r\n";
         }
         str += "BEAMOFF\r\n"; // beam off
      }
      // finish
      str += "G1 X0 Y0 F" + jog + "\r\n";
      //str += "CLOSESHUTTER\r\n";
      str += "MSGDISPLAY 1, \"Program Finished\"\r\n";
      //str += "MSGDISPLAY 1, \"{\#F3 \#F}\" \"Time is \#TS\"\n";
      str += "G91\r\n"; // incremental coordinate mode
      str += "M2\r\n"; // end of program
      // return string
      callback (false, str);
   }

module.exports = OxfordLaser;