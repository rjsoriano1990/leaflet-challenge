const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";


d3.json(url).then((data) => {
    makeFeatures(data.features);
});


function chooseColor(depth) {
    if (depth >= 90) return "#ff0000";
    else if (depth >= 70) return "#fca35d";
    else if (depth >= 50) return "#fdb72a";
    else if (depth >= 30) return "#f7db11";
    else if (depth >= 10) return "#dcf400";
    else return "#a3f600";
}

function makeFeatures(earthquakeData) {
	
    function onEachFeature(feature, layer) {
  		
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><ul><li>${new Date(feature.properties.time)}</li><li>Magnitude: ${feature.properties.mag}</li><li>Depth: ${feature.geometry.coordinates[2]}</li></ul>`);
    }

    
    function circleRadius(magnitude) {
        return magnitude * 8;      
    }

 
    function geojsonMarkerOptions(features) {
        return {
            radius: circleRadius(parseInt(features.properties.mag)),
            fillColor: chooseColor(features.geometry.coordinates[2]),
            color: "#B0B5B3",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.7
        };
    }

	
    var earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function (features, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions(features));
        },
		
        onEachFeature: onEachFeature
    });

	
    makeMap(earthquakes);
}

function makeMap(earthquakes) {
    
    var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

   
    var baseMaps = {
        "Street Map": street,
        "Topographic Map": topo
    };

   
    var overlayMaps = {
        Earthquakes: earthquakes
    };

    
    var myMap = L.map("map", {
        center: [37.7749, -122.4194],
        zoom: 5,
        layers: [street, earthquakes]
    });

    
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function () {
        var div = L.DomUtil.create('div', 'info legend'),
        grades = [-10, 10, 30, 50, 70, 90];

        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + chooseColor(grades[i] +1) + '"></i>' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
        return div;
    };

    legend.addTo(myMap);
}