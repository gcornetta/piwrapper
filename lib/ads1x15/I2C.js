var i2c = require('i2c-bus');
var winston = require('winston');

// ===========================================================================
// I2C Class v. 1.0.0
// Author: Gianluca Cornetta
// I2c-bus wrapper class
// ===========================================================================
  
  var I2C = function(address, busnum, debug) {
    busnum = (typeof busnum !== 'undefined' ? busnum : 1);
    debug = (typeof debug !== 'undefined' ? debug : false);

    this.address = address;
    this.bus = i2c.openSync(busnum); //works only for r-pi3 
    this.debug = debug;
  }

  I2C.prototype.errMsg = function() {
    winston.log('error', 'Error accessing 0x%s. Check your I2C address.', this.address.toString(16)); 
    return -1
  }

  //Closes the I2C bus
  I2C.prototype.close = function() {
     this.bus.closeSync();
   }

  //Writes an 8-bit value to the specified register/address
  I2C.prototype.write8 = function (reg, value) {
    try {
      this.bus.writeByteSync(this.address, reg, value);
      if (this.debug){
        winston.log('debug', 'I2C: Wrote 0x%s to register 0x%s', value.toString(16), reg.toString(16));
      } 
    }   
    catch (err) {
      return this.errMsg();
    }
  }
  
  //Writes a 16-bit value to the specified register/address pair
  I2C.prototype.write16 = function(reg, value){
    try {
      this.bus.writeWordSync(this.address, reg, value);
      if (this.debug){
        winston.log('debug', 'I2C: Wrote 0x%s to register pair: 0x%s, 0x%s', value.toString(16), reg.toString(16), (reg+1).toString(16));
      }
    }  
    catch (err) {
      return this.errMsg();
    }  
  }  

  //Writes an 8-bit value on the bus
  I2C.prototype.writeRaw8 = function(value){
    try {
      this.bus.writeByteSync(this.address, value);
      if (this.debug){
        winston.log('debug', 'I2C: Wrote 0x%s', value.toString(16));
      } 
    }   
    catch(err){
      return this.errMsg();
    }  
  }

  //Writes an array of bytes using I2C format
  I2C.prototype.writeList = function(reg, list){
    try {
      const buf = new Buffer(list);
      if (this.debug){
        winston.log('debug', 'I2C: Writing list to register 0x%s', reg.toString(16));
        winston.log('debug', 'list : %s' + list.toString(16));
      }
      this.bus.writeI2cBlockSync(this.address, reg, buf.length, buf);
    }  
    catch (err){
      return this.errMsg();
    }
  }

  //Read a list of bytes from the I2C device
  I2C.prototype.readList = function(reg, length){
      try {
        const results = new Buffer(length); 
        this.bus.readI2cBlockSync(this.address, reg, length, results)
        if (this.debug) {
          winston.log('debug', 'I2C: Device 0x%s returned the following from reg 0x%s', this.address.toString(16), reg.toString(16));
          winston.log('debug', 'results: %d, %d', results.readUInt8(0), results.readUInt8(1)); 
        }
        return [results.readUInt8(0), results.readUInt8(1)];
      }
      catch (err) {
        return this.errMsg();
      }
  }

  //Read an unsigned byte from the I2C device
  I2C.prototype.readU8 = function(reg) {
      try {
        var result = this.bus.readByteSync(this.address, reg);
        if (this.debug) {
          winston.log('debug', 'I2C: Device 0x%s returned 0x%s from reg 0x%s', this.address.toString(16), result.toString(16), reg.toString(16));
        }
        return result;
      }
      catch (err) {
        return this.errMsg();
      }
  }

  //Reads a signed byte from the I2C device
  I2C.prototype.readS8 = function(reg){ 
      try {
        var result = this.bus.readByteSync(this.address, reg);
          if (result > 127) {result -= 256;}
          if (this.debug){
            winston.log('debug', 'I2C: Device 0x%s returned 0x%s from reg 0x%s', this.address.toString(16), (result & 0xFF).toString(16), reg.toString(16))
          }
          return result;
      }
      catch (err) {
        return this.errMsg();
      }
  }

  //Reads an unsigned 16-bit value from the I2C device
  I2C.prototype.readU16 = function(reg, little_endian){ 
      little_endian = typeof little_endian !== 'undefined' ? little_endian : True;
      try {
        var result = this.bus.readWordSync(this.address,reg);
        //Swap bytes if using big endian because read_word_data assumes little 
        //endian on ARM (little endian) systems.
        if (!little_endian) {
          result = ((result << 8) & 0xFF00) + (result >> 8);
          if (this.debug) {
            winston.log('debug','I2C: Device 0x%s returned 0x%s from reg 0x%s', this.address.toString(16), (result & 0xFFFF).toString(16), reg.toString(16));
          }
        }  
        return result;
      }
      catch (err) {
        return this.errMsg();
      }
  }

  //Reads a signed 16-bit value from the I2C device
  I2C.prototype.readS16 = function(reg, little_endian) { 
    little_endian = typeof little_endian !== 'undefined' ? little_endian : True;
    try {
      result = this.readU16(reg,little_endian)
      if (result > 32767) {result -= 65536;}
      return result;
    }      
    catch (err){
      return this.errMsg();
    }
  }

if (require.main === module) {
  try {
    bus = I2C(address=0);
    winston.info('Default I2C bus is accessible');
  }
  catch(err){
    winston.error('Error accessing default I2C bus');
  }  
}

module.exports = I2C;
