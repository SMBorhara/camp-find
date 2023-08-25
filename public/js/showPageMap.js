mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
	container: 'map', // container ID
	style: 'mapbox://styles/mapbox/streets-v12', // style URL
	center: campground.geometry.coordinates, // starting position [lng, lat]
	zoom: 12, // starting zoom
});

new mapboxgl.Marker({ color: '#C71585', rotation: 75 })
	.setLngLat([campground.geometry.coordinates])
	.addTo(map);
