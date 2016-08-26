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

export const calculateDistance = (prevCoords, currentCoords) => {
  let distance = hypotenuseDistance(prevCoords.latitude, prevCoords.longitude, currentCoords.latitude, currentCoords.longitude);
  let deltaX = findXDistance(prevCoords.latitude, currentCoords.latitude);
  let deltaZ = findYDistance(distance, deltaX, prevCoords.longitude, currentCoords.longitude);
  return {
    deltaX: deltaX,
    deltaZ: deltaZ,
    distance: distance
  };
};
