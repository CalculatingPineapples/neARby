import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  TouchableHighlight,
  Image,
  Text,
  DeviceEventEmitter //DeviceEventEmitter is imported for geolocation update
} from 'react-native';

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
import Compass from '../components/Compass';
console.log('Location', Location);

//webviewbrige variables
var resetCamera;
var addCubeToLocation;
var controlThreeJSCamera;
var setHeadingToZero;
var setHeading;
var setCurrentHeading;
var testHeading = 0;
var sendNewHeading = false;

//deltaX is change in latidue, north (+), south (-)
//deltaZ is change im latidue, east(+), west (-)
class ARview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //strings are for debugging only
      initialHeadingString: 'unknown',
      initialPositionString: 'unknown',
      currentPositionString: 'unknown',
      lastAPICallPositionString: 'unknown',
      distanceFromLastAPICallString: 'unknown',
      currentHeadingString: 'unknown',
      //strings are for debugging only

      lastAPICallPosition: null,
      initialHeading: null,
      initialPosition: null,
      currentPosition: null,
      currentHeading: null,
      deltaX: 0,
      deltaZ: 0,
      totalAPICalls: 0,
      intializing: true,
      places: []
    };
  }

  componentWillReceiveProps(nextProps) {
    console.log('nextProps.testState', this.props.testState);
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

  sendOrientation(callback, intialize) {
    //heading is the orientation of device relative to true north
    Location.startUpdatingHeading();
    this.getHeading = DeviceEventEmitter.addListener(
      'headingUpdated',
      (data) => {

        if (intialize) {
          this.setState({
            initialHeadingString: JSON.stringify(data),
            initialHeading: data.heading
          });
        } else {
          this.setState({
            currentHeadingString: JSON.stringify(data),
            currentHeading: data.heading
          });
        }
        callback(data.heading);
      }
    );
  }

  //initGeolocation gets the initial geolocation and set it to initialPosition state
  initGeolocation(initialCameraAngleCallback) {
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

      //initial call to server
      let positionObj = {
        latitude: this.state.initialPosition.latitude,
        longitude: this.state.initialPosition.longitude,
        threejsLat: 0,
        threejsLon: 0
      };
      this.props.action.fetchPlaces(positionObj);

      initialCameraAngleCallback();
    }, 2000);
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
          console.log('update deltaX, deltaZ', {deltaX: deltaX, deltaZ: deltaZ});
          this.setState({deltaX: deltaX, deltaZ: deltaZ});
        };

        this.setState({
          currentPositionString: JSON.stringify(location),
          currentPosition: location.coords
        });

        if (!this.state.lastAPICallPosition || placesCallback) {
          let distanceFromLastAPICallPosition = 0;
          if (this.state.lastAPICallPosition) {
            distanceFromLastAPICallPosition = calculateDistance(this.state.lastAPICallPosition, location.coords, null, (deltaX, deltaZ, distance) => {this.setState({distanceFromLastAPICallString: distance.toString()})} );
          }

          if (!this.state.lastAPICallPosition || distanceFromLastAPICallPosition.distance > 20) {
            //update the lastAPICallPosition to current position
            this.setState({
              lastAPICallPositionString: JSON.stringify(location),
              lastAPICallPosition: location.coords,
              totalAPICalls: this.state.totalAPICalls += 1
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

    //////////////////////////
    //react buttons handlers
    //////////////////////////
    addCubeToLocation = (location) => {
      let cubeLocation = calculateDistance(this.state.initialPosition, location);
      // let cubeLocation = { deltaX: 5, deltaZ: 0 };
      cubeLocation.type = 'addTestCube';
      webviewbridge.sendToBridge(JSON.stringify(cubeLocation));
    };

    ///////////////////////////////////////////////
    //test buttons handlers, for dev purpose only
    ///////////////////////////////////////////////
    //for dev purpose only, resets threejs camera back to 0,0
    setHeading = (heading) => {
      webviewbridge.sendToBridge(JSON.stringify({type: 'currentHeading', heading: heading}));
    };

    //this is fired when direction buttons are click
    controlThreeJSCamera = (x, z) => {
      webviewbridge.sendToBridge(JSON.stringify({type: 'cameraPosition', deltaX: this.state.deltaX + x, deltaZ: this.state.deltaZ + z}));
      this.setState({
        deltaX: this.state.deltaX + x,
        deltaZ: this.state.deltaZ + z
      });
    };

    //////////////////////////////////////
    //webviewBridge communication helpers
    //////////////////////////////////////
    let setInitialCameraAngle = () => {
      this.sendOrientation(
        (initialHeading) => {
          console.log('initialHeading', initialHeading);
          webviewbridge.sendToBridge(JSON.stringify({type: 'initialHeading', heading: initialHeading}));
          this.getHeading.remove();
        }, true
      );
    };

    let calibrateCameraAngle = (heading) => {
      // console.log('calibrate ThreeJSCamera');
      if (sendNewHeading) {
        webviewbridge.sendToBridge(JSON.stringify({type: 'currentHeading', heading: heading}));
        sendNewHeading = false;
      }
    };

    let updateThreeJSCameraPosition = (newCameraPosition) => {
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
        // var testPlace = {name: "Queen's Beauty House", lat: 575.9204482645928, lon: -292.71292376910134, distance: 2119, img: "https://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png"};
        // let places = {type: 'places', places: [testPlace]};

        let places = {type: 'places', places: results.payload.slice(0,10)};
        console.log('sending places to webview', places);
        webviewbridge.sendToBridge(JSON.stringify(places));
        this.setState({places: results.payload});
      })
      .catch((err) => {
        console.log(err);
      });
    };

    message = JSON.parse(message);
    //webview will send 'webview is loaded' back when the injectedScript is loaded
    if (message === 'webview is loaded') {
      this.startDeviceLocationUpdate();
      //once bridge injectedScript is loaded, set 0,0, and send over heading to orient threejs camera
      this.initGeolocation(setInitialCameraAngle);
    } else if (message === 'heading received') {
      // console.log('heading received');
      //at this point, the app is finish loading
      this.setState({initialize: false});
      //if distance exceed a certain treashold, updatePlaces will be called to fetch new locations
      this.watchGeolocation(updateThreeJSCameraPosition, updatePlaces);
      //calibrate threejs camera according to north every 5 seconds
      setInterval(() => { sendNewHeading = true; }, 5000);
      this.sendOrientation(calibrateCameraAngle);
    } else {
      console.log(message);
    }

  }

  renderDebug() {
    return (
      <View>
        <TouchableHighlight onPress={resetCamera}>
          <Text>reset to 0, 0</Text>
        </TouchableHighlight>
        <Text>
          <Text style={styles.title}>Current position: </Text>
          {this.state.currentPositionString}
        </Text>
        <TouchableHighlight onPress={() => { addCubeToLocation({latitude: this.state.currentPosition.latitude, longitude: this.state.currentPosition.longitude})} }>
          <Text>add cube here</Text>
        </TouchableHighlight>
        <Text>
          <Text style={styles.title}>Current heading: </Text>
          {this.state.currentHeading}
          <Text style={styles.title}>test heading: </Text>
          {testHeading}
        </Text>
        <Text>
          <Text style={styles.title}>DeltaX from 0,0: </Text>
          {this.state.deltaX}
        </Text>
        <Text>
          <Text style={styles.title}>DeltaZ from 0,0: </Text>
          {this.state.deltaZ}
        </Text>
        <Text>
          <Text style={styles.title}>Distance from last API call: </Text>
          {this.state.distanceFromLastAPICallString}
        </Text>
        <Text>
          <Text style={styles.title}>Total API calls: </Text>
          {this.state.totalAPICalls}
        </Text>
        <TouchableHighlight onPress={() => {controlThreeJSCamera(0.2, 0)} }>
          <Text>go front</Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={() => {controlThreeJSCamera(-.2, 0)} }>
          <Text>go back</Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={() => {controlThreeJSCamera(0, -.2)} }>
          <Text>go left</Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={() => {controlThreeJSCamera(0, .2)} }>
          <Text>go right</Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={() => {setHeadingToZero()}}>
          <Text>set heading to 0</Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={() => {setCurrentHeading()}}>
          <Text>set heading to currentHeading</Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={() => {testHeading += 1; setHeading(testHeading)}}>
          <Text>add heading</Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={() => {testHeading -= 1; setHeading(testHeading)}}>
          <Text>reduce heading</Text>
        </TouchableHighlight>
      </View>
    );
  }

  incrementDeltaX() {
    setInterval(() => { this.setState({deltaX: this.state.deltaX += 1}) }, 500);
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
            style={{backgroundColor: 'transparent'}}>
            <View style={{flex: 1, flexDirection: 'row'}}>
              <TouchableHighlight style={styles.menu} onPress={this.props.pressSearch}>
                <View style={styles.button}>
                  <Image style={styles.search} source={require('../assets/search.png')}/>
                </View>
              </TouchableHighlight>
              <TouchableHighlight style={styles.menu} onPress={this.props.pressProfile}>
                <View style={styles.button}>
                  <Image style={styles.search} source={require('../assets/profile.png')}/>
                </View>
              </TouchableHighlight>
              <Compass style={styles.compass} rotation={this.state.currentHeading} places={this.state.places.slice(0,10)} currentLocation={{deltaX: this.state.deltaX, deltaZ: this.state.deltaZ}}/>
            </View>
          </WebViewBridge>
        </Camera>
        {/* this.renderDebug() */}
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
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-end'
  },
  menu: {
    padding: 10
  },
  button: {
    backgroundColor: 'rgba(0,0,0,0)',
    borderColor: '#FFF',
    borderWidth: 2,
    borderRadius: 30,
    height: 60,
    width: 60,
    alignItems: 'center',
    justifyContent: 'center'
  },
  search: {
    height: 25,
    width: 25
  },
  compass: {
    width: 150,
    height: 150,
    justifyContent: 'flex-end',
  }
});

const mapStateToProps = function(state) {
  console.log('map state to props is called, this is state: ', state);
  return {
    places: state.places,
    testState: state.testState
  };
};

const mapDispatchToProps = function(dispatch) {
  console.log('map dispatch to props is called');
  return { action: bindActionCreators(Actions, dispatch) };
};

export default connect(mapStateToProps, mapDispatchToProps)(ARview);