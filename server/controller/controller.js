var request = require('request');
var initLon;
var initLat;

function getPlaces(req, res) {
  // check to see if it is the initial location
  if (req.body.threejsLat === 0 && req.body.threejsLon === 0) {
    // if so recored the initial position
    initLat = req.body.latitude;
    initLon = req.body.longitude;
  }
  // call to google API to get locations around
  var radius = 5000;
  var apiKey = 'AIzaSyB10Fe32kWefZ8SNREvTOcYyrJXZ2Qtnu8';
  var link = `https://maps.googleapis.com/maps/api/place/search/json?location=${req.body.actualLon},${req.body.actualLat}&radius=${radius}$key=${apiKey}`;
  request(link, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var threeObjs = [];
      // iterate over the data to extract data we want
      body.forEach(function(result) {
        var place = {
        name: result.name,
        lat: result.geometry.lat - initLat,
        lon: result.geometry.lon - initLon,
        };
        threeObjs.push(place);
      });
      // send back data to client side
      res.send(threeObjs);
    }
  });
}
//   $.ajax({
//     type: 'GET',
//     url: link,
//   })
//   .done((data) => {
//     var threeObjs = [];
//     data.results.forEach(function(result) {
//       var place = {
//         name: result.name,
//         lat: result.geometry.lat - initLat,
//         lon: result.geometry.lon - initLon,
//       };
//       threeObjs.push(place);
//     });
//     // send back data to client side
//     res.send(threeObjs);
//   });
// }
module.exports = getPlaces;
