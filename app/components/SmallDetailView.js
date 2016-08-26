import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView
} from 'react-native';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Actions from '../actions/index';

import styles from '../styles/style';

class SmallDetailView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      voted: false,
      upvote: false,
      downvote: false,
      upvotes: this.props.place.upvotes || 0,
      downvotes: this.props.place.downvotes || 0,
    };
  }

  submitVote(vote) {
    let username = this.props.user.username;
    let voteObj = Object.assign({vote: vote, username: username}, this.props.place);
    this.props.action.sendVote(voteObj);
  }

  upvote() {
    this.setState({upvote: true, downvote: false, voted: true, upvotes: this.props.place.upvotes + 1 || 1, downvotes: this.props.place.downvotes || 0});
    this.submitVote('upvote');
  }

  downvote() {
    this.setState({upvote: false, downvote: true, voted: true, upvotes: this.props.place.upvotes || 0, downvotes: this.props.place.downvotes + 1 || 1});
    this.submitVote('downvote');
  }

  enterARImageMode() {
    // console.log('enterARImageMode');
    this.props.action.switchARImageMode(true);
    this.props.closePanel();
  }

  renderImg() {
    let images;

    //if the place img attribute is an array it is a user place or event
    if (Array.isArray(this.props.place.img)) {
      images = this.props.place.img;
    } else {
      images = this.props.photos;
    }

    if (images.length === 0) {
      return (
        <ScrollView horizontal={true} style={{flexDirection: 'row'}}>
          <View style={{flexDirection: 'row'}}>
            <Image source={require('../assets/no_image_available.png')} style={styles.images}/>
          </View>
        </ScrollView>
      );
    }

    return (
      <ScrollView horizontal={true} style={{flexDirection: 'row'}}>
        <View style={{flexDirection: 'row'}}>
          {images.slice(0,10).map(function(item, key) {
            return (
              <TouchableOpacity key={key} onPress={() => {this.enterARImageMode()}}>
                  <Image source={{uri: item}} style={styles.images}/>
              </TouchableOpacity>);
            }.bind(this))
          }
        </View>
      </ScrollView>
    );
  }


  render() {
    let buttons = (
        <View style={styles.detailPreview_iconColumn}>
          <View style={styles.detailPreview_Btn}>
            <TouchableOpacity onPress={this.props.closePanel}>
              <Image style={styles.detailPreview_closeBtn} source={require('../assets/close.png')}></Image>
            </TouchableOpacity>
          </View>
        </View>
      );

    let upvoteIcon = (
      <TouchableOpacity style={{paddingLeft: 5, paddingRight: 5}} onPress={() => {this.upvote()}}>
        <Image style={styles.detailPreview_icon} source={require('../assets/upvote.png')}></Image>
      </TouchableOpacity>
    );

    let downvoteIcon = (
      <TouchableOpacity style={{paddingLeft: 5, paddingRight: 5}} onPress={() => {this.downvote()}}>
        <Image style={styles.detailPreview_icon} source={require('../assets/downvote.png')}></Image>
      </TouchableOpacity>
    );

    if (this.state.upvote) {
      upvoteIcon = (
        <TouchableOpacity style={{paddingLeft: 5, paddingRight: 5}}>
          <Image style={styles.detailPreview_icon} source={require('../assets/upvoted.png')}></Image>
        </TouchableOpacity>
      );
      downvoteIcon = (
        <TouchableOpacity style={{paddingLeft: 5, paddingRight: 5}} onPress={() => {this.downvote()}}>
          <Image style={styles.detailPreview_icon} source={require('../assets/downvote.png')}></Image>
        </TouchableOpacity>
      );

    } else if (this.state.downvote) {
      upvoteIcon = (
        <TouchableOpacity style={{paddingLeft: 5, paddingRight: 5}} onPress={() => {this.upvote()}}>
          <Image style={styles.detailPreview_icon} source={require('../assets/upvote.png')}></Image>
        </TouchableOpacity>
      );
      downvoteIcon = (
        <TouchableOpacity style={{paddingLeft: 5, paddingRight: 5}}>
          <Image style={styles.detailPreview_icon} source={require('../assets/downvoted.png')}></Image>
        </TouchableOpacity>
      );
    }

    if (this.props.place.type && (this.props.place.type === 'userPlace' || this.props.place.type === 'userEvent')) {
      buttons = (
        <View style={styles.detailPreview_iconColumn}>
          <View style={styles.detailPreview_Btn}>
            <TouchableOpacity onPress={this.props.closePanel}>
              <Image style={styles.detailPreview_closeBtn} source={require('../assets/close.png')}></Image>
            </TouchableOpacity>
          </View>
          <View style={{flex: 1, flexDirection: 'row'}}><Text>{this.state.upvotes}</Text>{upvoteIcon}</View>
          <View style={{flex: 1, flexDirection: 'row'}}><Text>{this.state.downvotes}</Text>{downvoteIcon}</View>
        </View>
      );
    }

    return (
      <View style={styles.detailPreview}>
        <View style={styles.detailPreview_container}>
          <View style={styles.detailPreview_description}>
            <TouchableOpacity>
              <Text style={styles.detailPreview_heading}>{this.props.place.name}</Text>
            </TouchableOpacity>
            {this.renderImg()}
          </View>
          {buttons}
        </View>
      </View>
    );
  }

};

const mapStateToProps = function(state) {
  return {
    user: state.user,
    photos: state.photos.photos
  };
};

const mapDispatchToProps = function(dispatch) {
  return { action: bindActionCreators(Actions, dispatch) };
};

export default connect(mapStateToProps, mapDispatchToProps)(SmallDetailView);