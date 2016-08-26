import React, { Component } from 'react';
import {
  View,
  TouchableOpacity,
  Text
} from 'react-native';
import styles from '../styles/style';
import { drawerState, resetSearch, fetchPlaces } from '../actions/index';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

class SearchPanel extends Component {
  constructor(props) {
    super(props);
    // console.log(this, 'search');
  }

  resetSearch() {
    this.props.action.resetSearch();
    let positionObj = {
      latitude: this.props.currentPosition.latitude,
      longitude: this.props.currentPosition.longitude,
      threejsLat: this.props.threeLat,
      threejsLon: this.props.threeLon
    };

    this.props.action.fetchPlaces(positionObj);

  }

  render() {
    return (
      <View style={{justifyContent: 'center'}}>
        <Text style={styles.heading}>search</Text>
        <View style={{alignItems: 'center', justifyContent: 'center', height: 400}}>
          <TouchableOpacity style={styles.searchButtons} onPress={() => { this.props.action.drawerState('Places'); }}>
            <Text style={styles.searchButtonText}>places</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.searchButtons} onPress={() => { this.props.action.drawerState('Events'); }}>
            <Text style={styles.searchButtonText}>events</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.searchButtons} onPress={() => { this.resetSearch(); this.props.close(); }}>
            <Text style={styles.searchButtonText}>reset</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const mapStateToProps = function(state) {
  return {
    user: state.user,
    currentPosition: state.Geolocation.currentPosition,
    threeLat: state.Geolocation.threeLat,
    threeLon: state.Geolocation.threeLon
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    action: bindActionCreators({ drawerState, resetSearch, fetchPlaces }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchPanel);
