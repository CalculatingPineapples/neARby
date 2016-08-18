import React, { Component } from 'react';
import {
  Text,
  Image,
  View,
  StyleSheet
} from 'react-native';

class Detail extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>[TITLE OF EVENT]</Text>
        <Image></Image>
        <Text>[EVENT DATE]</Text>
        <Text>[EVENT TIME]</Text>
        <Text>[EVENT LOCATION]</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 250,
    paddingTop: 250
  },
  button: {
    width: 50,
    height: 50,
    backgroundColor: '#3B5998',
  },
  textContainer: {
    flex: 1,
    flexDirection: 'row'
  },
  text: {
    fontSize: 60,
    fontFamily: 'AvenirNext-UltraLight',
  },
  textAR: {
    fontSize: 60,
    fontFamily: 'AvenirNext-Medium'
  }
});

export default Detail;
