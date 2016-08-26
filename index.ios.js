import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Provider } from 'react-redux';
import { createStore, compose, applyMiddleware } from 'redux';
import App from './app/containers/App';
import reducers from './app/reducers/root-reducer';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import promise from 'redux-promise';

const logger = createLogger();
export const store = createStore(reducers, applyMiddleware(thunk, promise));
// export const store = createStore(reducers, applyMiddleware(thunk, promise, logger));

class neARby extends Component {
  render() {
    return (
      <Provider store={store}>
        <App/>
      </Provider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

AppRegistry.registerComponent('neARby', () => neARby);
