const RenderScene =
`
  <script>
    var camera, controls, animate, heading, scene, headingUpdate;
    (function() {
      "use strict";

      window.addEventListener('load', function() {
        var container, renderer, geometry, mesh;
        var frustum = new THREE.Frustum();

        document.body.style.fontFamily = 'Helvetica, sans-serif';

        var divs = [];

        var checkFrustum = function() {
          frustum.setFromMatrix( new THREE.Matrix4().multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse ) );
          return divs.filter(function(obj) {
            var visible = frustum.intersectsObject(obj.cube);
            if (!visible) {
              obj.div.style.display = 'none';
            }
            return visible;
          });
        };

        window.createPlace = function(lat, long, name, distance) {

          var scaleDivSize = function(element, distance) {
            var normalized = distance - 30;
            var scale = normalized / 70;
            if (scale > 1) {
              scale = 1;
            }
            element.style.transform = 'scale(' + scale + ')';
          }

          if (distance < 1000) {
            var element = document.createElement('div')
            element.className = 'place';
            element.style.backgroundColor = 'rgba(0, 127, 127, 0.443137)';
            element.style.border = '1px solid rgba(127,255,255,0.75)';
            scaleDivSize(element, distance);
            document.body.appendChild(element);

            var nameHeading = document.createElement('h1');
            nameHeading.innerText = name;
            nameHeading.style.color = 'rgba(255,255,255,0.75)';
            nameHeading.style.fontWeight = 'bold';
            nameHeading.style.fontSize = '15px';
            nameHeading.style.marginLeft = '10px';
            nameHeading.style.marginRight = '10px';
            element.appendChild(nameHeading);

            var distanceHeading = document.createElement('h1');
            distanceHeading.innerText = distance;
            distanceHeading.style.color = 'rgba(127,255,255,0.75)';
            distanceHeading.style.fontWeight = 'bold';
            distanceHeading.style.fontSize = '8px';
            distanceHeading.style.marginLeft = '8px';
            element.appendChild(distanceHeading);

            element.style.position  = 'absolute';

            var geo = new THREE.BoxGeometry(1, 1, 1);
            var mat = new THREE.MeshBasicMaterial({color: 0x00FF00, wireframe: true});
            var cube = new THREE.Mesh(geo, mat);
            cube.position.set(long, 0, -1 * lat);
            cube.visible = false;
            scene.add(cube);
            divs.push({div: element, cube: cube});
          }
        }

        animate = function(){

          var divsInSight = checkFrustum();

          divsInSight.forEach(function(element) {
            var div = element.div;
            var cube = element.cube;
            div.style.display = '';
            var position = THREEx.ObjCoord.cssPosition(cube, camera, renderer);
            div.style.left = (position.x - div.offsetWidth /2)+'px';
            div.style.top = (position.y - div.offsetHeight/2)+'px';
          });

          window.requestAnimationFrame( animate );

          // controls.update();
          controls.updateAlphaOffsetAngle( (360 - heading) * (Math.PI / 180), headingUpdate);
          renderer.render(scene, camera);

        };

        container = document.getElementById( 'container' );

        scene = new THREE.Scene();

        renderer = new THREE.WebGLRenderer({alpha: true});
        renderer.setClearColor( 0x000000, 0 ); // the default
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.top = 0;
        container.appendChild(renderer.domElement);

        window.addEventListener('resize', function() {

          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize( window.innerWidth, window.innerHeight );

        }, false);


        }, false);

    }());
  </script>
`;

export default RenderScene;
