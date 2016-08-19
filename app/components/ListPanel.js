import React, { Component } from 'react';
import {
  View,
  TouchableHighlight,
  ScrollView,
  Text,
} from 'react-native';
import styles from '../styles/style';
import { drawerState, selectPlace, imageQuery } from '../actions/index';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

class ListPanel extends Component {
  constructor(props) {
    super(props);
  }



  render() {
    return (
      <View style={styles.panel}>
        <Text style={styles.subheading}>Whats nearby</Text>
        <ScrollView>
          {this.props.places.map(function(item, key) {
            return (
              <TouchableHighlight key={key} onPress={() => { this.props.action.drawerState('Detail'); this.props.action.selectPlace(item); this.props.action.imageQuery(item)}}>
                <View style={styles.lists}>
                  <Text style={styles.listText} >{item.name}</Text>
                  <Text style={styles.listText} >{item.venue} at {item.address}</Text>
                  <Text style={styles.listText} >{item.distance} Feet Away</Text>
                </View>
              </TouchableHighlight>
              );
            }.bind(this))
          }
        </ScrollView>
      </View>
    );
  }
}

const mapStateToProps = function(state) {
  console.log('map state to props is called, this is state: ', state);
  return {
    places: state.places.places
  };
};

const mapDispatchToProps = function(dispatch) {
  console.log('map dispatch to props is called');
  return {
    action: bindActionCreators({ drawerState, selectPlace, imageQuery }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ListPanel);
