const raspi = require('raspi');
const Serial = require('raspi-serial').Serial;
var AisParser = require('aisparser');
const https = require('https')
var http = require('http'),
fs = require('fs');
var parser = new AisParser();

var buff = "";

var testMMSI = "367782880";

//Monitor the serial port for the AIS receiver

raspi.init(() => {
	var serial = new Serial({portId:'/dev/serial0', baudRate:38400});
	serial.open(() => {
		serial.on('data', (data) => {
			buildAIS(data);
	});
	});

	//test the MMSI
	getVesselDetails(testMMSI);
});


//Parse AIS messages
function buildAIS(data) {
	var s = data.toString();
if (s.length > 1) {
//console.log(s);
	buff = buff + s;
	//console.log(buff);
	if (buff.length > 46) {
		parseAIS(buff);
		buff = "";
	}
}
}

function parseAIS(msg) {
	console.log("*** " + msg);
	var result = parser.parse(msg);
	
	var vals = result.supportedValues;
	for (n in vals) {
		console.log(n + ":" + result[n]);
	}
	getVesselDetails(result.mmsi)
}

//Get vessel detail
//https://www.marinetraffic.com/en/ais/details/ships/mmsi:367782880
function getVesselDetails(mmsi) {
	https.get("https://www.marinetraffic.com/en/ais/details/ships/mmsi:" + mmsi, (resp) => {
	  let data = '';

	  // A chunk of data has been recieved.
	  resp.on('data', (chunk) => {
	    data += chunk;
	  });

	  // The whole response has been received. Print out the result.
	  resp.on('end', () => {
	    var t = data.split("var ls_vessel  = ")[1].split("/*")[0];
	    var j = JSON.parse(t);
	    return(j);
	  });
});

}



