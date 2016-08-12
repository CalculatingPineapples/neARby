import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  TouchableHighlight,
  Text,
  DeviceEventEmitter //DeviceEventEmitter is imported for geolocation update
} from 'react-native';

import FBSDK, { LoginButton, AccessToken } from 'react-native-fbsdk';
import Drawer from 'react-native-drawer';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Actions from '../actions/index';
import Camera from 'react-native-camera';
import WebViewBridge from 'react-native-webview-bridge';
import { RNLocation as Location } from 'NativeModules';
import { calculateDistance } from '../lib/calculateDistance';
import html from '../webview/html';
//this script will be injected into WebViewBridge to communicate
import { injectScript } from '../webview/webviewBridgeScript';

var resetCamera;
class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initialHeadingString: 'unknown',
      initialPositionString: 'unknown',
      currentPositionString: 'unknown',
      lastAPICallPositionString: 'unknown',
      distanceFromLastAPICallString: 'unknown',
      currentHeadingString: 'unknown',
      lastAPICallPosition: null,
      initialHeading: null,
      initialPosition: null,
      currentPosition: null,
      currentHeading: null,
      deltaX: null,
      deltaZ: null,
    };
  }

  componentDidMount() {
    this.props.action.setUser('meesh', 'no pic');
    console.log(this.props.places, ' PLACES');
  }
  componentWillUnmount() {
    //this will stop the location update
    Location.stopUpdatingLocation();
    Location.stopUpdatingHeading();
  }

  startDeviceLocationUpdate() {
    Location.requestAlwaysAuthorization();
    Location.setDesiredAccuracy(1);
    Location.setDistanceFilter(1);
  }

  initOrientation(callback) {
    //heading is the orientation of device relative to true north
    Location.startUpdatingHeading();
    this.getInitialHeading = DeviceEventEmitter.addListener(
      'headingUpdated',
      (data) => {

        this.setState({
          initialHeadingString: JSON.stringify(data),
          initialHeading: data.heading
        });
        callback(data.heading);
      }
    );
  }

  watchOrientation(callback) {
    Location.startUpdatingHeading();
    this.getInitialHeading = DeviceEventEmitter.addListener(
      'headingUpdated',
      (data) => {
        // console.log('got heading', data);
        this.setState({
          currentHeadingString: JSON.stringify(data),
          currentHeading: data.heading
        });

        callback(data.heading);
      }
    );
  }
  //initGeolocation gets the initial geolocation and set it to initialPosition state
  initGeolocation(cameraCallback, placesCallback) {
    Location.startUpdatingLocation();
    //this will listen to geolocation changes and update it in state
    this.getInitialLocation = DeviceEventEmitter.addListener(
      'locationUpdated',
      (location) => {
        console.log('initGeolocation', location);

        this.setState({
          initialPositionString: JSON.stringify(location),
          initialPosition: location.coords,
        });
      }
    );

    //wait 7 seconds to get a more accurate location reading, remove getInitialLocation listner after that
    setTimeout(() => {
      this.getInitialLocation.remove();
      this.watchGeolocation(cameraCallback, placesCallback);
    }, 5000);
  }

  //watchGeolocation will subsequenly track the geolocation changes and update it in lastPosition state
  watchGeolocation(cameraCallback, placesCallback) {
    Location.startUpdatingLocation();
    //this will listen to geolocation changes and update it in state
    DeviceEventEmitter.addListener(
      'locationUpdated',
      (location) => {
        console.log('location updated');
        //this displays the info on screen, only use for debugging
        let loggerCallback = (deltaX, deltaZ, distance) => {
          this.setState({deltaX: deltaX, deltaZ: deltaZ});
        };
        this.setState({
          currentPositionString: JSON.stringify(location),
          currentPosition: location.coords
        });

        if (!this.state.lastAPICallPosition) {
          this.setState({
            lastAPICallPositionString: JSON.stringify(location),
            lastAPICallPosition: location.coords
          });
          console.log('initial fetch places');
          placesCallback();
        }


        if (placesCallback) {
          let distanceFromLastAPICallPosition = calculateDistance(this.state.lastAPICallPosition, location.coords, null, (deltaX, deltaZ, distance) => {this.setState({distanceFromLastAPICallString: distance.toString()})} );
          //set range threshold to 10 meters
          if (distanceFromLastAPICallPosition.distance > 20) {
            //update the lastAPICallPosition to current position
            this.setState({
              lastAPICallPositionString: JSON.stringify(location),
              lastAPICallPosition: location.coords
            });
            console.log('range reached');
            placesCallback();

          }
        }

        if (cameraCallback) {
          calculateDistance(this.state.initialPosition, location.coords, cameraCallback, loggerCallback);
        }
      }
    );
  }

  //onBridgeMessage will be pass down to WebViewBridge to allow the native componenent to communicate to the webview;
  onBridgeMessage(message) {
    const { webviewbridge } = this.refs;

    //for dev purpose only, resets threejs camera back to 0,0
    resetCamera = () => {
      webviewbridge.sendToBridge(JSON.stringify({type: 'cameraPosition', deltaX: 0, deltaZ: 0}));
    };

    let updateThreeJSCamera = (newCameraPosition) => {
      webviewbridge.sendToBridge(JSON.stringify(newCameraPosition));
    };

    let updatePlaces = () => {
      //call fetchplaces to fetch places from server
      let positionObj = {
        latitude: this.state.currentPosition.latitude,
        longitude: this.state.currentPosition.longitude,
        threejsLat: this.state.deltaX || 0,
        threejsLon: this.state.deltaZ || 0
      };

      this.props.action.fetchPlaces(positionObj)
      .then((results) => {
        let places = {type: 'places', places: results.payload};
        console.log('sending places to webview', places);
        webviewbridge.sendToBridge(JSON.stringify(places));
      });

    };

    let updateCameraAngle = (heading) => {
      webviewbridge.sendToBridge(JSON.stringify({type: 'currentHeading', heading: heading}));
    };

    //webview will send 'webview is loaded' back when the injectedScript is loaded
    if (message === 'webview is loaded') {
      this.startDeviceLocationUpdate();

      //once bridge injectedScript is loaded, send over heading to orient threejs camera
      this.initOrientation.call(this,
        (initialHeading) => {
          console.log('initialHeading', initialHeading);
          webviewbridge.sendToBridge(JSON.stringify({type: 'initialHeading', heading: initialHeading}));
          this.getInitialHeading.remove();
        }
      );

    } else if (message === 'heading received') {
      //once threejs camera is oriented, send the camera position to webview,
      //if distance exceed a certain treashold, updatePlaces will be called to fetch new locations
      this.initGeolocation(updateThreeJSCamera, updatePlaces);
      this.watchOrientation(updateCameraAngle);
    } else {
      console.log(message);
    }

  }

  closeControlPanel = () => {
    this._drawer.close();
  }
  openControlPanel = () => {
    this._drawer.open();
  }

  handleSignout = () => {
    this.props.navigator.resetTo({name: 'signinView'});
  }

  render() {
    return (
      <Drawer
        type="overlay"
        ref={(ref) => this._drawer = ref}
        content={<View style={styles.panel}>
        <LoginButton
          publishPermissions={["publish_actions"]}
          onLogoutFinished={() => alert('User logged out')}/>
        </View>}
        acceptPan={true}
        panOpenMask={0.5}
        panCloseMask={0.5}
        tweenHandler={(ratio) => ({main: { opacity:(4-ratio)/4 }})}>
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
            style={{backgroundColor: 'transparent'}}>
            <TouchableHighlight style={styles.menu} onPress={() => {this._drawer.open()}}>
              <View style={styles.button}>
                <Text>MENU</Text>
              </View>
            </TouchableHighlight>
          </WebViewBridge>
        </Camera>
        <View>
          <TouchableHighlight onPress={resetCamera}>
            <Text>reset to 0, 0</Text>
          </TouchableHighlight>
          <Text>
            <Text style={styles.title}>Initial position: </Text>
            {this.state.initialPositionString}
          </Text>
          <Text>
            <Text style={styles.title}>Current position: </Text>
            {this.state.currentPositionString}
          </Text>
          <Text>
            <Text style={styles.title}>Last API call position: </Text>
            {this.state.lastAPICallPositionString}
          </Text>
          <Text>
            <Text style={styles.title}>Current heading: </Text>
            {this.state.currentHeading}
          </Text>
          <Text>
            <Text style={styles.title}>DeltaX from 0,0: </Text>
            {1 * this.state.deltaX}
          </Text>
          <Text>
            <Text style={styles.title}>DeltaZ from 0,0: </Text>
            {-1 * this.state.deltaZ}
          </Text>
          <Text>
            <Text style={styles.title}>Distance from last API call: </Text>
            {this.state.distanceFromLastAPICallString}
          </Text>
        </View>
      </View>
      </Drawer>
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
  },
  menu: {
    padding: 10
  },
  button: {
    backgroundColor: '#FFF',
    height: 50,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center'
  },
  drawerStyles: {
      flex: 1,
      padding: 30,
      margin: 100,
      justifyContent: 'center',
      alignItems: 'center',
      shadowRadius: 3,
      backgroundColor: 'rgba(0,0,0,.5)'

  },
  panel: {
    backgroundColor: 'rgba(255,255,255,.9)',
    justifyContent: 'center',
    margin: 20,
    alignItems: 'flex-end',
    flexDirection: 'row',
    paddingBottom: 30,
    flex: 1
  },
  panelText: {
    fontSize: 20,
    fontWeight: 'bold'
  }
});


const mapStateToProps = function(state) {
  console.log('map state to props is called, this is state: ', state);
  return {
    places: state.places,
    user: state.user
  };
};

const mapDispatchToProps = function(dispatch) {
  console.log('map dispatch to props is called');
  return { action: bindActionCreators(Actions, dispatch) };
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
