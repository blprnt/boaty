const raspi = require('raspi');
const Serial = require('raspi-serial').Serial;
var AisParser = require('aisparser');
const https = require('https')
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
}

//Get vessel detail

function getVesselDetails(mmsi) {

	const data = JSON.stringify({
	  	'lang':'en',
		'lgg':7,
		'p':1,
		'sh_name':'',
		'sh_callsign':'',
		'sh_mmsi': mmsi,
		'cgaid':0,
		'sh_epirb_id':'',
		'sh_epirb_hex':'',
		'sh_imo_nbr':''
	})

	const options = {
	  hostname: 'www.itu.int',
	  port: 443,
	  path: '/online/mms/mars/ship_search.sh',
	  method: 'POST',
	  headers: {
	    'Content-Type': 'application/json',
	    'Content-Length': data.length
	  }
	}

	const req = https.request(options, (res) => {
	  console.log(`statusCode: ${res.statusCode}`)

	  res.on('data', (d) => {
	    process.stdout.write(d)
	  })
	})

	req.on('error', (error) => {
	  console.error(error)
	})

	req.write(data)
	req.end()
}



/*

def get_vessel_details(mmsi):
	# look up vessel name from the vessel's Mobile Maritime Subscriber Identifier (mmsi)
	data= {
	    'lang':'en',
		'lgg':7,
		'p':1,
		'sh_name':'',
		'sh_callsign':'',
		'sh_mmsi': mmsi,
		'cgaid':0,
		'sh_epirb_id':'',
		'sh_epirb_hex':'',
		'sh_imo_nbr':''
	    }
	r = requests.post('http://www.itu.int/online/mms/mars/ship_search.sh', data=data)

	page = r.text.split("\n")
	for x in page:
		if "<A HREF=ship_detail.sh" in x:
			link = "http://www.itu.int/online/mms/mars/" + x.split("<A HREF=")[1].split(">")[0]
			print link
			vessel_name = link.split("&")[2].replace("+"," ")
			return vessel_name
*/
