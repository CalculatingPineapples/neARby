import React, { Component } from 'react';
import {
  Text,
  View,
  TouchableHighlight,
  TouchableOpacity,
  Image
} from 'react-native';
import styles from '../styles/style';
import Icon from 'react-native-vector-icons/FontAwesome';
import FBSDK, { GraphRequest, GraphRequestManager } from 'react-native-fbsdk';
import Drawer from 'react-native-drawer';
import ARview from './ARview';
// import ARview from './ARview';
import SearchPanel from '../components/SearchPanel';
import EventPanel from '../components/EventPanel';
import PlacePanel from '../components/PlacePanel';
import UserPanel from '../components/UserPanel';
import DetailPanel from '../components/DetailPanel';
import ListPanel from '../components/ListPanel';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Actions from '../actions/index';

import CreatePanel from '../components/CreatePanel';
import SmallDetailView from '../components/SmallDetailView';

class Main extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.graphRequestForUser();
  }

  graphRequestForUser() {
    let infoRequest = new GraphRequest(
        '/me?fields=name,picture,friends',
        null,
        this.props.action.getUserInfo
      );
    new GraphRequestManager().addRequest(infoRequest).start();
  }

  submitVote(vote) {
    console.log('submitVote');
    let focalPlace = this.props.places[this.props.focalPlace];
    let username = this.props.user.username;
    let voteObj = {
      name: focalPlace.name,
      latitude: focalPlace.latitude,
      longitude: focalPlace.longitude,
      username: username,
      vote: vote
    };
    // this.props.action.sendVote(voteObj);
  }

  renderPreview() {
    if (this.props.preview) {
      return (
        <SmallDetailView closePanel={() => {this.props.action.closePreview();}} place={this.props.places[this.props.focalPlace]} submitVote={this.submitVote.bind(this)}/>
      );
    }
    return;
  }

  render() {
    let drawerItems;
    if (this.props.drawer === 'Search') {
        drawerItems = <SearchPanel close={() => {this._drawer.close()}} open={() => {this._drawer.open()}}/>
    } else if (this.props.drawer === 'Events') {
      drawerItems = <EventPanel close={() => {this._drawer.close()}} open={() => {this._drawer.open()}}/>
    } else if (this.props.drawer === 'Places') {
      drawerItems = <PlacePanel close={() => {this._drawer.close()}} open={() => {this._drawer.open()}}/>
    } else if (this.props.drawer === 'List') {
      drawerItems = <ListPanel close={() => {this._drawer.close()}} open={() => {this._drawer.open()}}/>
    } else if (this.props.drawer === 'User'){
      drawerItems = <UserPanel navigator={this.props.navigator} close={() => {this._drawer.close()}} open={() => {this._drawer.open()}}/>
    } else if (this.props.drawer === 'Detail') {
      drawerItems = <DetailPanel close={() => {this._drawer.close()}} open={() => {this._drawer.open()}}/>
    } else if (this.props.drawer === 'Create') {
      drawerItems = <CreatePanel close={() => {this._drawer.close()}} open={() => {this._drawer.open()}}/>;
    } else {
      drawerItems = <SearchPanel close={() => {this._drawer.close()}} open={() => {this._drawer.open()}}/>
    }

    return (
      <Drawer
        navigator={this.props.navigator}
        type="overlay"
        side="right"
        ref={(ref) => {this._drawer = ref;}}
        content={<View style={styles.panel}><TouchableHighlight onPress={() => {this._drawer.close()}}>
      <Text style={styles.exit}>x</Text>
      </TouchableHighlight>{drawerItems}</View>}
        panOpenMask={0.5}
        panCloseMask={0.1}
        tweenHandler={(ratio) => ({main: { opacity:(3 - ratio) / 3 }})}>
        <ARview
          pressProfile={() => {this.props.action.drawerState('User'); this._drawer.open();}}
          pressSearch={() => {this.props.action.drawerState('Search'); this._drawer.open();}}
          pressList={() => {this.props.action.drawerState('List'); this._drawer.open();}}
          pressCreate={() => {this.props.action.drawerState('Create'); this._drawer.open();}}
        />
        {this.renderPreview()}
      </Drawer>
    );
  }
}

const mapStateToProps = function(state) {
  return {
    places: state.places.places,
    user: state.user,
    drawer: state.drawer.option,
    preview: state.detail.preview,
    focalPlace: state.detail.focalPlace,
  };
};

const mapDispatchToProps = function(dispatch) {
  return { action: bindActionCreators(Actions, dispatch) };
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
