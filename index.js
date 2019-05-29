const raspi = require('raspi');
const Serial = require('raspi-serial').Serial;
var AisParser = require('aisparser');
var parser = new AisParser();

var buff = "";

//Monitor the serial port for the AIS receiver
raspi.init(() => {
	var serial = new Serial({portId:'/dev/serial0', baudRate:38400});
	serial.open(() => {
		serial.on('data', (data) => {
			buildAIS(data);
	});
	});
});


//Parse messages
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


}
