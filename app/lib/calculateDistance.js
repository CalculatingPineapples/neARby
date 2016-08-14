const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

// calculates the total distance
const hypotenuseDistance = (lat1, lon1, lat2, lon2) => {
  var R = 6371000; // Radius of the earth in m
  var dLat = deg2rad(lat2 - lat1);  // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in m
  return d;
};

// calculates the x distance
const findXDistance = (initLat, newLat) => {
  return (newLat - initLat) * 111230;
};

const square = (number) => {
  return number * number;
};

// calculates the y distance using Pythagorean Theorem
const findYDistance = (hypotenuse, xDistance, initLon, newLon) => {
  var yDistance = Math.sqrt(square(hypotenuse) - square(xDistance));
  return (newLon - initLon > 0) ? yDistance : -1 * yDistance;
};

export const calculateDistance = (prevCoords, currentCoords, cameraCallback, loggerCallback) => {
  let distance = hypotenuseDistance(prevCoords.latitude, prevCoords.longitude, currentCoords.latitude, currentCoords.longitude);
  let deltaX = findXDistance(prevCoords.latitude, currentCoords.latitude);
  let deltaZ = findYDistance(distance, deltaX, prevCoords.longitude, currentCoords.longitude);

  //this callback is pass all the way down from initGeolocation;
  if (cameraCallback) {
    cameraCallback({ type: 'cameraPosition', deltaX: deltaX, deltaZ: deltaZ});
  }

  //this is only for debugging purposes to show deltaX, deltaZ on screen, should remove later
  if (loggerCallback) {
    loggerCallback(deltaX, deltaZ, distance);
  }

  return {
    deltaX: deltaX,
    deltaZ: deltaZ,
    distance: distance
  };
};

// //37.788250, -122.402619
// //37.787966, -122.403150
// let coords1 = {latitude: 37.788250, longitude: -122.402619};
// let coords2 = {latitude: 37.787966, longitude: -122.403150};
