export const injectScript = `
  (function () {

    // //icosahedron
    // var icosahedron = new THREE.IcosahedronGeometry( 2, 0 );

    // // octahedron
    // var diamond = new THREE.OctahedronGeometry( 2, 0 );

    // // tetrahedron
    // var pyramid = new THREE.TetrahedronGeometry( 2, 0 );

    // // torus
    // var torus = new THREE.TorusGeometry( 3, 1, 16, 40 );

    //add geometry in arbitraury location
    var addCubeHere = function(threejsLat, threejsLon, color, geometry) {
      var material = new THREE.MeshBasicMaterial( { color: color, wireframe: true } );
      var cube = new THREE.Mesh( geometry, material );
      cube.position.set(threejsLon, 0, -1 * threejsLat);
      window.scene.add( cube );
    }

    var beginAnimation = function() {
      //followings are global variables that allows html to render scene

      //animate function comes from html string
      window.animate();
    }

    if (WebViewBridge) {
      WebViewBridge.onMessage = function (message) {
        var message = JSON.parse(message);

        if (message.type === "cameraPosition") {
          // window.alert('cameraPosition');
          //sets threejs camera position as gps location changes, deltaZ is change in long, deltaX is change in lat
          window.camera.position.set(message.deltaZ, 0, -1 * message.deltaX);
          
          if (openingGroup) {
            openingGroup.position.set(message.deltaZ, 0, -1 * message.deltaX);
          }

        } else if (message.type === "initialHeading") {
          // window.alert('initialHeading');
          angleDifference = message.heading;
          loading = false;
          WebViewBridge.send(JSON.stringify("heading received"));

        } else if (message.type === 'places') {
          // window.alert('places');
          var places = message.places;
          window.clearScene();
          window.divs = [];

          places.forEach(function(place, key) {
            window.createPlace(place.lat, place.lon, place.name, place.distance, key, place.type);
          });

        } else if (message.type === 'currentHeading') {
          heading = message.heading;
          // WebViewBridge.send(JSON.stringify("in WebViewBridge, got currentHeading"));

        } else if (message.type === 'images') {
          // window.alert('images mode');
          window.clearScene();
          var images = message.images.slice(0,30);
          images.forEach(function(image) {
            window.createImage(image);
          })
        }
      };

      angleDifference = 0;
      heading = 0;
      beginAnimation();
      WebViewBridge.send(JSON.stringify("webview is loaded"));

    }
  }());
`;


//native will always send heading information to webview
//get difference between current heading and the threejs heading
//if heading exceed certain value
  //webview will calibrate the angle to the true heading by making a smooth camera pan

