const map = L.map('map').setView([43.2557, -79.8711], 14); //starting position
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19, attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);

function onMapClick(e) {
	var popup = L.popup().setLatLng(e.latlng).setContent("Position: " + e.latlng).openOn(map)
}

map.on('click', onMapClick);

let xhr = new XMLHttpRequest();
xhr.open('GET', 'data/windsurf_spots.geojson');
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.responseType = 'json';
xhr.onload = function() {
	    if (xhr.status !== 200) return
	    L.geoJSON(xhr.response).addTo(map);
};
xhr.send();
