var time = require('sleep');
var i2cb = require('./I2C');
var winston = require('winston');

// ===========================================================================
// ADS1x15 Class v. 1.0.0
// Author: Gianluca Cornetta   
// NOT IMPLEMENTED: Conversion ready pin, page 15 datasheet.
//============================================================================

 // IC Identifiers
 var __IC_ADS1015                       = 0x00;
 var __IC_ADS1115                       = 0x01;

 // Pointer Register
 var  __ADS1015_REG_POINTER_MASK        = 0x03;
 var  __ADS1015_REG_POINTER_CONVERT     = 0x00;
 var  __ADS1015_REG_POINTER_CONFIG      = 0x01;
 var  __ADS1015_REG_POINTER_LOWTHRESH   = 0x02;
 var  __ADS1015_REG_POINTER_HITHRESH    = 0x03;

 // Config Register
 var  __ADS1015_REG_CONFIG_OS_MASK      = 0x8000;
 var  __ADS1015_REG_CONFIG_OS_SINGLE    = 0x8000;  // Write: Set to start a single-conversion
 var  __ADS1015_REG_CONFIG_OS_BUSY      = 0x0000;  // Read: Bit = 0 when conversion is in progress
 var  __ADS1015_REG_CONFIG_OS_NOTBUSY   = 0x8000;  // Read: Bit = 1 when device is not performing a conversion

 var  __ADS1015_REG_CONFIG_MUX_MASK     = 0x7000;
 var  __ADS1015_REG_CONFIG_MUX_DIFF_0_1 = 0x0000;  // Differential P = AIN0, N = AIN1 (default)
 var  __ADS1015_REG_CONFIG_MUX_DIFF_0_3 = 0x1000;  // Differential P = AIN0, N = AIN3
 var  __ADS1015_REG_CONFIG_MUX_DIFF_1_3 = 0x2000;  // Differential P = AIN1, N = AIN3
 var  __ADS1015_REG_CONFIG_MUX_DIFF_2_3 = 0x3000;  // Differential P = AIN2, N = AIN3
 var  __ADS1015_REG_CONFIG_MUX_SINGLE_0 = 0x4000;  // Single-ended AIN0
 var  __ADS1015_REG_CONFIG_MUX_SINGLE_1 = 0x5000;  // Single-ended AIN1
 var  __ADS1015_REG_CONFIG_MUX_SINGLE_2 = 0x6000;  // Single-ended AIN2
 var  __ADS1015_REG_CONFIG_MUX_SINGLE_3 = 0x7000;  // Single-ended AIN3

 var  __ADS1015_REG_CONFIG_PGA_MASK     = 0x0E00;
 var  __ADS1015_REG_CONFIG_PGA_6_144V   = 0x0000;  // +/-6.144V range
 var  __ADS1015_REG_CONFIG_PGA_4_096V   = 0x0200;  // +/-4.096V range
 var  __ADS1015_REG_CONFIG_PGA_2_048V   = 0x0400;  // +/-2.048V range (default)
 var  __ADS1015_REG_CONFIG_PGA_1_024V   = 0x0600;  // +/-1.024V range
 var  __ADS1015_REG_CONFIG_PGA_0_512V   = 0x0800;  // +/-0.512V range
 var  __ADS1015_REG_CONFIG_PGA_0_256V   = 0x0A00;  // +/-0.256V range

 var  __ADS1015_REG_CONFIG_MODE_MASK    = 0x0100;
 var  __ADS1015_REG_CONFIG_MODE_CONTIN  = 0x0000;  // Continuous conversion mode
 var  __ADS1015_REG_CONFIG_MODE_SINGLE  = 0x0100;  // Power-down single-shot mode (default)

 var  __ADS1015_REG_CONFIG_DR_MASK      = 0x00E0;  
 var  __ADS1015_REG_CONFIG_DR_128SPS    = 0x0000;  // 128 samples per second
 var  __ADS1015_REG_CONFIG_DR_250SPS    = 0x0020;  // 250 samples per second
 var  __ADS1015_REG_CONFIG_DR_490SPS    = 0x0040;  // 490 samples per second
 var  __ADS1015_REG_CONFIG_DR_920SPS    = 0x0060;  // 920 samples per second
 var  __ADS1015_REG_CONFIG_DR_1600SPS   = 0x0080;  // 1600 samples per second (default)
 var  __ADS1015_REG_CONFIG_DR_2400SPS   = 0x00A0;  // 2400 samples per second
 var  __ADS1015_REG_CONFIG_DR_3300SPS   = 0x00C0;  // 3300 samples per second (also 0x00E0)

 var  __ADS1115_REG_CONFIG_DR_8SPS      = 0x0000;  // 8 samples per second
 var  __ADS1115_REG_CONFIG_DR_16SPS     = 0x0020;  // 16 samples per second
 var  __ADS1115_REG_CONFIG_DR_32SPS     = 0x0040;  // 32 samples per second
 var  __ADS1115_REG_CONFIG_DR_64SPS     = 0x0060;  // 64 samples per second
 var  __ADS1115_REG_CONFIG_DR_128SPS    = 0x0080;  // 128 samples per second
 var  __ADS1115_REG_CONFIG_DR_250SPS    = 0x00A0;  // 250 samples per second (default)
 var  __ADS1115_REG_CONFIG_DR_475SPS    = 0x00C0;  // 475 samples per second
 var  __ADS1115_REG_CONFIG_DR_860SPS    = 0x00E0;  // 860 samples per second

 var  __ADS1015_REG_CONFIG_CMODE_MASK   = 0x0010;
 var  __ADS1015_REG_CONFIG_CMODE_TRAD   = 0x0000;  // Traditional comparator with hysteresis (default)
 var  __ADS1015_REG_CONFIG_CMODE_WINDOW = 0x0010;  // Window comparator

 var  __ADS1015_REG_CONFIG_CPOL_MASK    = 0x0008;
 var  __ADS1015_REG_CONFIG_CPOL_ACTVLOW = 0x0000;  // ALERT/RDY pin is low when active (default)
 var  __ADS1015_REG_CONFIG_CPOL_ACTVHI  = 0x0008;  // ALERT/RDY pin is high when activ;e;

 var  __ADS1015_REG_CONFIG_CLAT_MASK    = 0x0004;  // Determines if ALERT/RDY pin latches once asserted
 var  __ADS1015_REG_CONFIG_CLAT_NONLAT  = 0x0000;  // Non-latching comparator (default)
 var  __ADS1015_REG_CONFIG_CLAT_LATCH   = 0x0004;  // Latching comparator

 var  __ADS1015_REG_CONFIG_CQUE_MASK    = 0x0003;
 var  __ADS1015_REG_CONFIG_CQUE_1CONV   = 0x0000;  // Assert ALERT/RDY after one conversions
 var  __ADS1015_REG_CONFIG_CQUE_2CONV   = 0x0001;  // Assert ALERT/RDY after two conversions
 var  __ADS1015_REG_CONFIG_CQUE_4CONV   = 0x0002;  // Assert ALERT/RDY after four conversions
 var  __ADS1015_REG_CONFIG_CQUE_NONE    = 0x0003;  // Disable the comparator and put ALERT/RDY in high state (default)
  
  
  // Dictionaries with the sampling speed values
  var spsADS1115 = {
    8:   __ADS1115_REG_CONFIG_DR_8SPS,
    16:  __ADS1115_REG_CONFIG_DR_16SPS,
    32:  __ADS1115_REG_CONFIG_DR_32SPS,
    64:  __ADS1115_REG_CONFIG_DR_64SPS,
    128: __ADS1115_REG_CONFIG_DR_128SPS,
    250: __ADS1115_REG_CONFIG_DR_250SPS,
    475: __ADS1115_REG_CONFIG_DR_475SPS,
    860: __ADS1115_REG_CONFIG_DR_860SPS
  };    
  
  var spsADS1015 = {
    128:  __ADS1015_REG_CONFIG_DR_128SPS,
    250:  __ADS1015_REG_CONFIG_DR_250SPS,
    490:  __ADS1015_REG_CONFIG_DR_490SPS,
    920:  __ADS1015_REG_CONFIG_DR_920SPS,
    1600: __ADS1015_REG_CONFIG_DR_1600SPS,
    2400: __ADS1015_REG_CONFIG_DR_2400SPS,
    3300: __ADS1015_REG_CONFIG_DR_3300SPS
  };

  // Dictionary with the programable gains
  
  var pgaADS1x15 = {
    6144: __ADS1015_REG_CONFIG_PGA_6_144V,
    4096: __ADS1015_REG_CONFIG_PGA_4_096V,
    2048: __ADS1015_REG_CONFIG_PGA_2_048V,
    1024: __ADS1015_REG_CONFIG_PGA_1_024V,
    512:  __ADS1015_REG_CONFIG_PGA_0_512V,
    256:  __ADS1015_REG_CONFIG_PGA_0_256V
  };    
  
  // Constructor
  var ADS1x15 = function(address, ic, debug){
    //ES2015 syntax 'ADS1x15 (address=0x48, ic= __IC_ADS1015, debug=false)'
    //is not supported by this version of node.js

    //address = address || 0x48;
    address = (typeof address !== 'undefined' ? address : 0x48);
    ic = (typeof ic !== 'undefined' ? ic : __IC_ADS1015);
    debug = (typeof debug !== 'undefined' ? debug : false);

    this.i2c = new i2cb(address, 1, true);
    this.address = address;
    this.debug = debug;

    // Make sure the IC specified is valid
    if ((ic < this.__IC_ADS1015) | (ic > this.__IC_ADS1115)){
      if (this.debug){
        winston.log('error', 'ADS1x15: Invalid IC specfied: %d', ic);
      }  
      return -1;
    }  
    else {
      this.ic = ic;
    }    
    // Set pga value, so that getLastConversionResult() can use it,
    // any function that accepts a pga value must update this.
    this.pga = 6144;    
  }
  
  //Gets a single-ended ADC reading from the specified channel in mV
  //The pga must be given in mV, see page 13 for the supported values.  
  ADS1x15.prototype.readADCSingleEnded = function(channel, pga, sps){
    channel = (typeof channel !== 'undefined' ? channel : 0);
    pga = (typeof pga !== 'undefined' ? pga : 6144);
    sps = (typeof sps !== 'undefined' ? sps : 250);
    
    // With invalid channel return -1
    if (channel > 3) { 
      if (this.debug) {
        winston.log('error', 'ADS1x15: Invalid channel specified: %d', channel);
      }
      return -1;
    }
    
    // Disable comparator, Non-latching, Alert/Rdy active low
    // traditional comparator, single-shot mode
    var config = __ADS1015_REG_CONFIG_CQUE_NONE    |
                 __ADS1015_REG_CONFIG_CLAT_NONLAT  |
                 __ADS1015_REG_CONFIG_CPOL_ACTVLOW |
                 __ADS1015_REG_CONFIG_CMODE_TRAD   |
                 __ADS1015_REG_CONFIG_MODE_SINGLE    

    // Set sample per seconds, defaults to 250sps
    // If sps is in the dictionary it returns the value of the constant
    // othewise it returns the value for 250sps.
    if (this.ic == __IC_ADS1015){
      config |= (spsADS1015.sps || __ADS1015_REG_CONFIG_DR_1600SPS);
    }  
    else {
      if ( !(sps in spsADS1115) & this.debug){	  
	       winston.log('warn', 'ADS1x15: Invalid sps specified: %d. Using 250sps',  sps);
      }        
      config |= (spsADS1115.sps || __ADS1115_REG_CONFIG_DR_250SPS);
    }

    // Set PGA/voltage range, defaults to +-6.144V
    if ( !(pga in pgaADS1x15) & this.debug){	  
      winston.log('warn', 'ADS1x15: Invalid pga specified: %d. Using 6144mV', pga);     
    }
    config |= (pgaADS1x15.pga || __ADS1015_REG_CONFIG_PGA_6_144V);
    this.pga = pga;

    // Set the channel to be converted
    if(channel == 3){
      config |= __ADS1015_REG_CONFIG_MUX_SINGLE_3;
    } else if(channel == 2){
      config |= __ADS1015_REG_CONFIG_MUX_SINGLE_2;
    } else if(channel == 1){
      config |= __ADS1015_REG_CONFIG_MUX_SINGLE_1;
    } else{
      config |= __ADS1015_REG_CONFIG_MUX_SINGLE_0;
    }
    
    // Set 'start single-conversion' bit
    config |= __ADS1015_REG_CONFIG_OS_SINGLE;

    // Write config register to the ADC
    var bytes = [(config >> 8) & 0xFF, config & 0xFF];
    this.i2c.writeList(__ADS1015_REG_POINTER_CONFIG, bytes);
    // Wait for the ADC conversion to complete
    // The minimum delay depends on the sps: delay >= 1/sps
    // We add 0.1ms to be sure
    var delay = 1.0/sps+0.0001;
    time.usleep(delay*1000000.0);

    // Read the conversion results
    var result = this.i2c.readList(__ADS1015_REG_POINTER_CONVERT, 2);
    
    if (this.ic == __IC_ADS1015){
    	// Shift right 4 bits for the 12-bit ADS1015 and convert to mV
    	return ( ((result[0] << 8) | (result[1] & 0xFF)) >> 4 )*pga/2048.0;  
    } else {
	   // Return a mV value for the ADS1115
	   // (Take signed values into account as well)
	   var val = (result[0] << 8) | (result[1]);

	   if(val > 0x7FFF) {
	     return (val - 0xFFFF)*pga/32768.0;
	   } else {
	     return ( (result[0] << 8) | (result[1]) )*pga/32768.0;
	   } 
    }
  }
 
  //stops conversion by closing the i2c bus 
  ADS1x15.prototype.stopConversion = function(){
     this.i2c.close();
  }

  //Gets a differential ADC reading from channels chP and chN in mV.
  //The pga must be given in mV, see page 13 for the supported values.
  ADS1x15.prototype.readADCDifferential = function(chP, chN, pga, sps) {   
    chP = (typeof chP !== 'undefined' ? chP : 0);
    chN = (typeof chN !== 'undefined' ? chN : 1);
    pga = (typeof pga !== 'undefined' ? pga : 6144);
    sps = (typeof sps !== 'undefined' ? sps : 250);

    // Disable comparator, Non-latching, Alert/Rdy active low
    // traditional comparator, single-shot mode    
    var config = __ADS1015_REG_CONFIG_CQUE_NONE    |
                 __ADS1015_REG_CONFIG_CLAT_NONLAT  |
                 __ADS1015_REG_CONFIG_CPOL_ACTVLOW |
                 __ADS1015_REG_CONFIG_CMODE_TRAD   |
                 __ADS1015_REG_CONFIG_MODE_SINGLE;
    
    // Set channels
    if ( (chP == 0) & (chN == 1) ){
      config |= __ADS1015_REG_CONFIG_MUX_DIFF_0_1;
    }  else if ( (chP == 0) & (chN == 3) ){
      config |= __ADS1015_REG_CONFIG_MUX_DIFF_0_3;
    } else if ( (chP == 2) & (chN == 3) ){
      config |= __ADS1015_REG_CONFIG_MUX_DIFF_2_3;
    } else if ( (chP == 1) & (chN == 3) ){
      config |= __ADS1015_REG_CONFIG_MUX_DIFF_1_3;  
    } else {
      if (this.debug) {
	      winston.log('error', 'ADS1x15: Invalid channels specified: %d , %d', chP, chN);
      }  
	    return -1;
    }

    // Set sample per seconds, defaults to 250sps
    // If sps is in the dictionary it returns the value of the constant
    // othewise it returns the value for 250sps.
    if (this.ic == __IC_ADS1015){
      config |= (spsADS1015.sps || __ADS1015_REG_CONFIG_DR_1600SPS);
    } else {
      if ( !(sps in spsADS1115) & this.debug){  
	       winston.log('warn', 'ADS1x15: Invalid sps specified: %d. Using 250sps', sps);  
      } 
      config |= (spsADS1115.sps || __ADS1115_REG_CONFIG_DR_250SPS);     
    }

    // Set PGA/voltage range, defaults to +-6.144V
    if ( !(pga in pgaADS1x15) & this.debug){	  
      winston.log('warn', 'ADS1x15: Invalid pga specified: %d. Using 6144mV', pga);
    }
    config |= (pgaADS1x15.pga || __ADS1015_REG_CONFIG_PGA_6_144V);       
    this.pga = pga;

    // Set 'start single-conversion' bit
    config |= __ADS1015_REG_CONFIG_OS_SINGLE;

    // Write config register to the ADC
    var bytes = [(config >> 8) & 0xFF, config & 0xFF];
    if (this.i2c.writeList(__ADS1015_REG_POINTER_CONFIG, bytes) == -1){
       return -1;
    }

    // Wait for the ADC conversion to complete
    // The minimum delay depends on the sps: delay >= 1/sps
    // We add 0.1ms to be sure
    var delay = 1.0/sps+0.0001;
    time.usleep(delay*1000000.0);

    // Read the conversion results
    var result = this.i2c.readList(__ADS1015_REG_POINTER_CONVERT, 2);

    if (this.ic == __IC_ADS1015) {
    	// Shift right 4 bits for the 12-bit ADS1015 and convert to mV
	    var val = ((result[0] << 8) | (result[1] & 0xFF)) >> 4;
	    // (Take signed values into account as well)
	    if (val >> 11) {
		   val = val - 0xfff;
      }
    	return val*pga/2048.0;
     } else {
	     // Return a mV value for the ADS1115
	     // (Take signed values into account as well)
	     val = (result[0] << 8) | (result[1]);
	     if (val > 0x7FFF) {
	       return (val - 0xFFFF)*pga/32768.0;
       } else {
	       return ( (result[0] << 8) | (result[1]) )*pga/32768.0;
       }
     }  
  }

  //Gets a differential ADC reading from channels 0 and 1 in mV
  //The pga must be given in mV, see page 13 for the supported values.
  ADS1x15.prototype.readADCDifferential01 = function(pga, sps) {   
    pga = (typeof pga !== 'undefined' ? pga : 6144);
    sps = (typeof sps !== 'undefined' ? sps : 250);

    return this.readADCDifferential(0, 1, pga, sps);
  }  
   
  //Gets a differential ADC reading from channels 0 and 3 in mV
  //The pga must be given in mV, see page 13 for the supported values.
  ADS1x15.prototype.readADCDifferential03 = function(pga, sps) { 
    pga = (typeof pga !== 'undefined' ? pga : 6144);
    sps = (typeof sps !== 'undefined' ? sps : 250);

    return this.readADCDifferential(0, 3, pga, sps)
  }   
  
  //Gets a differential ADC reading from channels 1 and 3 in mV
  //The pga must be given in mV, see page 13 for the supported values.
  ADS1x15.prototype.readADCDifferential13 = function(pga, sps) {   
    pga = (typeof pga !== 'undefined' ? pga : 6144);
    sps = (typeof sps !== 'undefined' ? sps : 250);

    return this.readADCDifferential(1, 3, pga, sps);
  }    

  //Gets a differential ADC reading from channels 2 and 3 in mV
  //The pga must be given in mV, see page 13 for the supported values.
  ADS1x15.prototype.readADCDifferential23 = function(pga, sps) {
    pga = (typeof pga !== 'undefined' ? pga : 6144);
    sps = (typeof sps !== 'undefined' ? sps : 250);

    return this.readADCDifferential(2, 3, pga, sps);   
  }
  
  //Starts the continuous conversion mode and returns the first ADC reading 
  //in mV from the specified channel.
  //The pga must be given in mV, see datasheet page 13 for the supported values.
  ADS1x15.prototype.startContinuousConversion = function(channel, pga, sps) {   
    channel = typeof channel !== 'undefined' ? channel : 0;
    pga = (typeof pga !== 'undefined' ? pga : 6144);
    sps = (typeof sps !== 'undefined' ? sps : 250); 

    // Default to channel 0 with invalid channel, or return -1?
    if (channel > 3) {
      if (this.debug) {
	      winston.log('error', 'ADS1x15: Invalid channel specified: %d', channel);
      }  
      return -1;
    }

    // Disable comparator, Non-latching, Alert/Rdy active low
    // traditional comparator, continuous mode
    // The last flag is the only change we need, page 11 datasheet
    var config = __ADS1015_REG_CONFIG_CQUE_NONE    |
                 __ADS1015_REG_CONFIG_CLAT_NONLAT  |
                 __ADS1015_REG_CONFIG_CPOL_ACTVLOW |
                 __ADS1015_REG_CONFIG_CMODE_TRAD   |
                 __ADS1015_REG_CONFIG_MODE_CONTIN;    

    // Set sample per seconds, defaults to 250sps
    // If sps is in the dictionary it returns the value of the constant
    // othewise it returns the value for 250sps
    if (this.ic == __IC_ADS1015){
      config |= (spsADS1015.sps || __ADS1015_REG_CONFIG_DR_1600SPS);
    } else {
      if ( (!(sps in spsADS1115)) & this.debug){	  
	       winston.log('warn', 'ADS1x15: Invalid pga specified: %d. Using 6144mV', sps);
      }        
      config |= (spsADS1115.sps || __ADS1115_REG_CONFIG_DR_250SPS);
    }
  
    // Set PGA/voltage range, defaults to +-6.144V
    if ( !(pga in pgaADS1x15) & this.debug){	  
      winston.log('warn', 'ADS1x15: Invalid pga specified: %d. Using 6144mV', sps);
    } 
    config |= (pgaADS1x15.pga || __ADS1015_REG_CONFIG_PGA_6_144V);      
    this.pga = pga; 
    
    // Set the channel to be converted
    if (channel == 3){
      config |= __ADS1015_REG_CONFIG_MUX_SINGLE_3;
    } else if (channel == 2) {
      config |= __ADS1015_REG_CONFIG_MUX_SINGLE_2;
    } else if (channel == 1) {
      config |= __ADS1015_REG_CONFIG_MUX_SINGLE_1;
    } else {
      config |= __ADS1015_REG_CONFIG_MUX_SINGLE_0;
    }      
  
    // Set 'start single-conversion' bit to begin conversions
    // No need to change this for continuous mode!
    config |= __ADS1015_REG_CONFIG_OS_SINGLE;

    // Write config register to the ADC
    // Once we write the ADC will convert continously
    // we can read the next values using getLastConversionResult
    var bytes = [(config >> 8) & 0xFF, config & 0xFF];
    if (this.i2c.writeList(__ADS1015_REG_POINTER_CONFIG, bytes) == -1){
      return -1;
    }

    // Wait for the ADC conversion to complete
    // The minimum delay depends on the sps: delay >= 1/sps
    // We add 0.5ms to be sure
    var delay = 1.0/sps+0.0005;
    time.usleep(delay*1000000.0);
  
    // Read the conversion results
    var result = this.i2c.readList(__ADS1015_REG_POINTER_CONVERT, 2)
    if (this.ic == __IC_ADS1015) {
    	// Shift right 4 bits for the 12-bit ADS1015 and convert to mV
    	return ( ((result[0] << 8) | (result[1] & 0xFF)) >> 4 )*pga/2048.0;
    } else {
	   // Return a mV value for the ADS1115
	   // (Take signed values into account as well)
	   var val = (result[0] << 8) | (result[1]);
	   if (val > 0x7FFF) {
	     return (val - 0xFFFF)*pga/32768.0;
	   } else {
	     return ( (result[0] << 8) | (result[1]) )*pga/32768.0;
     }
    }    
  }

  //Starts the continuous differential conversion mode and returns the first ADC reading
  //in mV as the difference from the specified channels.
  //The pga must be given in mV, see datasheet page 13 for the supported values.
  ADS1x15.prototype.startContinuousDifferentialConversion = function(chP, chN, pga, sps) {   
    chP = (typeof chP !== 'undefined' ? chP : 0);
    chN = (typeof chN !== 'undefined' ? chN : 1);
    pga = (typeof pga !== 'undefined' ? pga : 6144);
    sps = (typeof sps !== 'undefined' ? sps : 250); 
    
    // Disable comparator, Non-latching, Alert/Rdy active low
    // traditional comparator, continuous mode
    // The last flag is the only change we need, page 11 datasheet
    var config = __ADS1015_REG_CONFIG_CQUE_NONE|
                 __ADS1015_REG_CONFIG_CLAT_NONLAT  |
                 __DS1015_REG_CONFIG_CPOL_ACTVLOW |
                 __ADS1015_REG_CONFIG_CMODE_TRAD   |
                 __ADS1015_REG_CONFIG_MODE_CONTIN; 
  
    // Set sample per seconds, defaults to 250sps
    // If sps is in the dictionary it returns the value of the constant
    // othewise it returns the value for 250sps.
    if (this.ic == __IC_ADS1015){
      config |= (spsADS1015.sps || __ADS1015_REG_CONFIG_DR_1600SPS); 
    } else {
      if ( !(sps in spsADS1115) & this.debug) {	  
	      winston.log('warn', 'ADS1x15: Invalid sps specified: %d. Using 250sps', sps);
      }       
      config |= (spsADS1115.sps || __ADS1115_REG_CONFIG_DR_250SPS);
    }

    // Set PGA/voltage range, defaults to +-6.144V
    if ( (!(pga in pgaADS1x15)) & this.debug) {	  
      winston.log('warn', 'ADS1x15: Invalid pga specified: %d. Using 6144mV', sps);
    } 
    config |= (pgaADS1x15.pga || __ADS1015_REG_CONFIG_PGA_6_144V);
    this.pga = pga; 
    
    // Set channels
    if ( (chP == 0) && (chN == 1) ) {
      config |= __ADS1015_REG_CONFIG_MUX_DIFF_0_1;
    } else if ( (chP == 0) && (chN == 3) ) {
      config |= __ADS1015_REG_CONFIG_MUX_DIFF_0_3;
    } else if ( (chP == 2) && (chN == 3) ) {
      config |= __ADS1015_REG_CONFIG_MUX_DIFF_2_3;
    } else if ( (chP == 1) && (chN == 3) ) {
      config |= __ADS1015_REG_CONFIG_MUX_DIFF_1_3;  
    } else {
      if (this.debug) {
	      winston.log('eror', 'ADS1x15: Invalid channels specified: %d, %d', chP, chN);
	    }
      return -1;  
    }

    // Set 'start single-conversion' bit to begin conversions
    // No need to change this for continuous mode!
    config |= __ADS1015_REG_CONFIG_OS_SINGLE;
  
    // Write config register to the ADC
    // Once we write the ADC will convert continously
    // we can read the next values using getLastConversionResult
    var bytes = [(config >> 8) & 0xFF, config & 0xFF];
    if (this.i2c.writeList(__ADS1015_REG_POINTER_CONFIG, bytes) == -1) {
       return -1;
    }

    // Wait for the ADC conversion to complete
    // The minimum delay depends on the sps: delay >= 1/sps
    // We add 0.5ms to be sure
    var delay = 1.0/sps+0.0005;
    time.usleep(delay*1000000.0);
  
    // Read the conversion results
    var result = this.i2c.readList(__ADS1015_REG_POINTER_CONVERT, 2);
    if (this.ic == __IC_ADS1015) {
	    // Shift right 4 bits for the 12-bit ADS1015 and convert to mV
	    return ( ((result[0] << 8) | (result[1] & 0xFF)) >> 4 )*pga/2048.0;
    } else {
	    // Return a mV value for the ADS1115
	    // (Take signed values into account as well)
	    var val = (result[0] << 8) | (result[1])
	    if (val > 0x7FFF) {
	      return (val - 0xFFFF)*pga/32768.0;
	    } else {
	      return ( (result[0] << 8) | (result[1]) )*pga/32768.0;
      }
    }    
  }
	
  //Stops the ADC's conversions when in continuous mode
  //and resets the configuration to its default value.
  ADS1x15.prototype.stopContinuousConversion = function() {
    // Write the default config register to the ADC
    // Once we write, the ADC will do a single conversion and 
    // enter power-off mode.
    var config = 0x8583; // Page 18 datasheet.
    var bytes = [(config >> 8) & 0xFF, config & 0xFF];
    this.i2c.writeList(__ADS1015_REG_POINTER_CONFIG, bytes);   

    return True;
  }

  //Returns the last ADC conversion result in mV
  ADS1x15.prototype.getLastConversionResults = function() {
    // Read the conversion results
    var result = this.i2c.readList(__ADS1015_REG_POINTER_CONVERT, 2);
    if (this.ic == __IC_ADS1015) {
    	// Shift right 4 bits for the 12-bit ADS1015 and convert to mV
    	return ( ((result[0] << 8) | (result[1] & 0xFF)) >> 4 )*this.pga/2048.0;
    } else {
	    // Return a mV value for the ADS1115
	    // (Take signed values into account as well)
	    var val = (result[0] << 8) | (result[1])
	    if (val > 0x7FFF) {
	       return (val - 0xFFFF)*this.pga/32768.0;
	    } else {
	       return ( (result[0] << 8) | (result[1]) )*this.pga/32768.0;  
	    }
	  }
  }
  
  //Starts the comparator mode on the specified channel, see datasheet pg. 15.
  //Supported modes: Traditional, Window, Latching  
  ADS1x15.prototype.startSingleEndedComparator = function(channel, thresholdHigh, thresholdLow, pga, sps, activeLow, traditionalMode, latching, numReadings) {   
    pga = (typeof pga !== 'undefined' ? pga : 6144);
    sps = (typeof sps !== 'undefined' ? sps : 250);
    activeLow = (typeof activeLow !== 'undefined' ? activeLow : True);
    traditionalMode = (typeof traditionalMode !== 'undefined' ? traditionalMode : True);
    latching = (typeof latching !== 'undefined' ? latching : false);
    numReadings = (typeof numReadings !== 'undefined' ? numReadings : 1);

    // With invalid channel return -1
    if (channel > 3) {
      if (this.debug) {
	      winston.log('error', 'ADS1x15: Invalid channel specified: %d', channel);
      }
      return -1;
    }

    // Continuous mode
    config = __ADS1015_REG_CONFIG_MODE_CONTIN;    
    
    if (activeLow==false) {
      config |= __ADS1015_REG_CONFIG_CPOL_ACTVHI;
    } else {
      config |= __ADS1015_REG_CONFIG_CPOL_ACTVLOW;
    }  
      
    if (traditionalMode==false) {
      config |= __ADS1015_REG_CONFIG_CMODE_WINDOW;
    } else {
      config |= __ADS1015_REG_CONFIG_CMODE_TRAD;
    }  
      
    if (latching==True) {
      config |= __ADS1015_REG_CONFIG_CLAT_LATCH;
    } else {
      config |= __ADS1015_REG_CONFIG_CLAT_NONLAT;
    }  
      
    if (numReadings==4) {
      config |= __ADS1015_REG_CONFIG_CQUE_4CONV;
    } else if (numReadings==2) {
      config |= _ADS1015_REG_CONFIG_CQUE_2CONV;
    } else {
      config |= __ADS1015_REG_CONFIG_CQUE_1CONV;
    }

    // Set sample per seconds, defaults to 250sps
    // If sps is in the dictionary it returns the value of the constant
    // othewise it returns the value for 250sps
    if (this.ic == __IC_ADS1015) {
      if ( (!(sps in spsADS1015)) && this.debug) {	  
	      winston.log('warn', 'ADS1x15: Invalid sps specified: %d. Using 1600sps', sps);
      }    
      config |= (spsADS1015.sps || __ADS1015_REG_CONFIG_DR_1600SPS);
    } else {
      if ((!(sps in spsADS1115)) && this.debug) {	  
	      loger.log('warn', 'ADS1x15: Invalid sps specified: %d. Using 250sps', sps);
      }   
      config |= (spsADS1115.sps || __ADS1115_REG_CONFIG_DR_2500SPS);
    }  

    // Set PGA/voltage range, defaults to +-6.144V
    if ( (!(pga in pgaADS1x15)) && this.debug) {	  
      winston.log('warn', 'ADS1x15: Invalid pga specified: %d. Using 6144mV', pga);
    }
    config |= (pgaADS1x15.pga || __ADS1015_REG_CONFIG_PGA_6_144V); 
    this.pga = pga;
    
    // Set the channel to be converted
    if (channel == 3) {
      config |= __ADS1015_REG_CONFIG_MUX_SINGLE_3;
    } else if (channel == 2) {
      config |= __ADS1015_REG_CONFIG_MUX_SINGLE_2;
    } else if (channel == 1) {
      config |= __ADS1015_REG_CONFIG_MUX_SINGLE_1;
    } else {
      config |= __ADS1015_REG_CONFIG_MUX_SINGLE_0;
    }  

    // Set 'start single-conversion' bit to begin conversions
    config |= __ADS1015_REG_CONFIG_OS_SINGLE;
    
    // Write threshold high and low registers to the ADC
    // V_digital = (2^(n-1)-1)/pga*V_analog
    var thresholdHighWORD;
    if (this.ic == __IC_ADS1015) {
      thresholdHighWORD = Math.floor(thresholdHigh*(2048.0/pga));
    } else {
      thresholdHighWORD = Math.floor(thresholdHigh*(32767.0/pga));
    }  
    var bytes = [(thresholdHighWORD >> 8) & 0xFF, thresholdHighWORD & 0xFF];
    this.i2c.writeList(__ADS1015_REG_POINTER_HITHRESH, bytes); 
    
    var thresholdLowWORD;
    if (this.ic == __IC_ADS1015) {
      thresholdLowWORD = Math.floor(thresholdLow*(2048.0/pga));
    } else {
      thresholdLowWORD = int(thresholdLow*(32767.0/pga));
    }
          
    var bytes = [(thresholdLowWORD >> 8) & 0xFF, thresholdLowWORD & 0xFF];
    this.i2c.writeList(__ADS1015_REG_POINTER_LOWTHRESH, bytes);     

    // Write config register to the ADC
    // Once we write the ADC will convert continously and alert when things happen,
    // we can read the converted values using getLastConversionResult
    bytes = [(config >> 8) & 0xFF, config & 0xFF];
    this.i2c.writeList(__ADS1015_REG_POINTER_CONFIG, bytes);    
  }
    
  //Starts the comparator mode on the specified channel, see datasheet pg. 15.
  //Supported modes: Traditional, Window, Latching
  ADS1x15.prototype.startDifferentialComparator = function(chP, chN, thresholdHigh, thresholdLow, pga, sps, activeLow, traditionalMode, latching, numReadings) { 
    pga = (typeof pga !== 'undefined' ? pga : 6144);
    sps = (typeof sps !== 'undefined' ? sps : 250);
    activeLow = (typeof activeLow !== 'undefined' ? activeLow : true);
    traditionalMode = (typeof traditionalMode !== 'undefined' ? traditionaLMode : true);
    latching = (typeof latching !== 'undefined' ? latching : false);
    numReadings = (typeof numReadings !== 'undefined' ? numReadings : 1);
    
    // Continuous mode
    var config = __ADS1015_REG_CONFIG_MODE_CONTIN;     
    
    if (activeLow==false) {
      config |= __ADS1015_REG_CONFIG_CPOL_ACTVHI;
    } else {
      config |= __ADS1015_REG_CONFIG_CPOL_ACTVLOW;
    }

    if (traditionalMode==false) {
      config |= __ADS1015_REG_CONFIG_CMODE_WINDOW;
    } else {
      config |= __ADS1015_REG_CONFIG_CMODE_TRAD;
    }  
      
    if (latching==True) {
      config |= __ADS1015_REG_CONFIG_CLAT_LATCH;
    } else {
      config |= __ADS1015_REG_CONFIG_CLAT_NONLAT;
    }  
     
    if (numReadings==4) {
      config |= __ADS1015_REG_CONFIG_CQUE_4CONV;
    } else if (numReadings==2) {
      config |= __ADS1015_REG_CONFIG_CQUE_2CONV;
    } else {
      config |= __ADS1015_REG_CONFIG_CQUE_1CONV;
    }

    // Set sample per seconds, defaults to 250sps
    // If sps is in the dictionary (defined in init()) it returns the value of the constant
    // othewise it returns the value for 250sps. This saves a lot of if/elif/else code!
    if (this.ic == __IC_ADS1015){
      if ( !(sps in spsADS1015) && this.debug) {	  
	      winston.log('warn', 'ADS1x15: Invalid sps specified: %d. Using 1600sps', sps);
      }  
      config |= (spsADS1015.sps || __ADS1015_REG_CONFIG_DR_1600SPS); 
    } else {
      if ( !(sps in spsADS1115) && this.debug) {	  
	      winston.log('warn', 'ADS1x15: Invalid sps specified: %d. Using 250sps', sps);
      }       
      config |= (spsADS1115.sps || __ADS1115_REG_CONFIG_DR_250SPS);
    }
      
    // Set PGA/voltage range, defaults to +-6.144V
    if (!(pga in pgaADS1x15) && this.debug) {	  
      winston.log('warn', 'ADS1x15: Invalid pga specified: %d. Using 6144mV', pga);
    }       
    config |= (pgaADS1x15.pga || __ADS1015_REG_CONFIG_PGA_6_144V);
    this.pga = pga;
    
    // Set channels
    if ( (chP == 0) && (chN == 1) ) {
      config |= __ADS1015_REG_CONFIG_MUX_DIFF_0_1;
    } else if ( (chP == 0) && (chN == 3) ) {
      config |= __ADS1015_REG_CONFIG_MUX_DIFF_0_3;
    } else if ( (chP == 2) && (chN == 3) ) {
      config |= __ADS1015_REG_CONFIG_MUX_DIFF_2_3;
    } else if ( (chP == 1) && (chN == 3) ) {
      config |= __ADS1015_REG_CONFIG_MUX_DIFF_1_3;  
    } else {
      if (this.debug) {
	      winston.log('error', 'ADS1x15: Invalid channels specified: %d, %d', chP, chN);
	    }
      return -1;
    }  

    // Set 'start single-conversion' bit to begin conversions
    config |= __ADS1015_REG_CONFIG_OS_SINGLE;
    
    // Write threshold high and low registers to the ADC
    // V_digital = (2^(n-1)-1)/pga*V_analog
    var thresholdHighWORD;
    if (this.ic == __IC_ADS1015) {
      thresholdHighWORD = Math.floor(thresholdHigh*(2048.0/pga));
    } else {
      thresholdHighWORD = Math.floor(thresholdHigh*(32767.0/pga));
    }  
    var bytes = [(thresholdHighWORD >> 8) & 0xFF, thresholdHighWORD & 0xFF];
    this.i2c.writeList(__ADS1015_REG_POINTER_HITHRESH, bytes); 

    var thresholdLowWORD;

    if (this.ic == __IC_ADS1015) {
      thresholdLowWORD = Math.floor(thresholdLow*(2048.0/pga));
    } else {
      thresholdLowWORD = Math.floor(thresholdLow*(32767.0/pga));
    }      
    bytes = [(thresholdLowWORD >> 8) & 0xFF, thresholdLowWORD & 0xFF];
    this.i2c.writeList(__ADS1015_REG_POINTER_LOWTHRESH, bytes);     


    // Write config register to the ADC
    // Once we write the ADC will convert continously and alert when things happen,
    // we can read the converted values using getLastConversionResult
    bytes = [(config >> 8) & 0xFF, config & 0xFF];
    this.i2c.writeList(__ADS1015_REG_POINTER_CONFIG, bytes);
  }      

  module.exports = ADS1x15;
