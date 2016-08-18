import React, { Component } from 'react';
import {
  View,
  Text
} from 'react-native';
import FBSDK, { LoginButton } from 'react-native-fbsdk';
import styles from '../styles/style';
import { drawerState } from '../actions/index';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

class UserPanel extends Component {
  constructor(props) {
    super(props);
    console.log(this, 'USER');
  }

  handleSignout = () => {
    this.props.navigator.resetTo({name: 'Login'});
  }

  render() {
    return (
      <View style={styles.panel}>
      <Text style={styles.heading}>under construction</Text>
      <Text style={{textAlign: 'center'}}><LoginButton
        publishPermissions={["publish_actions"]}
        onLogoutFinished={this.handleSignout.bind(this)}/></Text>
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
    action: bindActionCreators({ drawerState }, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserPanel);
