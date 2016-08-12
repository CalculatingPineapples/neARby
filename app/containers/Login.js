import FBSDK, { LoginButton, AccessToken } from 'react-native-fbsdk';
import React, { Component } from 'react';
import {

  View
} from 'react-native';

class Login extends Component {
  constructor(props) {
    super(props);
    console.log(props);
  }

  componentWillMount () {
    console.log(AccessToken)
    AccessToken.getCurrentAccessToken().then(
      (data) => {
        if(data) {
         this.goToHomePage(); 
        }
       }
    )
  }
  goToHomePage(accessToken) {
    this.props.navigator.replace({name: 'Main'});
  }
  goToMain() {
    console.log('calling');
    this.props.navigator.push({name: 'Main'});
  }

  render() {
    return (
      <View style={styles.container}>
       <LoginButton
        onLoginFinished={
          (error, result) => {
            if (error) {
              alert("login has error: " + result.error);
            } else if (result.isCancelled) {
              alert("login is cancelled.");
            } else {
              AccessToken.getCurrentAccessToken().then(
                (data) => {
                  this.goToHomePage();
                }
              )
            }
          }
        }
      />
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  button: {
    padding: 25,
    backgroundColor: '#3B5998'
  }
};

export default Login;
