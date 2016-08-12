import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View, 
  Navigator
} from 'react-native';
import Main from './Main';
import Login from './Login';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import rootReducer from '../reducers/root-reducer';
import wrapper from '../../index.ios.js';

const ROUTES = {
  Main: Main,
  Login: Login
};

class App extends Component {
  constructor(props) {
    super(props);
  }
  renderScene(route, navigator) {
    let Component = ROUTES[route.name];
    return (
      <Component
      route={route}
      navigator={navigator} />
    );
  }
  render() {
    return (
      <Navigator initialRoute={{ name: 'Login', index: 0 }}
      style={ styles.container }
      renderScene={ this.renderScene.bind(this) }
      configureScene={ () => {return Navigator.SceneConfigs.FloatFromRight;} } 
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

export default App;