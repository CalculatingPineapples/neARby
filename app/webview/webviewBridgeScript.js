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
          WebViewBridge.send(JSON.stringify("heading received"));

        } else if (message.type === 'places') {
          // window.alert('places');
          var places = message.places;
          // var places = [
          //   {name: 'nice place', lat: 3, lon: 4, distance: 100},
          //   {name: 'cool place', lat: 200, lon: 102, distance: 100},
          //   {name: 'excellent place nice', lat: 122, lon: 23, distance: 100},
          //   {name: 'best place ever', lat: 131, lon: 200, distance: 100},
          //   {name: 'best place ever', lat: 131, lon: 200, distance: 100},
          // ];

          WebViewBridge.send(JSON.stringify("in WebViewBridge, got places"));
          window.clearScene();
          window.divs = [];

          places.forEach(function(place, key) {
            loading = false;
            window.createPlace(place.lat, place.lon, place.name, place.distance, key, place.type);
            // if (place.type && (place.type === 'userPlace')) {
            //   // var torus = new THREE.TorusGeometry( 2, .5, 10, 25 );
            //   addCubeHere(place.lat, place.lon, "rgb(255, 0, 0)", torus);
            // } else if (place.type && (place.type === 'userEvent')) {
            //   // var diamond = new THREE.OctahedronGeometry( 2, 0 );
            //   addCubeHere(place.lat, place.lon, "rgb(255, 255, 0)", diamond);
            // } else {
            //   window.createPlace(place.lat, place.lon, place.name, place.distance, key);
            // }
          });
          // window.createImage('http://www.jqueryscript.net/images/Simplest-Responsive-jQuery-Image-Lightbox-Plugin-simple-lightbox.jpg');

        } else if (message.type === 'currentHeading') {
          heading = message.heading;
          // WebViewBridge.send(JSON.stringify("in WebViewBridge, got currentHeading"));

        } else if (message.type === 'images') {
          // window.alert('images mode');
          window.clearScene();
          var images = message.images.slice(0,5);
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

