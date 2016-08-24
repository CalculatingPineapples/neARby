import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  MapView,
  ListView
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
        items.push(spot);
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
      <Text style={styles.subheading}>{this.props.user.username}</Text>
      <MapView
        style={{flex: 2}}
        showsUserLocation={true}
        annotations={[{latitude: 37.785834, longitude: -122.406417, title: 'DOLORES PAWTY', subtitle: 'dawgs only'}]}
        />
      <View style={{flex: 1, justifyContent: 'flex-end', alignItems: 'center'}}>
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
