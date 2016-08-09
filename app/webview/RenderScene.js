const RenderScene =
`
  <script>
    var camera, controls, animate;

    (function() {
      "use strict";

      window.addEventListener('load', function() {
        var container, scene, renderer, geometry, mesh;

        animate = function(){

          window.requestAnimationFrame( animate );

          controls.update();
          renderer.render(scene, camera);

        };

        container = document.getElementById( 'container' );



        scene = new THREE.Scene();

        var geometry = new THREE.BoxGeometry( 1, 1, 1 );
        var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        var cube = new THREE.Mesh( geometry, material );
        scene.add( cube );


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