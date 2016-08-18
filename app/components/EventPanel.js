import React, { Component } from 'react';
import {
  View,
  TouchableHighlight,
  Switch,
  TextInput,
  Slider,
  Text,
  Alert
} from 'react-native';
import styles from '../styles/style';
import { drawerState, eventQuery } from '../actions/index';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

class EventPanel extends Component {
  constructor(props) {
    super(props);
    console.log(props, 'panelProps');
    this.state = {
      business: false,
      family: false,
      comedy: false,
      festival: false,
      sports: false,
      music: false,
      social: false,
      film: false,
      art: false,
      sciTech: false,
      eventDays: 1,
      eventSearch: ''
    };
  }

  renderSliderValue() {
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

  createSwitch(event, text) {
    return (
      <View style={styles.switch}>
        <Switch
            onTintColor="#009D9D"
            onValueChange={(value) => this.setState({[event]: value})}
            value={this.state[event]} />
        <Text style={styles.switchText}>{text}</Text>
      </View>
    );
  }

  handleSubmit() {
    this.props.action.placeSearch(this.state);
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
  }

  render() {
      return (
        <View style={styles.panel}>
          <Text style={styles.heading}>events</Text>
          <TextInput style={styles.textInput} onChangeText={(text) => this.setState({eventSearch: text})} value={this.state.eventSearch} placeholder="Search Events" />
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
            {this.createSwitch('business', 'Business')}
            {this.createSwitch('family', 'Family')}
            {this.createSwitch('comedy', 'Comedy')}
            {this.createSwitch('festival', 'Festivals')}
            {this.createSwitch('sports', 'Sports')}
          </View>
          <View style={styles.switchColumn}>
            {this.createSwitch('music', 'Music')}
            {this.createSwitch('social', 'Social')}
            {this.createSwitch('film', 'Film')}
            {this.createSwitch('art', 'Art')}
            {this.createSwitch('sciTech', 'Sci/Tech')}
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableHighlight style={styles.placeOrEventButton} onPress={() => { this.props.action.drawerState('Search', false); }}>
            <Text style={styles.buttonText}>go back</Text>
          </TouchableHighlight>
          <TouchableHighlight style={styles.placeOrEventButton} onPress={() => { this.props.action.eventQuery(this.state); this.props.action.drawerState('Search', true); }}>
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
    action: bindActionCreators({ drawerState, eventQuery }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EventPanel);
