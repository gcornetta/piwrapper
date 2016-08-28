//================================================================
//ads1x15 test program
//Author: Gianluca Cornetta
//===============================================================

var ADS1x15 = require('../../lib/ads1x15/ADS1x15');


console.log("Press Ctrl+C to exit\n");

process.on('SIGINT', function() {
	console.log("\nGracefully shutting down from SIGINT (Ctrl+C)");
    process.exit();    
});

var ADS1015 = 0x00	// 12-bit ADC;
var ADS1115 = 0x01	// 16-bit ADC;

// Initialise the ADC using the default mode (use default I2C address)
// Set this to ADS1015 or ADS1115 depending on the ADC you are using!
var adc = new ADS1x15(address=0x48, ic=ADS1115);

// Read channels 2 and 3 in single-ended mode, at +/-2.048V and 250sps
var volts2 = adc.readADCSingleEnded(2, 2048, 250)/1000.0;
var volts3 = adc.readADCSingleEnded(3, 2048, 250)/1000.0;

// Now do a differential reading of channels 2 and 3
var voltsdiff = adc.readADCDifferential23(2048, 250)/1000.0

// Display the two different reading for comparison purposes
console.log("v2: " + volts2 + " v3: " + volts3 + " v3-v2: " + (volts3-volts2) + " vdiff: " + -voltsdiff + "\n");
