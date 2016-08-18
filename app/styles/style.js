import React, { Component } from 'react';
import {
  StyleSheet
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,1)'
  },
  preview: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  menu: {
    padding: 10
  },
  button: {
    backgroundColor: 'rgba(0,0,0,0)',
    borderColor: '#FFF',
    borderWidth: 2,
    borderRadius: 30,
    height: 60,
    width: 60,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    color: '#FFF',
    fontSize: 25,
    fontFamily: 'AvenirNext-Regular',
    textAlign: 'center'
  },
  drawerStyles: {
      flex: 1,
      // justifyContent: 'space-between',
      // alignItems: 'center',
      shadowRadius: 3,
      backgroundColor: 'rgba(0,0,0,.5)'

  },
  panel: {
    backgroundColor: 'rgba(255,255,255,.9)',
    justifyContent: 'center',
    margin: 20,
    padding: 20,
    flex: 1
  },
  subheading: {
    fontSize: 18,
    fontFamily: 'AvenirNext-Medium',
    textAlign: 'center',
    padding: 15
  },
  heading: {
    fontSize: 50,
    fontFamily: 'AvenirNext-Medium',
    textAlign: 'center',
    padding: 10,
    paddingBottom: 15
  },
  image: {
    flex: 1
  },
  search: {
    height: 25,
    width: 25
  },
  placeOrEventButton: {
    backgroundColor: '#009D9D',
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 3,
    borderColor: '#000',
    height: 60,
    width: 150,
    margin: 10
  },
  text: {
    fontSize: 18,
    fontFamily: 'AvenirNext-Regular',
    textAlign: 'center',
    padding: 5
  },
  switch: {
    flex: 1,
    flexDirection: 'row',
  },
  switchText: {
    fontSize: 16,
    fontFamily: 'AvenirNext-Regular',
    marginLeft: 5,
    marginTop: 5
  },
  switchColumn: {
    flex: 1,
    flexDirection: 'column'
  },
  switchTable: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: 5,
    paddingBottom: 5
  },
  textInput: {
    fontSize: 16,
    fontFamily: 'AvenirNext-Regular',
    backgroundColor: '#FFF',
    height: 40,
    padding: 8,
    color: '#000',
    marginBottom: 20
  },
  compass: {
    width: 150,
    height: 150,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center'
  }
});

export default styles;
