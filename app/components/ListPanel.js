import React, { Component } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  Text,
} from 'react-native';
import styles from '../styles/style';
import { drawerState, selectPlace, imageQuery, directionsQuery } from '../actions/index';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

class ListPanel extends Component {
  constructor(props) {
    super(props);
  }



  render() {
    return (
      <View>
        <Text style={styles.subheading}>nearby</Text>

        <ScrollView style={styles.scrollView}>
          {this.props.places.map(function(item, key) {
            return (
              <TouchableOpacity key={key} onPress={() => { this.props.action.drawerState('Detail'); this.props.action.selectPlace(item); this.props.action.imageQuery(item); this.props.action.directionsQuery({curLat: 37.783537, curLon: -122.409003, destLat: item.realLat, destLon: item.realLon}); }}>
                <View>
                  <Text style={styles.listText} >{item.name}</Text>
                  <Text style={styles.distanceText} >     {item.distance} feet away</Text>
                </View>
              </TouchableOpacity>
              );
            }.bind(this))
          }
        </ScrollView>
      </View>
    );
  }
}

const mapStateToProps = function(state) {
  return {
    places: state.places.places,
    detail: state.detail
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    action: bindActionCreators({ drawerState, selectPlace, imageQuery, directionsQuery }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ListPanel);
