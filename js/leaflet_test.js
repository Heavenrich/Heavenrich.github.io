const map = L.map('map').setView([43.2557, -79.8711], 14); //starting position
// const map = L.map('map').setView([38.6270, -90.1994], 14); //starting position
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19, attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);

function onMapClick(e) {
	var popup = L.popup().setLatLng(e.latlng).setContent("Position: " + e.latlng).openOn(map)
}

// map.on('click', onMapClick);

// let xhr = new XMLHttpRequest();
// xhr.open('GET', 'data/windsurf_spots.geojson');
// xhr.setRequestHeader('Content-Type', 'application/json');
// xhr.responseType = 'json';
// xhr.onload = function() {
// 	    if (xhr.status !== 200) return
// 	    L.geoJSON(xhr.response).addTo(map);
// };
// xhr.send();


// GTFS Code

const gtfsArrayToGeojsonFeatures = (gtfsArray) => {
	return gtfsArray.map((gtfsObject) => {
	  // console.log("gtfsObject", gtfsObject);
	  return {
		type: "Feature",
		properties: {
		  // Depending on your data source, the properties available on "gtfsObject" may be different:
		  route: gtfsObject.vehicle.trip.route_id,
		  route_start: gtfsObject.vehicle.trip.start_time,
		  vehicle_label: gtfsObject.vehicle.vehicle.label
		},
		geometry: {
		  type: "Point",
		  coordinates: [
			gtfsObject.vehicle.position.longitude,
			gtfsObject.vehicle.position.latitude
		  ]
		}
	  };
	});
};


const pbfToGeojson = async () => {
	const proxy = "https://cors-anywhere-jioo.onrender.com/"
	// const url = proxy + "https://www.metrostlouis.org/RealTimeData/StlRealTimeVehicles.pb"
	const url = proxy + "https://opendata.hamilton.ca/GTFS-RT/GTFS_VehiclePositions.pb"
	// const url = proxy + "http://gtfs.ltconline.ca/Vehicle/VehiclePositions.pb"
	let response = await fetch(url);
	if (response.ok) {
	// if HTTP-status is 200-299
	// get the response body (the method explained below)
	const bufferRes = await response.arrayBuffer();
	const pbf = new Pbf(new Uint8Array(bufferRes));
	const obj = FeedMessage.read(pbf);
// Return the data in GeoJSON format:
	return {
		type: "FeatureCollection",
		features: gtfsArrayToGeojsonFeatures(obj.entity)
	};
	} else {
	console.error("error:", response.status);
	}
}


const layer = L.geoJSON([], {
style: function (feature) {
	return { color: feature.properties.color };
}
})
.bindPopup(function (layer) {
	return "Bus: " + layer.feature.properties.vehicle_label + "<br />Route: " + layer.feature.properties.route;
})
.addTo(map);

const updateLayer = async (layer) => {
const locations = await pbfToGeojson();
layer.clearLayers()
layer.addData(locations);
};

updateLayer(layer);

window.addEventListener('load', function () {
	// Your document is loaded.
	var fetchInterval = 30000; // 5 seconds.

	// Invoke the request every 5 seconds.
	setInterval(updateLayer, fetchInterval, layer);
});

// updateLayer(layer);