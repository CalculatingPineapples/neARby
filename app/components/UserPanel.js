import React, { Component } from 'react';
import {
  View,
  Text,
  MapView,
} from 'react-native';
import FBSDK, { LoginButton } from 'react-native-fbsdk';
import styles from '../styles/style';
import { drawerState } from '../actions/index';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

class UserPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mapItems: []
    };
  }

  componentDidMount() {
    this.plotItems();
  }
  
  plotItems() {
    if (this.props.places.places !== []) {
      let items = [];
      for (var i = 0; i < this.props.places.places.length; i++) {
        let spot = {
          latitude: this.props.places.places[i].lat,
          longitude: this.props.places.places[i].lon,
          title: this.props.places.places[i].name,
          subtitle: 'distance: ' + this.props.places.places[i].distance
        };
        if (this.props.places.places[i].userid === this.props.user.id) {
          items.push(spot);
        }
      }
      this.setState({mapItems: items});
    }
  }

  handleSignout = () => {
    this.props.navigator.resetTo({name: 'Login'});
  }

  render() {
    return (
      <View style={{flex: 1}}>
      <Text style={styles.subheading}>{this.props.user.username}'s Spots</Text>
      <MapView
        style={{flex: 7}}
        showsUserLocation={true}
        annotations={this.state.mapItems}
        followUserLocation={true}
        />
      <View style={{flex: 1, paddingTop: 20, justifyContent: 'space-between', alignItems: 'center'}}>
      <Text>You have {this.state.mapItems.length} spots.</Text>
      <LoginButton
        publishPermissions={["publish_actions"]}
        onLogoutFinished={this.handleSignout.bind(this)}/>
      </View>
      </View>
    );
  }
}
const mapStateToProps = function(state) {
  return {
    user: state.user,
    drawer: state.drawer,
    places: state.places
  };
};
const mapDispatchToProps = function(dispatch) {
  return {
    action: bindActionCreators({ drawerState }, dispatch)
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(UserPanel);