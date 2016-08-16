export const injectScript = `
  (function () {

    //add some directional axis for debugging
    var addAxis = function() {
      //red
      // var geo = new THREE.BoxGeometry(1000, .3, .3);
      // var mat = new THREE.MeshBasicMaterial({color: "rgba(0,255,255,.1)", wireframe: true});
      // var axisX = new THREE.Mesh(geo, mat);
      // axisX.name = 'axisX';
      // axisX.position.set(0, -20, 0);
      // window.scene.add(axisX);

      //green
      // var geo = new THREE.BoxGeometry(.3, 1000, .3);
      // var mat = new THREE.MeshBasicMaterial({color: "rgba(0,255,255,.1)", wireframe: true});
      // var axisY = new THREE.Mesh(geo, mat);
      // axisY.name = 'axisY';
      // axisY.position.set(0, 0, 0);
      // axisY.rotation.y = 45 * Math.PI / 180;
      // window.scene.add(axisY);

      //blue
      // var geo = new THREE.BoxGeometry(.3, .3, 1000);
      // var mat = new THREE.MeshBasicMaterial({color: "rgba(0,255,255,.1)", wireframe: true});
      // var axisZ = new THREE.Mesh(geo, mat);
      // axisZ.name = 'axisZ';
      // axisZ.position.set(0, -20, 0);
      // window.scene.add(axisZ);
    };

    var orientCompass = function(message) {
      //set compass to current location too
      // window.scene.getObjectByName( "axisX" ).position.set(message.deltaZ, -20, -1 * message.deltaX);
      window.scene.getObjectByName( "axisY" ).position.set(message.deltaZ, 0, -1 * message.deltaX);
      // window.scene.getObjectByName( "axisZ" ).position.set(message.deltaZ, -20, -1 * message.deltaX);
    }

    //add cube in arbitraury location
    var addCubeHere = function(threejsLat, threejsLon) {
      var geometry = new THREE.BoxGeometry( 1, 1, 1 );
      var material = new THREE.MeshBasicMaterial( { color: "rgb(255, 0, 0)", wireframe: true } );
      var cube = new THREE.Mesh( geometry, material );
      cube.position.set(threejsLon, 0, -1 * threejsLat);
      window.scene.add( cube );
    }

    var beginAnimation = function() {
      //followings are global variables that allows html to render scene
      window.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);
      window.controls = new THREE.DeviceOrientationControls( camera, true );

      //animate function comes from html string
      window.animate();
      addAxis();
    }

    if (WebViewBridge) {
      WebViewBridge.onMessage = function (message) {
        var message = JSON.parse(message);

        if (message.type === "cameraPosition") {
          //sets threejs camera position as gps location changes, deltaZ is change in long, deltaX is change in lat
          window.camera.position.set(message.deltaZ, 0, -1 * message.deltaX);
          orientCompass(message);
          WebViewBridge.send(JSON.stringify("in WebViewBridge, got cameraPosition"));

        } else if (message.type === "initialHeading") {

          heading = message.heading;
          beginAnimation();
          WebViewBridge.send(JSON.stringify("heading received"));

        } else if (message.type === 'places') {
          // window.alert('asdfasdf');
          var places = message.places;
          WebViewBridge.send(JSON.stringify("in WebViewBridge, got places"));
          window.divs.forEach(function(obj) {
            if (obj.cube) {
              obj.div.remove();
              scene.remove(obj.cube); 
            }
          });
          window.divs = [];
          places.forEach(function(place){
            window.createPlace(place.lat, place.lon, place.name, place.distance);
          })

        } else if (message.type === 'currentHeading') {
          heading = message.heading;
          headingUpdate = true;
          // WebViewBridge.send(JSON.stringify("in WebViewBridge, got currentHeading"));

        } else if (message.type === 'addTestCube') {
          addCubeHere(message.deltaX, message.deltaZ);
          WebViewBridge.send(JSON.stringify("in WebViewBridge, add cube here"));
        }
      };

      WebViewBridge.send(JSON.stringify("webview is loaded"));
    }
  }());
`;
