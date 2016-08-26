import FBSDK, { LoginButton, AccessToken } from 'react-native-fbsdk';
import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image
} from 'react-native';
import WebViewBridge from 'react-native-webview-bridge';

let html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset=utf-8>
    <title>My first Three.js app</title>
    <style>
      body { margin: 0; }
      canvas { width: 100%; height: 100% }
    </style>
  </head>
  <body>
      <style>
       body {
         margin: 0px;
         overflow: hidden;
         background-color: transparent;
       }
      </style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r79/three.min.js"></script>
    <script>
    var line;
    var MAX_POINTS = 500;
    var drawCount;
    var value = 1;
    var delta = -0.01;


    function changeFaceColors() {
      if (value <= 0) {
        delta = 0.01;
      }
      else if(value >= 1) {
        delta = -0.01;
      }
      red.r = green.g = blue.b = value += delta;
      geometry.colorsNeedUpdate = true;
    }
      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

      renderer = new THREE.WebGLRenderer({
        // antialias: true,
        // alpha: true
      });
      // renderer.setClearColor(0xffffff, 0);
      renderer.setSize( window.innerWidth, window.innerHeight );
      document.body.appendChild( renderer.domElement );



  // material
  var material = new THREE.MeshBasicMaterial({
    color: 0x007979,
    vertexColors: THREE.FaceColors,
    wireframe: true
  });

  // geometry
  geometry = new THREE.BoxGeometry(2, 2, 2);

  // colors
  var randomColor = Math.floor(Math.random()*256);
  red = new THREE.Color(randomColor, randomColor, randomColor);
  green = new THREE.Color(randomColor, randomColor, randomColor);
  blue = new THREE.Color(randomColor, randomColor, randomColor);
  var colors = [red, green, blue];
  
  for (var i = 0; i < 3; i++) {
    geometry.faces[4 * i].color = colors[i];
    geometry.faces[4 * i + 1].color = colors[i];
    geometry.faces[4 * i + 2].color = colors[i];
    geometry.faces[4 * i + 3].color = colors[i];
  }

  // mesh
  box = new THREE.Mesh(geometry, material);
  scene.add(box);

      camera.position.z = 15;
      camera.position.y = -2;

      function render() {
        requestAnimationFrame( render );
          changeFaceColors();
          box.rotation.x += 0.05;
          box.rotation.y += 0.05;

        renderer.render( scene, camera );
      }
      render();

    </script>
  </body>
</html>`;

class Login extends Component {
  constructor(props) {
    super(props);
    // console.log(props);
  }

  componentWillMount () {
    // console.log(AccessToken);
    AccessToken.getCurrentAccessToken().then(
      (data) => {
        if (data) {
         this.goToHomePage();
        }
       }
    );
  }
  goToHomePage(accessToken) {
    this.props.navigator.replace({name: 'Main'});
  }

  render() {
    return (
      <Image style={{flex: 1}} source={{uri : 'http://i.imgur.com/0ViH0RN.gif'}}>
      <WebViewBridge
        ref="webviewbridge"
        source={{html}}
        style={styles.container}>
      <View style={styles.textContainer}>
      <Text style={styles.text}>ne</Text>
      <Text style={styles.textAR}>ar</Text>
      <Text style={styles.text}>by</Text>
      </View>
       <LoginButton
        readPermissions={['user_friends']}
        style={styles.button}
        onLoginFinished={
          (error, result) => {
            if (error) {
              alert("login has error: " + result.error);
            } else if (result.isCancelled) {
              alert("login is cancelled.");
            } else {
              AccessToken.getCurrentAccessToken().then(
                (data) => {
                  console.log(this, 'LOGIN');
                  this.goToHomePage();
                }
              );
            }
          }
        }
      />
      </WebViewBridge>
    </Image>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
    paddingTop: 250,
    backgroundColor: 'rgba(255,255,255,0.1)'
  },
  button: {
    backgroundColor: '#3B5998',
    height: 50,
    width: 100
  },
  textContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0)'
  },
  text: {
    fontSize: 60,
    color: 'white',
    fontFamily: 'AvenirNext-UltraLight',
  },
  textAR: {
    fontSize: 60,
    color: 'white',
    fontFamily: 'AvenirNext-Medium'
  }
});

export default Login;
