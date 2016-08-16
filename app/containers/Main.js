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
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FBSDK, { LoginButton, AccessToken, GraphRequest, GraphRequestManager } from 'react-native-fbsdk';
import Drawer from 'react-native-drawer';
import ARview from './ARview';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Actions from '../actions/index';

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sliderValue: 1,
      sampleSwitch: false,
      username: '',
      drawerItem: 'Search',
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
      eventSearch: '',
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
      placeSearch: ''
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

  closeControlPanel = () => {
    this._drawer.close();
  }
  openControlPanel = () => {
    this._drawer.open();
  }

  handleSignout = () => {
    this.props.navigator.resetTo({name: 'Login'});
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

  eventSearch = () => {
    console.log('calling eventsearch');
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
      eventDays: this.state.eventDays,
      eventSearch: this.state.eventSearch
    };
    console.log(eventQuery, 'QUERY');
  fetch('https://agile-peak-45133.herokuapp.com/events', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventQuery)
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

  handleDrawer = (e) => {
    e.preventDefault();
    this.props.action.drawerState('Places');
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

  render() {
    let drawerItems;
    if (this.state.drawerItem === 'Search') {
        drawerItems = <View style={styles.panel}>
        <Text style={styles.heading}>search</Text>
        <View style={{alignItems: 'center'}}>
          <TouchableHighlight style={styles.placeOrEventButton} onPress={() => { this.setState({drawerItem: 'Places'}); }}>
            <Text style={styles.buttonText}>places</Text>
          </TouchableHighlight>
          <TouchableHighlight style={styles.placeOrEventButton} onPress={() => { this.setState({drawerItem: 'Events'}); }}>
            <Text style={styles.buttonText}>events</Text>
          </TouchableHighlight>
          </View>
        </View>
    } else if (this.state.drawerItem === 'Events') {
      drawerItems = <View style={styles.panel}>
      <Text style={styles.heading}>events</Text>
        <TextInput style={styles.textInput} placeholder='Search Events'></TextInput>
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
            onTintColor='#009D9D'
            onValueChange={(value) => this.setState({businessEvent: value})}
            value={this.state.businessEvent} />
            <Text style={styles.switchText}>Business</Text>
            </View>
          <View style={styles.switch}>
            <Switch
            onTintColor='#009D9D'
            onValueChange={(value) => this.setState({familyEvent: value})}
            value={this.state.familyEvent} />
            <Text style={styles.switchText}>Family</Text>
          </View>
          <View style={styles.switch}>
            <Switch
            onTintColor='#009D9D'
            onValueChange={(value) => this.setState({comedyEvent: value})}
            value={this.state.comedyEvent} />
            <Text style={styles.switchText}>Comedy</Text>
            </View>
          <View style={styles.switch}>
            <Switch
            onTintColor='#009D9D'
            onValueChange={(value) => this.setState({festivalEvent: value})}
            value={this.state.festivalEvent} />
            <Text style={styles.switchText}>Festivals</Text>
          </View>
          <View style={styles.switch}>
            <Switch
            onTintColor='#009D9D'
            onValueChange={(value) => this.setState({sportsEvent: value})}
            value={this.state.sportsEvent} />
            <Text style={styles.switchText}>Sports</Text>
          </View>
        </View>
        <View style={styles.switchColumn}>
          <View style={styles.switch}>
            <Switch
            onTintColor='#009D9D'
            onValueChange={(value) => this.setState({musicEvent: value})}
            value={this.state.musicEvent} />
            <Text style={styles.switchText}>Music</Text>
            </View>
          <View style={styles.switch}>
            <Switch
            onTintColor='#009D9D'
            onValueChange={(value) => this.setState({socialEvent: value})}
            value={this.state.socialEvent} />
            <Text style={styles.switchText}>Social</Text>
          </View>
          <View style={styles.switch}>
            <Switch
            onTintColor='#009D9D'
            onValueChange={(value) => this.setState({filmEvent: value})}
            value={this.state.filmEvent} />
            <Text style={styles.switchText}>Film</Text>
            </View>
          <View style={styles.switch}>
            <Switch
            onTintColor='#009D9D'
            onValueChange={(value) => this.setState({artEvent: value})}
            value={this.state.artEvent} />
            <Text style={styles.switchText}>Art</Text>
          </View>
          <View style={styles.switch}>
            <Switch
            onTintColor='#009D9D'
            onValueChange={(value) => this.setState({sciTechEvent: value})}
            value={this.state.sciTechEvent} />
            <Text style={styles.switchText}>Sci/Tech</Text>
          </View>
        </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableHighlight style={styles.placeOrEventButton} onPress={() => { this.setState({drawerItem: 'Search'}); }}>
            <Text style={styles.buttonText}>go back</Text>
          </TouchableHighlight>
          <TouchableHighlight style={styles.placeOrEventButton} onPress={() => { this.eventSearch() }}>
            <Text style={styles.buttonText}>submit</Text>
          </TouchableHighlight>
        </View>
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
            onTintColor='#009D9D'
            onValueChange={(value) => this.setState({foodPlace: value})}
            value={this.state.foodPlace} />
            <Text style={styles.switchText}>Food</Text>
            </View>
          <View style={styles.switch}>
            <Switch
            onTintColor='#009D9D'
            onValueChange={(value) => this.setState({hotelPlace: value})}
            value={this.state.hotelPlace} />
            <Text style={styles.switchText}>Hotels</Text>
          </View>
          <View style={styles.switch}>
            <Switch
            onTintColor='#009D9D'
            onValueChange={(value) => this.setState({cafesPlace: value})}
            value={this.state.cafesPlace} />
            <Text style={styles.switchText}>Cafes</Text>
            </View>
          <View style={styles.switch}>
            <Switch
            onTintColor='#009D9D'
            onValueChange={(value) => this.setState({nightlifePlace: value})}
            value={this.state.nightlifePlace} />
            <Text style={styles.switchText}>Nightlife</Text>
          </View>
          <View style={styles.switch}>
            <Switch
            onTintColor='#009D9D'
            onValueChange={(value) => this.setState({shoppingPlace: value})}
            value={this.state.shoppingPlace} />
            <Text style={styles.switchText}>Shopping</Text>
          </View>
        </View>
        <View style={styles.switchColumn}>
          <View style={styles.switch}>
            <Switch
            onTintColor='#009D9D'
            onValueChange={(value) => this.setState({publicTransit: value})}
            value={this.state.publicTransit} />
            <Text style={styles.switchText}>Public Transit</Text>
            </View>
          <View style={styles.switch}>
            <Switch
            onTintColor='#009D9D'
            onValueChange={(value) => this.setState({bankPlace: value})}
            value={this.state.bankPlace} />
            <Text style={styles.switchText}>Bank/ATM</Text>
          </View>
          <View style={styles.switch}>
            <Switch
            onTintColor='#009D9D'
            onValueChange={(value) => this.setState({gasStationPlace: value})}
            value={this.state.gasStationPlace} />
            <Text style={styles.switchText}>Gas Stations</Text>
            </View>
          <View style={styles.switch}>
            <Switch
            onTintColor='#009D9D'
            onValueChange={(value) => this.setState({parkingPlace: value})}
            value={this.state.parkingPlace} />
            <Text style={styles.switchText}>Parking</Text>
          </View>
          <View style={styles.switch}>
            <Switch
            onTintColor='#009D9D'
            onValueChange={(value) => this.setState({parkPlace: value})}
            value={this.state.parkPlace} />
            <Text style={styles.switchText}>Parks</Text>
          </View>
        </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableHighlight style={styles.placeOrEventButton} onPress={() => { this.setState({drawerItem: 'Search'}); }}>
            <Text style={styles.buttonText}>go back</Text>
          </TouchableHighlight>
          <TouchableHighlight style={styles.placeOrEventButton} onPress={() => { this.placeSearch(); }}>
            <Text style={styles.buttonText}>submit</Text>
          </TouchableHighlight>
        </View>
        </View>
    } else {
      drawerItems = <View style={styles.panel}>
      <Text style={styles.heading}>under constrooction
             <LoginButton
          publishPermissions={["publish_actions"]}
          onLogoutFinished={this.handleSignout.bind(this)}/></Text>

      </View>
    }

    return (
      <Drawer
        type="overlay"
        side="right"
        ref={(ref) => this._drawer = ref}
        content={drawerItems}
        panOpenMask={0.5}
        panCloseMask={0.2}
        tweenHandler={(ratio) => ({main: { opacity:(3-ratio)/3 }})}>
        <ARview
          pressProfile={() => {this.setState({drawerItem: 'Profile'}); this._drawer.open()}}
          pressSearch={() => {this.setState({drawerItem: 'Search'}); this._drawer.open()}}
        />
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
    flexDirection: 'row',
    alignItems: 'center'
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
    fontSize: 25,
    fontFamily: 'AvenirNext-Regular',
    textAlign: 'center'
  },
  drawerStyles: {
      flex: 1,
      // justifyContent: 'space-between',
      // alignItems: 'center',
      shadowRadius: 3,
      backgroundColor: 'rgba(0,0,0,.5)'

  },
  panel: {
    backgroundColor: 'rgba(255,255,255,.9)',
    justifyContent: 'center',
    margin: 20,
    padding: 20,
    flex: 1
  },
  subheading: {
    fontSize: 18,
    fontFamily: 'AvenirNext-Medium',
    textAlign: 'center',
    padding: 15
  },
  heading: {
    fontSize: 50,
    fontFamily: 'AvenirNext-Medium',
    textAlign: 'center',
    padding: 10,
    paddingBottom: 15
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
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 3,
    borderColor: '#000',
    height: 60,
    width: 150,
    margin: 10
  },
  text: {
    fontSize: 18,
    fontFamily: 'AvenirNext-Regular',
    textAlign: 'center',
    padding: 5
  },
  switch: {
    flex: 1,
    flexDirection: 'row',
  },
  switchText: {
    fontSize: 16,
    fontFamily: 'AvenirNext-Regular',
    marginLeft: 5,
    marginTop: 5
  },
  switchColumn: {
    flex: 1,
    flexDirection: 'column'
  },
  switchTable: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: 5,
    paddingBottom: 5
  },
  textInput: {
    fontSize: 16,
    fontFamily: 'AvenirNext-Regular',
    backgroundColor: '#FFF',
    height: 40,
    padding: 8,
    color: '#000',
    marginBottom: 20
  },
  compass: {
    width: 150,
    height: 150,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center'
  }
});


const mapStateToProps = function(state) {
  console.log('map state to props is called, this is state: ', state);
  return {
    places: state.places,
    // user: state.user
    drawer: state.drawer.option
  };
};

const mapDispatchToProps = function(dispatch) {
  console.log('map dispatch to props is called');
  return { action: bindActionCreators(Actions, dispatch) };
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
