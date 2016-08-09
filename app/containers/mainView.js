import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  //DeviceEventEmitter is imported for geolocation update
  DeviceEventEmitter
} from 'react-native';

import Camera from 'react-native-camera';
import WebViewBridge from 'react-native-webview-bridge';
import { RNLocation as Location } from 'NativeModules';
import html from '../webview/html';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Actions from '../actions/index';

//this script will be injected into WebViewBridge to communicate
const injectScript = `
  (function () {
    if (WebViewBridge) {

      WebViewBridge.onMessage = function (message) {
        var message = JSON.parse(message);

        //set camera position
        if (message.type === "cameraPosition") {

          //sets threejs camera position as gps location changes
          camera.position.set( message.deltaX, 0, message.deltaZ );
          WebViewBridge.send("in WebViewBridge, got cameraPosition: " + JSON.stringify(message) + " this is the camera" + JSON.stringify(camera));
        
        } else if (message.type === "heading") {

          camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);
          camera.position.z = 5;

          var angle = message.heading * (Math.PI / 180);
          var vectorX = 10 * Math.cos(angle);
          var vectorZ = 10 * Math.sin(angle);
          var cameraTargetPt = new THREE.Vector3( vectorX, 0, vectorZ );
          camera.lookAt(cameraTargetPt);

          // camera.rotation.y = message.heading * (Math.PI / 180);
          
          controls = new THREE.DeviceOrientationControls( camera, true );
          // WebViewBridge.send("in WebViewBridge, heading received: " + JSON.stringify(message) + " this is the camera" + JSON.stringify(camera));
          animate();
          WebViewBridge.send("heading received");
        }
      };

      WebViewBridge.send("webview is loaded");
    }
  }());
`;

const calculateDistance = (coords1, coords2, callback, loggerCallback) => {
  //earth circumference in meters
  const earthCircumference = 40075000;
  //deltaX is change in east to west position, east is positive, west is negative
  //deltaZ is change in north to south position, north is positive, south is negative
  let deltaX = (coords2.longitude - coords1.longitude) / 360 * earthCircumference;
  let deltaZ = (coords2.latitude - coords1.latitude) / 360 * earthCircumference;
  console.log('deltaX, deltaZ', deltaX, deltaZ);

  //this callback is pass all the way down from initGeolocation;
  callback({ type: 'cameraPosition', deltaX: deltaX, deltaZ: deltaZ });

  //this is only for debugging purposes to show deltaX, deltaZ on screen, should remove later
  loggerCallback(deltaX, deltaZ);

  return {
    deltaX: deltaX,
    deltaZ: deltaZ
  };
};


// Actions.fetchPlaces();
class mainView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initialHeadingString: 'unknown',
      initialPositionString: 'unknown',
      currentPositionString: 'unknown',
      initialHeading: null,
      initialPosition: null,
      currentPosition: null,
      deltaX: null,
      deltaZ: null,
      watchID: null
    };
  }

  componentDidMount() {
    // this.props.action.fetchPlaces();
  }

  componentWillUnmount() {
    //this will stop the location update
    Location.stopUpdatingLocation();
  }

  startDeviceLocationUpdate() {
    Location.requestAlwaysAuthorization();
    Location.setDesiredAccuracy(1);
  }

  //grabs the initial orientation of device
  initOrientation(callback) {
    //heading is the orientation of device relative to true north
    Location.startUpdatingHeading();
    this.getInitialHeading = DeviceEventEmitter.addListener(
      'headingUpdated',
      (data) => {
        console.log('got heading', data);
        this.setState({
          initialHeadingString: JSON.stringify(data),
          initialHeading: data.heading
        });

        callback({type: 'heading', heading: data.heading});
      }
    );
  }

  //initGeolocation gets the initial geolocation and set it to initialPosition state
  initGeolocation(callback) {
    //this will listen to geolocation changes and update it in state
    Location.startUpdatingLocation();
    this.getInitialLocation = DeviceEventEmitter.addListener(
      'locationUpdated',
      (location) => {
        console.log('initGeolocation', location);

        this.setState({
          initialPositionString: JSON.stringify(location),
          initialPosition: location.coords
        });
      }
    );


    setTimeout(() => {
      this.getInitialLocation.remove();
      this.watchGeolocation(callback);
    }, 7000);
  }

  //watchGeolocation will subsequenly track the geolocation changes and update it in lastPosition state
  watchGeolocation(callback) {
    //Location.requestAlwaysAuthorization must be called before Location.startUpdatingLocation, both are functions from react-native-location
    Location.setDesiredAccuracy(1);
    Location.startUpdatingLocation();

    //this will listen to geolocation changes and update it in state
    DeviceEventEmitter.addListener(
      'locationUpdated',
      (location) => {
        console.log('location', location);

        this.setState({
          currentPositionString: JSON.stringify(location),
          currentPosition: location.coords
        });
        this.getCameraDisplacement(location.coords, callback);
      }
    );
  }

  getCameraDisplacement(currentPosition, callback) {
    console.log('this.state.initialPosition, this.state.currentPosition', this.state.initialPosition, currentPosition);
    let cameraDisplacement = calculateDistance(this.state.initialPosition, currentPosition, callback,
      (deltaX, deltaZ) => {
        this.setState({deltaX: deltaX, deltaZ: deltaZ});
      });
    return cameraDisplacement;
  }

  //onBridgeMessage will be pass down to WebViewBridge to allow the native componenent to communicate to the webview;
  onBridgeMessage(message) {
    const { webviewbridge } = this.refs;
    //webview will send 'webview is loaded' back when the injectedScript is loaded
    if (message === 'webview is loaded') {
      this.startDeviceLocationUpdate();

      //once bridge injectedScript is loaded, send over heading to orient threejs camera
      this.initOrientation.call(this,
        (initialHeading) => {
          console.log('initialHeading', initialHeading);
          webviewbridge.sendToBridge(JSON.stringify(initialHeading));
          this.getInitialHeading.remove();
        });

    } else if (message === 'heading received') {
      //once threejs camera is oriented, send the camera position to webview
      this.initGeolocation.call(this,
        (newPosition) => {
          webviewbridge.sendToBridge(JSON.stringify(newPosition));
        });
    } else {
      console.log(message);
    }

  }

  render() {
    return (
      <View style={{flex: 1}}>
        <Camera
          ref={(cam) => {
          this.camera = cam;
          }}
          style={styles.preview}
          aspect={Camera.constants.Aspect.fill}>
          <WebViewBridge
            ref="webviewbridge"
            onBridgeMessage={this.onBridgeMessage.bind(this)}
            injectedJavaScript={injectScript}
            source={{html}}
            style={{backgroundColor: 'transparent'}}
          />
        </Camera>
        <View>
          <Text>
            <Text style={styles.title}>Initial position: </Text>
            {this.state.initialPositionString}
          </Text>
          <Text>
            <Text style={styles.title}>Current position: </Text>
            {this.state.currentPositionString}
          </Text>
          <Text>
            <Text style={styles.title}>Current heading: </Text>
            {this.state.initialHeading}
          </Text>
          <Text>
            <Text style={styles.title}>DeltaX: </Text>
            {this.state.deltaX}
          </Text>
          <Text>
            <Text style={styles.title}>DeltaZ: </Text>
            {this.state.deltaZ}
          </Text>
        </View>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,1)'
  },
  preview: {
    flex: 1
  }
});

const mapStateToProps = function(state) {
  return {
    places: state.places.collection
  };
};

const mapDispatchToProps = function(dispatch) {
  return { action: bindActionCreators(Actions, dispatch) };
};

export default connect(mapStateToProps, mapDispatchToProps)(mainView);
