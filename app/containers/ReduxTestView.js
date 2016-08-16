import React, { Component } from 'react';
import {
  View,
  TouchableHighlight,
  Text,
} from 'react-native';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Actions from '../actions/index';

class ReduxTestView extends Component {
  toggleTestState() {
    console.log('this.props.testState', this.props.testState);
    this.props.action.testAction(this.props.testState + 1);
  }

  render() {
    return (
      <View>
        <TouchableHighlight onPress={this.toggleTestState.bind(this)}>
          <Text>clicking toggleTestState</Text>
        </TouchableHighlight>
      </View>
    );
  }
}

const mapStateToProps = function(state) {
  console.log('map state to props is called, this is state: ', state);
  return {
    testState: state.testState,
  };
};

const mapDispatchToProps = function(dispatch) {
  console.log('map dispatch to props is called');
  return { action: bindActionCreators(Actions, dispatch) };
};

export default connect(mapStateToProps, mapDispatchToProps)(ReduxTestView);