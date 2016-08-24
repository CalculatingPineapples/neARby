import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  TouchableHighlight,
  Image,
  Text,
  DeviceEventEmitter //DeviceEventEmitter is imported for geolocation update
} from 'react-native';

import styles from '../styles/style';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Actions from '../actions/index';
import Camera from 'react-native-camera';
import WebViewBridge from 'react-native-webview-bridge';
import { RNLocation as Location } from 'NativeModules';
import { calculateDistance } from '../lib/calculateDistance';
import html from '../webview/html';

//this script will be injectScripted into WebViewBridge to communicate
import { injectScript } from '../webview/webviewBridgeScript';
import Compass from '../components/Compass';

//webviewbrige variables
var testHeading = 0;
var sendNewHeading = false;

//deltaX is change in latidue, north (+), south (-)
//deltaZ is change im latidue, east(+), west (-)
class ARcomponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //strings are for debugging only
      lastAPICallPositionString: 'unknown',
      distanceFromLastAPICallString: 'unknown',
      currentHeadingString: 'unknown',
      //strings are for debugging only

      currentHeading: null,
      lastAPICallPosition: null,
      totalAPICalls: 0,
      intializing: true,
    };
  }

  componentWillReceiveProps(nextProps) {
    //rerender places only when placeUpdate is true;
    if (this.sendPlacesToWebView && nextProps.placeUpdate) {
      this.sendPlacesToWebView(nextProps.places);
      this.props.action.resetPlaceUpdate();
    }
  }

  componentWillUnmount() {
    //this will stop the location update
    Location.stopUpdatingLocation();
    Location.stopUpdatingHeading();
  }

  startDeviceLocationUpdate() {
    Location.requestWhenInUseAuthorization();
    Location.setDesiredAccuracy(1);
    Location.setDistanceFilter(1);
  }

  sendOrientation(callback, intialize) {
    //heading is the orientation of device relative to true north
    Location.startUpdatingHeading();
    this.getHeading = DeviceEventEmitter.addListener(
      'headingUpdated',
      (data) => {

        this.setState({currentHeading: data.heading});
        
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
        this.props.action.updateInitLocation(location.coords);
      }
    );

    //wait 7 seconds to get a more accurate location reading, remove getInitialLocation listner after that
    setTimeout(() => {
      this.getInitialLocation.remove();

      //initial call to server to set initialPosition to 0,0
      let positionObj = {
        latitude: this.props.initialPosition.latitude,
        longitude: this.props.initialPosition.longitude,
        threejsLat: 0,
        threejsLon: 0
      };
      this.props.action.fetchPlaces(positionObj)
      .then(() => {this.props.action.userPlacesQuery(positionObj)})
      // .then((response) => {
      //   if (response.payload.length === 0) {
      //     setTimeout(() => {this.props.action.fetchPlaces(positionObj)}, 5000);
      //   }
      // })
      .catch((err) => {
        //implement error message
        setTimeout(() => {this.props.action.fetchPlaces(positionObj)
          .then(() => {this.props.action.userPlacesQuery(positionObj)})}, 5000);
      });

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
        let threeJSPosition = calculateDistance(this.props.initialPosition, location.coords);
        this.props.action.updateCurrentLocation({
          currentPosition: location.coords,
          threeLat: threeJSPosition.deltaX,
          threeLon: threeJSPosition.deltaZ,
          distance: threeJSPosition.distance
        });

        if (!this.state.lastAPICallPosition || placesCallback) {
          let distanceFromLastAPICallPosition = 0;
          if (this.state.lastAPICallPosition) {
            distanceFromLastAPICallPosition = calculateDistance(this.state.lastAPICallPosition, location.coords);
            // this.setState({distanceFromLastAPICallString: distanceFromLastAPICallPosition.distance.toString()});
          }

          if (!this.state.lastAPICallPosition || distanceFromLastAPICallPosition.distance > 20) {
            this.setState({
              lastAPICallPositionString: JSON.stringify(location),
              lastAPICallPosition: location.coords,
              totalAPICalls: this.state.totalAPICalls += 1
            });

            console.log('range reached');
            placesCallback(location.coords.latitude, location.coords.longitude, threeJSPosition.deltaX, threeJSPosition.deltaZ);
          }
        }

        if (cameraCallback) {
          cameraCallback(threeJSPosition);
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
    this.addCubeToLocation = (location) => {
      let cubeLocation = calculateDistance(this.props.initialPosition, location);
      cubeLocation.type = 'addUserObj';
      webviewbridge.sendToBridge(JSON.stringify(cubeLocation));
    };

    ///////////////////////////////////////////////
    //test buttons handlers, for dev purpose only
    ///////////////////////////////////////////////
    //for dev purpose only, resets threejs camera back to 0,0
    this.setHeading = (heading) => {
      webviewbridge.sendToBridge(JSON.stringify({type: 'currentHeading', heading: heading}));
    };

    //this is fired when direction buttons are click
    this.controlThreeJSCamera = (x, z) => {
      webviewbridge.sendToBridge(JSON.stringify({type: 'cameraPosition', deltaX: this.props.threeLat + x, deltaZ: this.props.threeLon + z}));
      this.props.action.updateCurrentLocation({
        currentPosition: this.props.currentPosition,
        threeLat: this.props.threeLat + x,
        threeLon: this.props.threeLon + z
      });
    };

    //////////////////////////////////////
    //webviewBridge communication helpers
    //////////////////////////////////////
    this.setInitialCameraAngle = () => {
      this.sendOrientation(
        (initialHeading) => {
          webviewbridge.sendToBridge(JSON.stringify({type: 'initialHeading', heading: initialHeading}));
          this.getHeading.remove();
        }, true
      );
    };

    //this will sent current heading to threejs to correct
    this.calibrateCameraAngle = (heading) => {
      if (sendNewHeading) {
        webviewbridge.sendToBridge(JSON.stringify({type: 'currentHeading', heading: heading}));
        sendNewHeading = false;
      }
    };

    this.updateThreeJSCameraPosition = (newCameraPosition) => {
      webviewbridge.sendToBridge(JSON.stringify(newCameraPosition));
    };

    this.sendPlacesToWebView = (places) => {
      let placesMsg = {type: 'places', places: places};
      webviewbridge.sendToBridge(JSON.stringify(placesMsg));
    };

    this.updatePlaces = (latitude, longitude, threejsLat, threejsLon) => {
      //call fetchplaces to fetch places from server
      let positionObj = {
        latitude: latitude,
        longitude: longitude,
        threejsLat: threejsLat || 0,
        threejsLon: threejsLon || 0
        //more filters
      };

      //if there are searches for events for places, keep fetching those searches
      if (this.props.searchMode === 'none') {
        this.props.action.fetchPlaces(positionObj)
        .then(this.props.action.userPlacesQuery(positionObj));
      } else if (this.props.searchMode === 'places') {
        this.props.action.placeQuery(this.props.placeQuery)
        .then(this.props.action.userPlacesQuery(this.props.placeQuery));
      } else if (this.props.searchMode === 'events') {
        this.props.action.eventQuery(this.props.eventQuery);
      }
    };

    message = JSON.parse(message);
    //webview will send 'webview is loaded' back when the injectedScript is loaded
    if (message === 'webview is loaded') {
      this.startDeviceLocationUpdate();
      //once bridge injectedScript is loaded, set 0,0, and send over heading to orient threejs camera
      this.initGeolocation(this.setInitialCameraAngle);
    } else if (message === 'heading received') {
      //at this point, the app is finish loading
      this.props.action.finishLoadingPosition(false);
      //if distance exceed a certain treashold, updatePlaces will be called to fetch new locations
      this.watchGeolocation(this.updateThreeJSCameraPosition, this.updatePlaces);
      //calibrate threejs camera according to north every 5 seconds
      setInterval(() => { sendNewHeading = true; }, 5000);
      this.sendOrientation(this.calibrateCameraAngle);
    } else if (message.type === 'click') {
      this.props.action.openPreview([message.key]);
      console.log('threeJS click', message.key, this.props.places[message.key]);
    } else {
      console.log(message);
    }

  }


  renderDebug() {
    return (
      <View>
        <Text>
          <Text style={styles.title}>Current position: </Text>
          {this.props.currentPositionString}
        </Text>
        <TouchableHighlight onPress={() => { this.addCubeToLocation({latitude: this.props.currentPosition.latitude, longitude: this.props.currentPosition.longitude})} }>
          <Text>add cube here</Text>
        </TouchableHighlight>
        <Text>
          <Text style={styles.title}>Current heading: </Text>
          {this.state.currentHeading}
        </Text>
        <Text>
          <Text style={styles.title}>threeLat from 0,0: </Text>
          {this.props.threeLat}
        </Text>
        <Text>
          <Text style={styles.title}>threeLon from 0,0: </Text>
          {this.props.threeLon}
        </Text>
        <Text>
          <Text style={styles.title}>Distance from last API call: </Text>
          {this.props.distanceFromLastAPICallString}
        </Text>
        <Text>
          <Text style={styles.title}>Total API calls: </Text>
          {this.props.totalAPICalls}
        </Text>
        <TouchableHighlight onPress={() => {this.controlThreeJSCamera(0.2, 0)} }>
          <Text>go front</Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={() => {this.controlThreeJSCamera(-.2, 0)} }>
          <Text>go back</Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={() => {this.controlThreeJSCamera(0, -.2)} }>
          <Text>go left</Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={() => {this.controlThreeJSCamera(0, .2)} }>
          <Text>go right</Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={() => {testHeading += 1; this.setHeading(testHeading)}}>
          <Text>add heading</Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={() => {testHeading -= 1; this.setHeading(testHeading)}}>
          <Text>reduce heading</Text>
        </TouchableHighlight>
      </View>
    );
  }

  renderButtons() {
    return (
      <View style={{flex: 1, flexDirection: 'column', justifyContent: 'flex-start'}}>
        <TouchableHighlight style={styles.menu} onPress={this.props.pressSearch}>
          <View style={styles.button}>
            <Image style={styles.search} source={require('../assets/search.png')}/>
          </View>
        </TouchableHighlight>
        <TouchableHighlight style={styles.menu} onPress={this.props.pressList}>
          <View style={styles.button}>
            <Image style={styles.search} source={require('../assets/link.png')}/>
          </View>
        </TouchableHighlight>
        <TouchableHighlight style={styles.menu} onPress={this.props.pressCreate}>
          <View style={styles.button}>
            <Image style={styles.objectButton} source={require('../assets/place.png')}/>
          </View>
        </TouchableHighlight>
        <TouchableHighlight style={styles.menu} onPress={this.props.pressProfile}>
          <View style={styles.button}>
            <Image style={styles.userimg} source={{uri: this.props.user.picture}}/>
          </View>
        </TouchableHighlight>
      </View>
    );
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
            source={{html: html, baseUrl:'web/'}}
            style={{backgroundColor: 'transparent', flex: 1, flexDirection: 'column', alignItems: 'flex-end'}}>
            <View>{this.renderButtons()}</View>
            <View style={{flex: 1, justifyContent: 'center'}}>
            <Compass style={styles.compass} rotation={this.state.currentHeading} places={this.props.places} currentLocation={{threeLat: this.props.threeLat, threeLon: this.props.threeLon}}/>
            </View>
          </WebViewBridge>
        </Camera>
        {/* this.renderDebug() */}
      </View>
    );
  }
}

const mapStateToProps = function(state) {
  return {
    drawer: state.drawer,
    user: state.user,
    places: state.places.places,
    placeUpdate: state.places.placeUpdate,
    searchMode: state.places.searchMode,
    placeQuery: state.places.placeQuery,
    eventQuery: state.places.eventQuery,

    initialPosition: state.Geolocation.initialPosition,
    currentPosition: state.Geolocation.currentPosition,
    threeLat: state.Geolocation.threeLat,
    threeLon: state.Geolocation.threeLon,
  };
};

const mapDispatchToProps = function(dispatch) {
  return { action: bindActionCreators(Actions, dispatch) };
};

export default connect(mapStateToProps, mapDispatchToProps)(ARcomponent);
