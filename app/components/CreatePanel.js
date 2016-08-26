import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Slider,
  ScrollView
} from 'react-native';

import ImagePicker from 'react-native-image-picker';
import styles from '../styles/style';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Actions from '../actions/index';
import uploadImage from '../lib/S3Upload';
import Promise from "bluebird";


//TODOs:
//add color selector for geometry and a color state, fix timestamp on event request obj
//implement edit view, which let user remove the obj
//show countdown on obj

class CreatePanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      createType: 'place',
      placeName: '',
      placeDescription: '',
      eventName: '',
      eventDescription: '',
      startTime: '',
      duration: '',
      placePics: [],
      eventPics: [],
    };
  }

  resetState() {
    this.setState({
      createType: 'place',
      placeName: '',
      placeDescription: '',
      eventName: '',
      eventDescription: '',
      startTime: '',
      duration: '',
      placePics: [],
      eventPics: [],
    });
  }

  handleSubmitPlace() {
    let obj = {
      name: this.state.placeName,
      description: this.state.placeDescription,
      latitude: this.props.currentPosition.latitude,
      longitude: this.props.currentPosition.longitude,
      lat: this.props.threeLat,
      lon: this.props.threeLon,
      distance: Math.floor(this.props.distance * 3.28084),
      username: this.props.username,
      userid: this.props.id,
      type: 'userPlace',
      upvotes: 0,
      downvotes: 0,
      voted: false,
      img: []
    };

    let uploadPromises = [];
    for (var i = 0; i < this.state.placePics.length; i++) {
      let source = this.state.placePics[i];
      uploadPromises.push(uploadImage(source.uri, 'places', source.fileSize));
    }

    Promise.all(uploadPromises)
    .then((results) => {
      // console.log('results', results);
      obj.img = results;
      this.props.action.addPlace(obj);
      this.resetState();
    });
    this.props.close();
  }

  handleSubmitEvent() {
    let obj = {
      name: this.state.eventName,
      description: this.state.eventDescription,
      latitude: this.props.currentPosition.latitude,
      longitude: this.props.currentPosition.longitude,
      startTime: this.props.startTime,
      username: this.props.username,
      userid: this.props.id,
      lat: this.props.threeLat,
      lon: this.props.threeLon,
      distance: Math.floor(this.props.distance * 3.28084),
      type: 'userEvent',
      upvotes: 0,
      downvotes: 0,
      voted: false,
      img: []
    };

    let uploadPromises = [];
    for (var i = 0; i < this.state.eventPics.length; i++) {
      let source = this.state.eventPics[i];
      uploadPromises.push(uploadImage(source.uri, 'events', source.fileSize));
    }

    Promise.all(uploadPromises)
    .then((results) => {
      // console.log('results', results);
      obj.img = results;
      this.props.action.addEvent(obj);
      this.resetState();
    });
    this.props.close();
  }

  startTimeSlider(value) {
    let timeNow = new Date();
    let hour = timeNow.getHours();
    let suffix = (hour > 12) ? 'PM' : 'AM';

    let eventStartTime = (value / 2 + hour) % 12;
    let eventStartHr = Math.floor(eventStartTime);
    let eventStartMinute = Math.floor((eventStartTime % 1) * 60);
    if (eventStartMinute === 0) {
      eventStartMinute = '00';
    }
    this.setState({
      startTime: eventStartHr + ':' + eventStartMinute + suffix
    });
  }

  switchType(type) {
    this.setState({createType: type});
  }

  pickImage() {
    var options = {
      title: 'select picture',
      storageOptions: {
        skipBackup: true,
        path: 'images'
      }
    };


    ImagePicker.showImagePicker(options, (response) => {
      // console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.chooseFromLibraryButtonTitle) {

      } else {
        const source = {uri: response.uri.replace('file://', ''), fileSize: response.fileSize, isStatic: true};
        // console.log('source', JSON.stringify(source));
        if (this.state.createType === 'place') {
          this.setState({
            placePics: this.state.placePics.concat([source])
          });
        } else {
          this.setState({
            eventPics: this.state.eventPics.concat([source])
          });
        }
      }
    });
  }

  renderForm() {
    if (this.state.createType === 'place') {
      return (
        <View>
          <Text style={styles.inputLable}>Place Name</Text>
          <TextInput style={styles.textInput}  onChangeText={(text) => this.setState({placeName: text})} value={this.state.placeName} placeholder="place name" />
          
          <Text style={styles.inputLable}>Place Description</Text>
          <TextInput style={styles.textInput}  onChangeText={(text) => this.setState({placeDescription: text})} value={this.state.placeDescription} placeholder="place description" />
            
            <ScrollView horizontal={true} style={{flexDirection: 'row'}}>
              <View style={{flexDirection: 'row'}}>
                {this.state.placePics.map(function(item, key) {
                  return (
                    <Image key={key} source={{uri: item.uri}} style={styles.imageUpload} />
                    );
                  })
                }
              </View>
            </ScrollView>

          <View style={styles.buttonContainer}>
          <TouchableHighlight style={styles.createButton} onPress={this.pickImage.bind(this)}>
            <Text style={styles.createButtonText}>upload picture</Text>
          </TouchableHighlight>
            <TouchableHighlight style={styles.createButton} onPress={() => { this.handleSubmitPlace(); }}>
              <Text style={styles.createButtonText}>add spot</Text>
            </TouchableHighlight>
          </View>
        </View>
      );

    } else if (this.state.createType === 'event') {
      return (
        <View>
          <Text style={styles.inputLable}>Event Name</Text>
          <TextInput style={styles.textInput}  onChangeText={(text) => this.setState({eventName: text})} value={this.state.eventName} placeholder="event name" />
          <Text style={styles.inputLable}>Event Description</Text>
          <TextInput style={styles.textInput}  onChangeText={(text) => this.setState({eventDescription: text})} value={this.state.eventDescription} placeholder="event description" />
          <Text style={styles.inputLable}>Event starts in: {this.state.startTime}</Text>
          <Slider
            {...this.props}
            onValueChange={(value) => {this.startTimeSlider(value)} }
            minimumValue={0}
            maximumValue={5}
            step={1} />
          <ScrollView horizontal={true} style={{flexDirection: 'row'}}>
            <View style={{flexDirection: 'row'}}>
              {this.state.eventPics.map(function(item, key) {
                return (
                  <Image key={key} source={{uri: item.uri}} style={styles.imageUpload} />
                  );
                })
              }
            </View>
          </ScrollView>
          <TouchableOpacity onPress={this.pickImage.bind(this)}>
            <Text style={styles.inputLable2}>upload picture</Text>
          </TouchableOpacity>
          <View style={{alignItems: 'center', justifyContent: 'center'}}>
            <TouchableOpacity style={styles.createButton} onPress={() => { this.handleSubmitEvent(); }}>
              <Text style={styles.buttonText}>add spots</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  }

  render() {
    return (
      <ScrollView>
        <Text style={styles.headingSmall}>make a spot</Text>
        <View style={styles.row}>
          <TouchableOpacity onPress={() => {this.switchType('place')} }>
            <View style={styles.iconRow}>
              <Image style={styles.icons} source={require('../assets/diamond.gif')}/>
              <Text style={styles.textCenter} >place</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {this.switchType('event')} }>
            <View style={styles.iconRowEnd}>
              <Image style={styles.icons} source={require('../assets/pyramid.gif')}/>
              <Text style={styles.textCenter} >event</Text>
            </View>
          </TouchableOpacity>
        </View>
        {this.renderForm()}
      </ScrollView>
    );
  }
};

const sendSpotToServer = (type, obj) => {
  // let uri = 'http://10.6.23.239:3000/';
  let uri = 'https://agile-peak-45133.herokuapp.com';
  let endPoint;

  if (type === 'createPlace') {
    // console.log('creating place: ', obj);
    endPoint = 'createPlace';
  } else if (type === 'createEvent') {
    // console.log('creating event: ', obj);
    endPoint = 'createEvent';
  }

  fetch(uri + endPoint, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(obj)
  })
  .then(function(response) {
    if (response.status === 200) {
      return response.json();
    } else  {
      console.log('error');
    }
  })
  .catch(function(error) {
    console.error(error);
  });
};

const mapStateToProps = function(state) {
  return {
    username: state.user.username,
    id: state.user.id,
    initialPosition: state.Geolocation.initialPosition,
    currentPosition: state.Geolocation.currentPosition,
    threeLat: state.Geolocation.threeLat,
    threeLon: state.Geolocation.threeLon,
    distance: state.Geolocation.distance
  };
};

const mapDispatchToProps = function(dispatch) {
  return { action: bindActionCreators(Actions, dispatch) };
};

export default connect(mapStateToProps, mapDispatchToProps)(CreatePanel);
