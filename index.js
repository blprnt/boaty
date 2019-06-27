const raspi = require('raspi');
const Serial = require('raspi-serial').Serial;
var AisParser = require('aisparser');
const https = require('https')
var http = require('http'),
fs = require('fs');
var parser = new AisParser();

var sqlite3 = require('sqlite3').verbose();
var db   = new sqlite3.Database('./boaty.db');

var buff = "";

var testMMSI = "367782880";

var vesselMap = {};

//Monitor the serial port for the AIS receiver

raspi.init(() => {
	var serial = new Serial({portId:'/dev/serial0', baudRate:38400});
	serial.open(() => {
		serial.on('data', (data) => {
			buildAIS(data);
	});
	});

	//test the MMSI
	//getVesselDetails(testMMSI);
});


//Parse AIS messages
function buildAIS(data) {
	var s = data.toString();
	if (s.length > 1) {
		buff = buff + s;
		if (buff.length > 46) {
			parseAIS(buff);
			buff = "";
		}
		//console.log(buff);
	}
}

function parseAIS(msg) {
	console.log("*** " + msg);
	var result = parser.parse(msg);
	
	var vals = result.supportedValues;
	for (n in vals) {
		//console.log(n + ":" + result[n]);
	}


	if (!vesselMap[result.mmsi]) {
		getVesselDetails(result.mmsi);
	} else {
		console.log("RETRIEVE:" + result.mmsi);
		console.log(vesselMap[result.mmsi]);
	}

	
	
	
	
}

function fileVessel(mmsi) {
	
}

//Get vessel detail
//https://www.marinetraffic.com/en/ais/details/ships/mmsi:367782880
function getVesselDetails(mmsi) {
console.log(mmsi);
	https.get("https://www.marinetraffic.com/en/ais/details/ships/mmsi:" + mmsi, (resp) => {
	  let data = '';

	  // A chunk of data has been recieved.
	  resp.on('data', (chunk) => {
	    data += chunk;
	  });

	  // The whole response has been received. Print out the result.
	  resp.on('end', () => {
	  	try {
		    var t = data.split("var ls_vessel  = ")[1].split("/*")[0];
		    var j = JSON.parse(t);
		    console.log(j);
		    
		} catch (e) {
		    console.log("ERROR" + e);
		}
	  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});;

}



