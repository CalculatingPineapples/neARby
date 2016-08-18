import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableHighlight,
  Switch,
  Slider,
  Text,
} from 'react-native';
import styles from '../styles/style';
import Icon from 'react-native-vector-icons/FontAwesome';
import FBSDK, { GraphRequest, GraphRequestManager } from 'react-native-fbsdk';
import Drawer from 'react-native-drawer';
import ARview from './ARview';
import SearchPanel from '../components/SearchPanel';
import EventPanel from '../components/EventPanel';
import PlacePanel from '../components/PlacePanel';
import UserPanel from '../components/UserPanel';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Actions from '../actions/index';

class Main extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.graphRequestForUser();
    this.props.action.fetchPlaces();
  }

  graphRequestForUser() {
    let infoRequest = new GraphRequest(
        '/me?fields=name,picture',
        null,
        this.props.action.getUserInfo
      );
    new GraphRequestManager().addRequest(infoRequest).start();
  }

  componentDidMount() {
    this.props.action.drawerState('Places');
    // console.log(this.props.places, ' PLACES');
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

  placeSearch = () => {
    let placeQuery = {
      food: this.state.foodPlace,
      hotel: this.state.hotelPlace,
      cafes: this.state.cafesPlace,
      nightlife: this.state.nightlifePlace,
      shopping: this.state.shoppingPlace,
      publicTransit: this.state.publicTransitPlace,
      bank: this.state.bankPlace,
      gasStation: this.state.gasStationPlace,
      parking: this.state.parkingPlace,
      park: this.state.parkPlace,
      placeSearch: this.state.placeSearch,
      latitude: 37.78375460769774,
      longitude: -122.4091061298944,
      threejsLat: 0,
      threejsLon: 0,
    };
  fetch('http://10.6.23.239:3000/places', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(placeQuery)
  })
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    this.setState({
      placesEvents: data
    });
  }.bind(this));
    this._drawer.close();
    this.setState({
      foodPlace: false,
      hotelPlace: false,
      cafesPlace: false,
      nightlifePlace: false,
      shoppingPlace: false,
      publicTransitPlace: false,
      bankPlace: false,
      gasStationPlace: false,
      parkingPlace: false,
      parkPlace: false,
      placeSearchPlace: '',
      drawerItem: 'Search'
    });
  }

  getLocation = (obj) => {
    this.setState({
      latitude: obj.latitude,
      longitude: obj.longitude,
      threeLat: obj.threeLat,
      threeLon: obj.threeLon
    });
  }

  getInitialLocation = (obj) => {
    this.setState({
      latitude: obj.latitude,
      longitude: obj.longitude,
      threeLan: obj.threeLat,
      threeLon: obj.threeLon
    });
    // need to go and fetch the data from the server and set the places state
  }


  eventSearch = () => {
    let eventQuery = {
      business: this.state.businessEvent,
      family: this.state.familyEvent,
      comedy: this.state.comedyEvent,
      festival: this.state.festivalEvent,
      sports: this.state.sportsEvent,
      music: this.state.musicEvent,
      social: this.state.socialEvent,
      film: this.state.filmEvent,
      art: this.state.artEvent,
      sciTech: this.state.sciTechEvent,
      eventDays: this.state.sliderValue,
      eventSearch: this.state.eventSearch,
      latitude: 37.78375460769774,
      longitude: -122.4091061298944,
      threejsLat: 0,
      threejsLon: 0
    };
    console.log(eventQuery, 'QUERY');
  fetch('http://10.6.23.239:3000/events', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventQuery)
  })
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    this.setState({
      placesEvents: data
    });
  }.bind(this));
  // .catch(function(error) {
  //   console.error(error);
  // });
    this._drawer.close();
    this.setState({
      businessEvent: false,
      familyEvent: false,
      comedyEvent: false,
      festivalEvent: false,
      sportsEvent: false,
      musicEvent: false,
      socialEvent: false,
      filmEvent: false,
      artEvent: false,
      sciTechEvent: false,
      eventDays: 1,
      eventSearch: ''
    });
  }

  placeSearch = () => {
    let placeQuery = {
      food: this.state.foodPlace,
      hotel: this.state.hotelPlace,
      cafes: this.state.cafesPlace,
      nightlife: this.state.nightlifePlace,
      shopping: this.state.shoppingPlace,
      publicTransit: this.state.publicTransitPlace,
      bank: this.state.bankPlace,
      gasStation: this.state.gasStationPlace,
      parking: this.state.parkingPlace,
      park: this.state.parkPlace,
      placeSearch: this.state.placeSearch
    };
  fetch('https://agile-peak-45133.herokuapp.com/places', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(placeQuery)
  })
  .then(function(response) {
    if (response.status === 200) {
      console.log(response);
      return response.json();
    } else  {
      console.log('error');
    }
  })
  .catch(function(error) {
    console.error(error);
  });
    this._drawer.close();
    this.setState({
      foodPlace: false,
      hotelPlace: false,
      cafesPlace: false,
      nightlifePlace: false,
      shoppingPlace: false,
      publicTransitPlace: false,
      bankPlace: false,
      gasStationPlace: false,
      parkingPlace: false,
      parkPlace: false,
      placeSearchPlace: '',
      drawerItem: 'Search'
    });
  }



  render() {
    let drawerItems;
    if (this.props.drawer === 'Search') {
        drawerItems = <SearchPanel close={() => {this._drawer.close()}} open={() => {this._drawer.open()}}/>
    } else if (this.props.drawer === 'Events') {
      drawerItems = <EventPanel close={() => {this._drawer.close()}} open={() => {this._drawer.open()}}/>
    } else if (this.props.drawer === 'Places') {
      drawerItems = <PlacePanel close={() => {this._drawer.close()}} open={() => {this._drawer.open()}}/>
    } else if (this.props.drawer === 'List') {
      drawerItems = <UserPanel close={() => {this._drawer.close()}} open={() => {this._drawer.open()}}/>
    } else if (this.props.drawer === 'User'){
      <Text style={styles.heading}>under construction</Text>
        drawerItems = <UserPanel close={() => {this._drawer.close()}} open={() => {this._drawer.open()}}/>
    } else {
      drawerItems = <SearchPanel close={() => {this._drawer.close()}} open={() => {this._drawer.open()}}/>
    }

    return (
      <Drawer
        type="overlay"
        side="right"
        ref={(ref) => {this._drawer = ref;}}
        content={drawerItems}
        panOpenMask={0.5}
        panCloseMask={0.2}
        tweenHandler={(ratio) => ({main: { opacity:(3 - ratio) / 3 }})}>
        <ARview
          pressProfile={() => {this.props.action.drawerState('User'); console.log(this, 'THIS'); this._drawer.open();}}
          pressSearch={() => {this.props.action.drawerState('Search'); this._drawer.open();}}
          pressList={() => {this.props.action.drawerState('List'); this._drawer.open();}}
          // mainViewGeoLocation={this.getInitialLocation.bind()}
          // mainViewSetLocation={this.getLocation.bind()}
          // placesEvents={this.state.placesEvents}
        />
       </Drawer>
    );
  }
}

const mapStateToProps = function(state) {
  return {
    places: state.places,
    // user: state.user
    drawer: state.drawer.option
  };
};

const mapDispatchToProps = function(dispatch) {
  return { action: bindActionCreators(Actions, dispatch) };
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
