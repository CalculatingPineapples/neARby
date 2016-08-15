import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableHighlight,
  Image,
  Switch,
  Slider,
  Text,
  DeviceEventEmitter //DeviceEventEmitter is imported for geolocation update
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FBSDK, { LoginButton, AccessToken, GraphRequest, GraphRequestManager } from 'react-native-fbsdk';
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
import Compass from './Compass';

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
class Main extends Component {
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
      lastAPICallPosition: null,
      initialHeading: null,
      initialPosition: null,
      currentPosition: null,
      currentHeading: null,
      sliderValue: 1,
      sampleSwitch: false,
      username: '',
      drawerItem: 'Search',
      deltaX: 0,
      deltaZ: 0,
      totalAPICalls: 0,
      intializing: true,
      places: []
    };
  }

  componentWillMount() {
    console.log(Object.keys(Actions));
    const infoRequest = new GraphRequest(
      '/me?fields=name,picture',
      null,
      this.getUserInfo.bind(this)
    );
    // Start the graph request.
    new GraphRequestManager().addRequest(infoRequest).start();
  }

  componentDidMount() {
    // this.props.action.setUser('meesh', 'no pic');
    // console.log(this.props.places, ' PLACES');
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

  getUserInfo(err, data) {
    if (err) {
      console.log('ERR ', err);
    } else {
      this.setState({username: data.name,
        picture: data.picture.data.url});
      console.log('DATA - ', data.name + ' ' + data.picture.data.url);
    }
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
    resetCamera = () => {
      webviewbridge.sendToBridge(JSON.stringify({type: 'cameraPosition', deltaX: 0, deltaZ: 0}));
    };

    setHeadingToZero = () => {
      webviewbridge.sendToBridge(JSON.stringify({type: 'currentHeading', heading: 0}));
    };

    setCurrentHeading = () => {
      webviewbridge.sendToBridge(JSON.stringify({type: 'currentHeading', heading: this.state.currentHeading}));
    };

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

        //testing
        // var currentSpot = {name: 'hr', latitude: 37.783643, longitude: -122.409053};
        // var spots = [
        //   {name: 'turk', latitude : 37.783339, longitude: -122.409257},
        //   {name: 'aws', latitude: 37.783344, longitude: -122.408677},
        //   {name: 'new delhi', latitude: 37.784198,longitude: -122.409004},
        //   {name: 'Hotel Metropolis', latitude: 37.783465, longitude: -122.409495}
        // ];

        // // lat: -24.237262903280765
        // // lon:-33.71766798119452

        // var dummyPlaces = spots.map((spot) => {
        //   let position = calculateDistance(currentSpot, spot);
        //   position.name = spot.name;
        //   position.lat = position.deltaX;
        //   position.lon = position.deltaZ;
        //   position.distance = position.distance * 3.28084;
        //   return position;
        //   }
        // );

        // console.log('dummyPlaces', dummyPlaces);
        // var places = {type: 'places', places: dummyPlaces};
        // webviewbridge.sendToBridge(JSON.stringify(places));
        // this.setState({places: dummyPlaces});
        // //testing
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

  closeControlPanel = () => {
    this._drawer.close();
  }
  openControlPanel = () => {
    this._drawer.open();
  }

  handleSignout = () => {
    this.props.navigator.resetTo({name: 'Login'});
  }

  handleDrawer = (e) => {
    e.preventDefault();
    this.props.action.drawerState('Places');
    console.log(this, 'mew');
  }

  renderSliderValue = () => {
    // if slidervalue is one return today
    const weekdays = {
      0: 'Sunday',
      1: 'Monday',
      2: 'Tuesday',
      3: 'Wednesday',
      4: 'Thursday',
      5: 'Friday',
      6: 'Saturday',
      7: 'Sunday',
      8: 'Monday',
      9: 'Tuesday',
      10: 'Wednesday',
      11: 'Thursday',
      12: 'Friday',
      13: 'Saturday'
    };
    let d = new Date();
    let dayOfWeek = d.getDay();

    if (this.state.sliderValue === 1) {
      return 'today';
    } else {
      return 'between today and ' + weekdays[dayOfWeek + this.state.sliderValue - 1];
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
        <TouchableHighlight onPress={() => {controlThreeJSCamera(.2, 0)} }>
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

  render() {
    let drawerItems;
    console.log(this.props.drawer);
    if (this.state.drawerItem === 'Search') {
        drawerItems = <View style={styles.panel}>
        <Text style={styles.heading}>search</Text>
          <TouchableHighlight style={styles.placeOrEventButton} onPress={() => { this.setState({drawerItem: 'Places'}); }}>
            <Text style={styles.buttonText}>places</Text>
          </TouchableHighlight>
          <TouchableHighlight style={styles.placeOrEventButton} onPress={() => { this.setState({drawerItem: 'Events'}); }}>
            <Text style={styles.buttonText}>events</Text>
          </TouchableHighlight>
        </View>
    } else if (this.state.drawerItem === 'Events') {
      drawerItems = <View style={styles.panel}>
      <Text style={styles.heading}>events</Text>

        <Text style={styles.subheading}>I want events happening ...</Text>
        <Text style={styles.text}>{this.renderSliderValue()}</Text>
        <Slider
          {...this.props}
          onValueChange={(value) => this.setState({sliderValue: value})}
          minimumValue={1}
          maximumValue={7}
          step={1} />
        <Text style={styles.subheading}>Event Type</Text>
      <View style={styles.switchTable}>
        <View style={styles.switchColumn}>
          <View style={styles.switch}>
            <Switch
            onValueChange={(value) => this.setState({sampleSwitch: value})}
            value={this.state.sampleSwitch} />
            <Text style={styles.switchText}>Business</Text>
            </View>
          <View style={styles.switch}>
            <Switch
            onValueChange={(value) => this.setState({sampleSwitch: value})}
            value={this.state.sampleSwitch} />
            <Text style={styles.switchText}>Family</Text>
          </View>
          <View style={styles.switch}>
            <Switch
            onValueChange={(value) => this.setState({sampleSwitch: value})}
            value={this.state.sampleSwitch} />
            <Text style={styles.switchText}>Comedy</Text>
            </View>
          <View style={styles.switch}>
            <Switch
            onValueChange={(value) => this.setState({sampleSwitch: value})}
            value={this.state.sampleSwitch} />
            <Text style={styles.switchText}>Festivals</Text>
          </View>
          <View style={styles.switch}>
            <Switch
            onValueChange={(value) => this.setState({sampleSwitch: value})}
            value={this.state.sampleSwitch} />
            <Text style={styles.switchText}>Sports</Text>
          </View>
        </View>
        <View style={styles.switchColumn}>
          <View style={styles.switch}>
            <Switch
            onValueChange={(value) => this.setState({sampleSwitch: value})}
            value={this.state.sampleSwitch} />
            <Text style={styles.switchText}>Music</Text>
            </View>
          <View style={styles.switch}>
            <Switch
            onValueChange={(value) => this.setState({sampleSwitch: value})}
            value={this.state.sampleSwitch} />
            <Text style={styles.switchText}>Social</Text>
          </View>
          <View style={styles.switch}>
            <Switch
            onValueChange={(value) => this.setState({sampleSwitch: value})}
            value={this.state.sampleSwitch} />
            <Text style={styles.switchText}>Film</Text>
            </View>
          <View style={styles.switch}>
            <Switch
            onValueChange={(value) => this.setState({sampleSwitch: value})}
            value={this.state.sampleSwitch} />
            <Text style={styles.switchText}>Art</Text>
          </View>
          <View style={styles.switch}>
            <Switch
            onValueChange={(value) => this.setState({sampleSwitch: value})}
            value={this.state.sampleSwitch} />
            <Text style={styles.switchText}>Sci/Tech</Text>
          </View>
        </View>
        </View>
        <TouchableHighlight style={styles.placeOrEventButton} onPress={() => { this._drawer.close(); this.setState({drawerItem: 'Search'}); }}>
          <Text style={styles.buttonText}>submit</Text>
        </TouchableHighlight>
        </View>
    } else if (this.state.drawerItem === 'Places') {
        drawerItems = <View style={styles.panel}>
      <Text style={styles.heading}>places</Text>
        <TextInput style={styles.textInput} placeholder='Search Places'></TextInput>
        <Text style={styles.subheading}>Place Type</Text>
      <View style={styles.switchTable}>
        <View style={styles.switchColumn}>
          <View style={styles.switch}>
            <Switch
            onValueChange={(value) => this.setState({sampleSwitch: value})}
            value={this.state.sampleSwitch} />
            <Text style={styles.switchText}>Business</Text>
            </View>
          <View style={styles.switch}>
            <Switch
            onValueChange={(value) => this.setState({sampleSwitch: value})}
            value={this.state.sampleSwitch} />
            <Text style={styles.switchText}>Family</Text>
          </View>
          <View style={styles.switch}>
            <Switch
            onValueChange={(value) => this.setState({sampleSwitch: value})}
            value={this.state.sampleSwitch} />
            <Text style={styles.switchText}>Comedy</Text>
            </View>
          <View style={styles.switch}>
            <Switch
            onValueChange={(value) => this.setState({sampleSwitch: value})}
            value={this.state.sampleSwitch} />
            <Text style={styles.switchText}>Festivals</Text>
          </View>
          <View style={styles.switch}>
            <Switch
            onValueChange={(value) => this.setState({sampleSwitch: value})}
            value={this.state.sampleSwitch} />
            <Text style={styles.switchText}>Sports</Text>
          </View>
        </View>
        <View style={styles.switchColumn}>
          <View style={styles.switch}>
            <Switch
            onValueChange={(value) => this.setState({sampleSwitch: value})}
            value={this.state.sampleSwitch} />
            <Text style={styles.switchText}>Music</Text>
            </View>
          <View style={styles.switch}>
            <Switch
            onValueChange={(value) => this.setState({sampleSwitch: value})}
            value={this.state.sampleSwitch} />
            <Text style={styles.switchText}>Social</Text>
          </View>
          <View style={styles.switch}>
            <Switch
            onValueChange={(value) => this.setState({sampleSwitch: value})}
            value={this.state.sampleSwitch} />
            <Text style={styles.switchText}>Film</Text>
            </View>
          <View style={styles.switch}>
            <Switch
            onValueChange={(value) => this.setState({sampleSwitch: value})}
            value={this.state.sampleSwitch} />
            <Text style={styles.switchText}>Art</Text>
          </View>
          <View style={styles.switch}>
            <Switch
            onValueChange={(value) => this.setState({sampleSwitch: value})}
            value={this.state.sampleSwitch} />
            <Text style={styles.switchText}>Sci/Tech</Text>
          </View>
        </View>
        </View>
        <TouchableHighlight style={styles.placeOrEventButton} onPress={() => { this._drawer.close(); this.setState({drawerItem: 'Search'}); }}>
          <Text style={styles.buttonText}>submit</Text>
        </TouchableHighlight>
        </View>
    } else {
      drawerItems = <View style={styles.panel}>
      <Text style={styles.heading}>search</Text>
        <TouchableHighlight style={styles.placeOrEventButton} onPress={() => { this.handleDrawer.bind(this); }}>
          <Text style={styles.buttonText}>places</Text>
        </TouchableHighlight>
        <TouchableHighlight style={styles.placeOrEventButton} onPress={() => { console.log('wtf 2.0'); }}>
          <Text style={styles.buttonText}>events</Text>
        </TouchableHighlight>
      </View>
    }

    return (
      <Drawer
        type="overlay"
        ref={(ref) => this._drawer = ref}
        content={drawerItems}
        acceptPan={true}
        panOpenMask={0.5}
        panCloseMask={0.5}
        tweenHandler={(ratio) => ({main: { opacity:(3-ratio)/3 }})}>
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
              <TouchableHighlight style={styles.menu} onPress={() => {this._drawer.open()}}>
                <View style={styles.button}>
                  <Image style={styles.search} source={require('../assets/search.png')}/>
                </View>
              </TouchableHighlight>
              <Compass style={styles.compass} rotation={this.state.currentHeading} places={this.state.places} currentLocation={{deltaX: this.state.deltaX, deltaZ: this.state.deltaZ}}/>
            </View>
            </WebViewBridge>
          </Camera>
        </View>
        {/* this.renderDebug() */}
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
  buttonText: {
    color: '#FFF',
    fontSize: 40,
    fontFamily: 'AvenirNext-Regular',
    textAlign: 'center'
  },
  drawerStyles: {
      flex: 1,
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
    padding: 20,
    // paddingBottom: 30,
    flex: 1
  },
  subheading: {
    fontSize: 20,
    fontFamily: 'AvenirNext-Medium',
    textAlign: 'center',
    padding: 10
  },
  heading: {
    fontSize: 60,
    fontFamily: 'AvenirNext-Medium',
    textAlign: 'center',
    padding: 10
  },
  image: {
    flex: 1
  },
  search: {
    height: 25,
    width: 25
  },
  placeOrEventButton: {
    backgroundColor: '#009D9D',
    padding: 10,
    paddingLeft: 60,
    paddingRight: 60,
    margin: 15,
    borderRadius: 3,
    borderColor: '#000'
  },
  text: {
    fontSize: 18,
    fontFamily: 'AvenirNext-Regular',
    textAlign: 'center',
    padding: 10
  },
  switch: {
    flex: 1,
    flexDirection: 'row'
  },
  switchText: {
    fontSize: 18,
    fontFamily: 'AvenirNext-Regular',
    marginLeft: 5
  },
  switchColumn: {
    flex: 1,
    flexDirection: 'column'
  },
  switchTable: {
    flex: 1,
    flexDirection: 'row'
  },
  textInput: {
    padding: 20,
    fontSize: 18,
    fontFamily: 'AvenirNext-Regular',
    backgroundColor: '#FFF',
    marginTop: 15,
    marginBottom: 15
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
    // places: state.places,
    // user: state.user
    drawer: state.drawer.option
  };
};

const mapDispatchToProps = function(dispatch) {
  console.log('map dispatch to props is called');
  return { action: bindActionCreators(Actions, dispatch) };
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
