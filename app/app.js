(function(document){
'use strict';

L.mapbox.accessToken = 'pk.eyJ1IjoiaGVjdG9yZ3VvIiwiYSI6ImNpaG0wZGcxcTBvOWp2ZmtsbHd2Y3h5eGIifQ.9gQvy3rj0VJbpl8TS745Kw';

var map = L.mapbox.map('map', 'mapbox.light')
    .setView([37.8, -96], 3);

var uLayer = L.mapbox.featureLayer().addTo(map),
    topDevLayer = L.mapbox.featureLayer().addTo(map),
    topDesgLayer = L.mapbox.featureLayer().addTo(map);

var _checkbox = {
      toefl: document.querySelectorAll('#TOEFL input'),
      ivy: document.querySelector('#ivy'),
      lkin: document.querySelectorAll('#linkedin input')
    };

function init(data){
  data = data.features;
  var topDesgData = data.filter(function(item){
        return item.properties.desRank;
      }),
      topDevData = data.filter(function(item){
        return item.properties.devRank;
      });

  map.tileLayer.setOpacity(0.6);
  map.scrollWheelZoom.disable();

  // Load Data for each layer (Last load, Last show)
  topDevLayer.setGeoJSON(topDevData);
  topDesgLayer.setGeoJSON(topDesgData);
  uLayer.setGeoJSON(data);
  
  // init Linkedin Top layer (if no checked, hide them)
  filterAll(_checkbox.toefl, 'TOEFL');

  map.fitBounds(uLayer.getBounds());
  
}

function bindEvent(data){
  var tfChecks = _checkbox.toefl,
      ivyCheck = _checkbox.ivy,
      lkChecks = _checkbox.lkin;

  // Custom Layer Icon
  uLayer.on('layeradd', function(e) {
      setuLayerIcon(e.layer, ivyCheck.checked);
  });

  topDevLayer.on('layeradd', function(e) {
      setTopLayerIcon(e.layer, 'devRank');
  });

  topDesgLayer.on('layeradd', function(e) {
      setTopLayerIcon(e.layer, 'desRank', '#ff8888');
  });

  // Tooltip showup on mouseover
  uLayer.on('mouseover', function(e) {
      e.layer.openPopup();
  });
  // layer.on('mouseout', function(e) {
  //     e.layer.closePopup();
  // });

  // bind TOEFL checkbox
  for (var i = 0; i < tfChecks.length; i++) {
      tfChecks[i].addEventListener('change', refreshTF);
  }

  // bind IVY League checkbox
  ivyCheck.addEventListener('change', function(){
    uLayer.eachLayer(function(marker){
      setuLayerIcon(marker, ivyCheck.checked);
    });
  });

  // bind Linkedin Top 10 data checkbox
  for (var i = 0; i < lkChecks.length; i++) {
    lkChecks[i].addEventListener('click', refreshLk);
  }

  function refreshTF(){
    filterAll(_checkbox.toefl, 'TOEFL');
  }
  function refreshLk(){
    filterRank(_checkbox.toefl, 'TOEFL');
  }
}

// Custom Style and Highlight Ivy League
function setuLayerIcon(marker, ivyChecked){
  var prop = marker.feature.properties,
      ivyClass = ivyChecked && prop.isIvy ? 'ivy' : '';
  
  marker.setIcon(L.divIcon({
        className: 'label',
        html: '<span class="marker '+ivyClass+'">' + prop.title + '</span>', // add content inside the marker,
        iconSize: [80, 30],
        popupAnchor: [0, -14],
        iconAnchor: [40, 0]
    }));
}

// Custom Style for Linkedin Rank Layers
function setTopLayerIcon(marker, symbol, color){
  var prop = marker.feature.properties;
  
  symbol = prop[symbol] ? prop[symbol] : 'college';
  color = color ? color : '#63b6e5'; // default blue color
  
  marker.setIcon(L.mapbox.marker.icon({
      'marker-size': 'medium',
      'marker-symbol': symbol,
      'marker-color': color
  }));
}

// Filter Linkedin Rank
function filterRank(checkbox, scoreType){
  var lkChecked = document.querySelector('#linkedin input:checked');

  topDevLayer.setFilter(function(){return false;});
  topDesgLayer.setFilter(function(){return false;});

  if(!lkChecked || lkChecked.value == 'none') return;
  
  if(lkChecked.value == 'dev'){
    filterScore(topDevLayer, checkbox, scoreType);
  } else if (lkChecked.value == 'des'){
    filterScore(topDesgLayer, checkbox, scoreType);
  }
}


// Filter All the Layers (Linkedin Rank, TOEFL)
function filterAll(checkbox, scoreType) {
    filterRank(checkbox, scoreType);
    filterScore(uLayer, checkbox, scoreType);
}

function filterScore(layer, checkbox, scoreType) {
    layer.setFilter(function(f) {
        var score = (f.properties[scoreType]> 0) ? f.properties[scoreType]: 0,
            filter = false;
        for (var i = 0; i < checkbox.length; i++) {
            if (checkbox[i].checked) {
                filter = (i === 0) ? (score >= checkbox[i].value) : (score >= checkbox[i].value && score < checkbox[i - 1].value);
            }
            if (filter) return true; // 只要满足其中一个区间就可以
        }
        return false;
    });
}

// Get Data and Initialize Filter
fetch('us.json')
    .then(function(res) {
        return res.json();
    })
    .then(function(json) {
        bindEvent(json);
        init(json);
    });
})(document);