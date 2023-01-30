// Part 1: Create the Earthquake Visualization

// creating base layers
// street map layer
var streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// 2.2 Add other base maps to choose from
// topogrpahic map layer
var topographMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// satellite map layer
var satelliteMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

// road map layer
var roadMap = L.tileLayer('https://wxs.ign.fr/{apikey}/geoportail/wmts?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&STYLE={style}&TILEMATRIXSET=PM&FORMAT={format}&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}', {
	attribution: '<a target="_blank" href="https://www.geoportail.gouv.fr/">Geoportail France</a>',
	bounds: [[-75, -180], [81, 180]],
	minZoom: 2,
	maxZoom: 18,
	apikey: 'choisirgeoportail',
	format: 'image/png',
	style: 'normal'
});

// Create a baseMaps object.
var baseMaps = {
  "Street Map": streetMap,
  "Topographic Map": topographMap,
  "Satellite Map": satelliteMap,
  "Road Map": roadMap
};

// Creating the map object
var myMap = L.map("map", {
  center: [52.47772713980855, -1.899038436477335],
  zoom: 3,
  layers: [streetMap]
});

// 2.3 Create a legend that will provide context for your map data.
var legend = L.control({position: 'bottomright'});

legend.onAdd = function(map) {

    var div = L.DomUtil.create('div', 'info legend'),
        levels = [0, 10, 20, 50, 100, 200, 500, 1000],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < levels.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(levels[i] + 1) + '"></i> ' +
            levels[i] + (levels[i + 1] ? '&ndash;' + levels[i + 1] + '<br><br>' : '+');
    }
    return div;
};

// Adding the legend to the map
legend.addTo(myMap);

// Part 2: Gather and Plot More Data (Optional)
// not ordered

// 2.4 Add layer controls to our map.
L.control.layers(baseMaps, {}).addTo(myMap);

// Adding the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Set gradient colour scale
function getColor(colourScale) {
  return colourScale > 1000 ? '#4a0656' :
          colourScale > 500  ? '#63276a' :
          colourScale > 200  ? '#7c437f' :
          colourScale > 100  ? '#956095' :
          colourScale > 50   ? '#ae7cab' :
          colourScale > 20   ? '#c79ac3' :
          colourScale > 10   ? '#e0b9da' :
          '#f9d8f3';
};

// Store the API query variables.
var baseURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

// Assemble the API query URL.
var url = baseURL;

// 2.3 Put each dataset into separate overlays that can be turned on and off independently.

// Get the data with d3.
d3.json(url).then(function(data) {
  // Loop through the earthquake array, and create one marker for each city object.
  var earthquake = data.features;
  for (var i = 0; i < earthquake.length; i++) {
    if (earthquake[i].properties.mag < 0){
      console.log("Magnitude level negative, skipping...");
      continue;
    };

   
    // 2.1. Your data markers should reflect the magnitude of the earthquake by their size and the depth of the earthquake by color. 
    // Earthquakes with higher magnitudes should appear larger, 
      // Conditionals for country gdp_pc
    var depth = earthquake[i].geometry.coordinates[2];
    // and earthquakes with greater depth should appear darker in color.
    var color = getColor(depth);
    console.log(depth);

    // Add circles to the map.
    var coords = [earthquake[i].geometry.coordinates[1],earthquake[i].geometry.coordinates[0]];
    // size
    var size = earthquake[i].properties.mag * 50000;

    L.circle(coords, {
      // border color
      color: "white",
      weight: 1,
      fillOpacity: 0.5,
      fillColor: color,
      // Adjust the radius.
      radius: size
// 2.2 Include popups that provide additional information about the earthquake when its associated marker is clicked.
    }).bindPopup(
      `<h1>${earthquake[i].properties.place}</h1> 
      <hr> 
      <p>Magnitute: ${earthquake[i].properties.mag}<br>
      Depth: ${earthquake[i].geometry.coordinates[2]}</p>`
      ).addTo(myMap);
  }
});

// 2.1 Plot the tectonic plates dataset on the map in addition to the earthquakes.
// on top of the data so it shows
var tectonicPlates = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

d3.json(tectonicPlates).then(function(response){
  console.log("read url");
  console.log(response)
  L.geoJson(response, {
    color: "#4a0656",
    weight: 2,
    opacity: 0.5
  }).addTo(myMap)
});