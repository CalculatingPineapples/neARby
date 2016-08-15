const RenderScene =
`
  <script>
    var camera, controls, animate, heading, scene, headingUpdate;
    window.divs = [];
    (function() {
      "use strict";
      window.addEventListener('load', function() {
        var container, renderer, geometry, mesh;
        var frustum = new THREE.Frustum();
        document.body.style.fontFamily = 'Helvetica, sans-serif';
        window.divs = [];
        var divsInSight = [];
        var checkOverlap = function(rect1, rect2) {
          return !(rect1.right < rect2.left ||
                 rect1.left > rect2.right ||
                 rect1.bottom < rect2.top ||
                 rect1.top > rect2.bottom);
        }
        var checkFrustum = function() {
          frustum.setFromMatrix( new THREE.Matrix4().multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse ) );
          return window.divs.filter(function(obj) {
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
            var scale = 1 / (normalized / 2000) * 0.3;
            if (scale > 1.4) {
              scale = 1.4;
            }
            element.style.transform = 'scale(' + scale + ')';
          }
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
          window.divs.push({div: element, cube: cube});
        }
        var checkCollision = function(div) {
          var rect1 = div.querySelector('h1').getBoundingClientRect();
          return divsInSight.some(function(e) {
            if (e.div === div) {
              return false;
            }
            var rect2 = e.div.getBoundingClientRect();
            return checkOverlap(rect1, rect2);
          });
        }
        animate = function(){
          divsInSight = checkFrustum();
          divsInSight.forEach(function(element) {
            var div = element.div;
            var cube = element.cube;
            div.style.display = '';
            var position = THREEx.ObjCoord.cssPosition(cube, camera, renderer);
            var left = (position.x - div.offsetWidth /2);
            div.style.left = left + 'px';
            var top = (position.y - div.offsetHeight/2);
            div.style.top = top + 'px';
            for (var inc = 80; checkCollision(div); inc += 80) {
              div.style.top = top + inc + 'px';
            }
          });
          window.requestAnimationFrame( animate );
          // controls.update();
          controls.updateAlphaOffsetAngle( (360 - heading) * (Math.PI / 180));
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