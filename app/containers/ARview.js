import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
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
    // console.log('nextProps.placeUpdate', nextProps.placeUpdate);
    if (!nextProps.ARImageMode && this.sendPlacesToWebView && nextProps.placeUpdate) {
      this.sendPlacesToWebView(nextProps.places);
      this.props.action.resetPlaceUpdate();
    }

    if (!nextProps.insideARImageMode && this.activateARImageMode && nextProps.ARImageMode) {
      // console.log('nextProps.insideARImageMode');
      if (Array.isArray(nextProps.focalPlace.img)) {
        this.activateARImageMode(nextProps.focalPlace.img);
      } else {
        this.activateARImageMode(nextProps.photos);
      }
      this.props.action.insideARImageMode(true);
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

      .catch((err) => {
        //implement error message
        setTimeout(() => {this.props.action.fetchPlaces(positionObj)}, 3000);
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

            // console.log('range reached');
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
      webviewbridge.sendToBridge(JSON.stringify({type: 'currentHeading', heading: heading}));
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
      };

      //if there are searches for events for places, keep fetching those searches
      if (this.props.searchMode === 'none') {
        // console.log('rangereached fetch');
        this.props.action.fetchPlaces(positionObj)
      } else if (this.props.searchMode === 'places') {
        // console.log('rangereached places fetch');
        this.props.action.placeQuery(this.props.placeQuery)
      } else if (this.props.searchMode === 'events') {
        // console.log('rangereached places fetch');
        var clone = Object.assign({}, this.props.eventQuery);
        clone.latitude = this.props.currentPosition.latitude;
        clone.longitude = this.props.currentPosition.longitude;
        this.props.action.eventQuery(clone);
      }
    };

    this.activateARImageMode = (images) => {
      let imageMsg = {type: 'images', images: images};
      webviewbridge.sendToBridge(JSON.stringify(imageMsg));
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
      this.sendOrientation(this.calibrateCameraAngle);
    } else if (message.type === 'click') {
        // console.log('openPreviewopenPreview', this.props.places, message.key, this.props.places[message.key]);
      if (this.props.places[message.key].type && (this.props.places[message.key].type === 'userPlace' || this.props.places[message.key].type === 'userEvent')) {
        this.props.action.openPreview(this.props.places[message.key]);
      } else {
        // console.log('imageQueryimageQuery');
        this.props.action.imageQuery(this.props.places[message.key])
        .then((results) => {
          // console.log('results', results);
          this.props.action.openPreview(this.props.places[message.key]);
        });
      }
    } else {
      console.log(message);
    }

  }

  exitARImageMode() {
    // console.log('exitARImageMode');
    this.props.action.switchARImageMode(false);
    this.props.action.insideARImageMode(false);
    this.props.action.openPreview(this.props.focalPlace);

    let positionObj = {
      latitude: this.props.currentPosition.latitude,
      longitude: this.props.currentPosition.longitude,
      threejsLat: this.props.threejsLat,
      threejsLon: this.props.threejsLon
    };


    this.props.action.fetchPlaces(positionObj)
  }

  renderARImageModeCloseBtn() {
    if (this.props.ARImageMode === true) {
      return (
        <View style={{flex:1, flexDirection:'row'}}>
          <TouchableOpacity style={{alignItems: 'center', justifyContent: 'center'}} onPress={() => {this.exitARImageMode();}}>
            <View style={styles.button}>
              <Image style={styles.objectButton} source={require('../assets/close_white.png')}/>
            </View>
          </TouchableOpacity>
        </View>
      );
    }
    return;
  }

  renderCompass() {
    if (!this.props.ARImageMode) {
      return (
        <Compass style={styles.compass} rotation={this.state.currentHeading} places={this.props.places} currentLocation={{threeLat: this.props.threeLat, threeLon: this.props.threeLon}}/>
      );
    }
    return;
  }
  renderButtons() {
    return (
      <View style={{flex: 1, flexDirection: 'column', justifyContent: 'flex-start'}}>
        <TouchableOpacity style={styles.menu} onPress={this.props.pressSearch}>
          <View style={styles.button}>
            <Image style={styles.search} source={require('../assets/search.png')}/>
          </View>
        </TouchableOpacity>
        <TouchableHighlight style={styles.menu} onPress={this.props.pressList}>
          <View style={styles.button}>
            <Image style={styles.search} source={require('../assets/link.png')}/>
          </View>
        </TouchableHighlight>
        <TouchableHighlight style={styles.menu} onPress={this.props.pressCreate}>
          <View style={styles.button}>
            <Image style={styles.objectButton} source={require('../assets/plus.png')}/>
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
            style={{backgroundColor: 'transparent', flex: 1, flexDirection: 'row', alignItems: 'flex-end'}}>
            <View>{this.renderButtons()}</View>
            <View style={{flex: 1, justifyContent: 'center', paddingLeft: 95, paddingTop: 80}}>
              {this.renderCompass()}
            </View>
          {this.renderARImageModeCloseBtn()}
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

    ARImageMode: state.detail.ARImageMode,
    insideARImageMode: state.detail.insideARImageMode,
    focalPlace: state.detail.focalPlace,
    photos: state.photos.photos,

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
