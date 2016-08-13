export const injectScript = `
  (function () {

    //add some directional axis for debugging visualization
    var addAxis = function() {

      //red
      var geo = new THREE.BoxGeometry(1000, .3, .3);
      var mat = new THREE.MeshBasicMaterial({color: "rgb(255, 0, 0)", wireframe: true});
      var axisX = new THREE.Mesh(geo, mat);
      axisX.name = 'axisX';
      axisX.position.set(0, -20, 0);
      window.scene.add(axisX);

      //green
      var geo = new THREE.BoxGeometry(.3, 1000, .3);
      var mat = new THREE.MeshBasicMaterial({color: "rgb(0, 255, 0)", wireframe: true});
      var axisY = new THREE.Mesh(geo, mat);
      axisY.name = 'axisY';
      axisY.position.set(0, 0, 0);
      window.scene.add(axisY);

      //blue
      var geo = new THREE.BoxGeometry(.3, .3, 1000);
      var mat = new THREE.MeshBasicMaterial({color: "rgb(0, 0, 255)", wireframe: true});
      var axisZ = new THREE.Mesh(geo, mat);
      axisZ.name = 'axisZ';
      axisZ.position.set(0, -20, 0);
      window.scene.add(axisZ);
    };

    //add cube in arbitraury location
    var addCubeHere = function(threejsLat, threejsLon) {
      var geometry = new THREE.BoxGeometry( 1, 1, 1 );
      var material = new THREE.MeshBasicMaterial( { color: "rgb(255, 0, 0)", wireframe: true } );
      var cube = new THREE.Mesh( geometry, material );
      cube.position.set(-1 * threejsLon, 0, -1 * threejsLat);
      window.scene.add( cube );
    }

    if (WebViewBridge) {
      WebViewBridge.onMessage = function (message) {
        var message = JSON.parse(message);

        if (message.type === "cameraPosition") {
          //sets threejs camera position as gps location changes
          //deltaZ is change in long
          //deltaX is change in lat
          window.camera.position.set(-1 * message.deltaZ, 0, -1 * message.deltaX);

          //set compass to current location too
          window.scene.getObjectByName( "axisX" ).position.set(-1 * message.deltaZ, -20, -1 * message.deltaX);
          window.scene.getObjectByName( "axisY" ).position.set(-1 * message.deltaZ, 0, -1 * message.deltaX);
          window.scene.getObjectByName( "axisZ" ).position.set(-1 * message.deltaZ, -20, -1 * message.deltaX);
          
          WebViewBridge.send("in WebViewBridge, got cameraPosition: " + JSON.stringify(message));

        } else if (message.type === "initialHeading") {

          heading = message.heading;
          headingUpdate = true;
          //followings are global variables that allows html to render scene
          window.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);
          window.controls = new THREE.DeviceOrientationControls( camera, true );

          //animate function comes from html string
          animate();
          addAxis();
          WebViewBridge.send("heading received");

        } else if (message.type === 'places') {
          var places = message.places;
          WebViewBridge.send("in WebViewBridge, got places");

          places.forEach(function(place){
            window.createPlace(place.lat, place.lon, place.name, place.distance);
          })

        } else if (message.type === 'currentHeading') {
          heading = message.heading;
          headingUpdate = true;
          WebViewBridge.send("in WebViewBridge, got currentHeading")
        } else if (message.type === 'addTestCube') {
          addCubeHere(message.deltaX, message.deltaZ);
          WebViewBridge.send("in WebViewBridge, add cube here");
        }
      };

      WebViewBridge.send("webview is loaded");
    }
  }());
`;
