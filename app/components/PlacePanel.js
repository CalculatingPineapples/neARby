import React, { Component } from 'react';
import {
  View,
  TouchableHighlight,
  Switch,
  TextInput,
  Text,
  Alert
} from 'react-native';
import styles from '../styles/style';
import { drawerState, placeQuery } from '../actions/index';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

class PlacePanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      food: false,
      hotel: false,
      cafes: false,
      nightlife: false,
      shopping: false,
      publicTransit: false,
      bank: false,
      gasStation: false,
      parking: false,
      park: false,
      placeSearch: ''
    };
  }

  createSwitch(place, text) {
    return (
      <View style={styles.switch}>
        <Switch
            onTintColor="#009D9D"
            onValueChange={(value) => this.setState({[place]: value})}
            value={this.state[place]} />
        <Text style={styles.switchText}>{text}</Text>
      </View>
    );
  }

  handleSubmit() {
    this.props.action.placeQuery(this.state);
    this.setState({
      food: false,
      hotel: false,
      cafes: false,
      nightlife: false,
      shopping: false,
      publicTransit: false,
      bank: false,
      gasStation: false,
      parking: false,
      park: false,
      placeSearch: ''
    });
    Alert.alert(
      'Query submitted!',
      'Processing your search ... thanks for waiting!',
      [
        {text: 'OK', onPress: () => console.log('OK Pressed')}
      ]
    );
    this.props.action.drawerState('Search', true);
    this.props.close();
  }

  render() {
    return (
      <View style={styles.panel}>
        <Text style={styles.heading}>places</Text>
        <TextInput style={styles.textInput}  onChangeText={(text) => this.setState({placeSearch: text})} value={this.state.placeSearch} placeholder="Search Places" />
        <Text style={styles.subheading}>Place Type</Text>
        <View style={styles.switchTable}>
          <View style={styles.switchColumn}>
            {this.createSwitch('food', 'Food')}
            {this.createSwitch('hotel', 'Hotels')}
            {this.createSwitch('cafes', 'Cafes')}
            {this.createSwitch('nightlife', 'Nightlife')}
            {this.createSwitch('shopping', 'Shopping')}
          </View>
          <View style={styles.switchColumn}>
            {this.createSwitch('publicTransit', 'Public Transit')}
            {this.createSwitch('bank', 'Bank/ATM')}
            {this.createSwitch('gasStation', 'Gas Stations')}
            {this.createSwitch('parking', 'Parking')}
            {this.createSwitch('park', 'Parks')}
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableHighlight style={styles.placeOrEventButton} onPress={() => { this.props.action.drawerState('Search', false); }}>
            <Text style={styles.buttonText}>go back</Text>
          </TouchableHighlight>
          <TouchableHighlight style={styles.placeOrEventButton} onPress={() => { this.handleSubmit(); }}>
            <Text style={styles.buttonText}>submit</Text>
          </TouchableHighlight>
        </View>
      </View>
    );
  }
}

const mapStateToProps = function(state) {
  console.log('map state to props is called, this is state: ', state);
  return {
    user: state.user
  };
};

const mapDispatchToProps = function(dispatch) {
  console.log('map dispatch to props is called');
  return {
    action: bindActionCreators({ drawerState, placeQuery }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PlacePanel);

