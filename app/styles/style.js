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
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  menu: {
    padding: 10
  },
  userimg: {
    height: 57,
    width: 57,
    borderRadius: 30
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
  objectButton: {
    height: 40,
    width: 25
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
    // justifyContent: 'center',
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
  searchButtons: {
    backgroundColor: '#009D9D',
    padding: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 3,
    borderColor: '#000',
    margin: 30
  },
  searchButtonText: {
    color: '#FFF',
    fontSize: 35,
    fontFamily: 'AvenirNext-Regular',
    textAlign: 'center'
  },
  text: {
    fontSize: 18,
    fontFamily: 'AvenirNext-Regular',
    textAlign: 'center',
    padding: 5
  },
  exit: {
    fontFamily: 'Arial',
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'right'
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
    flexDirection: 'column',
    height: 200
  },
  switchTable: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: 5,
    paddingBottom: 5,
    height: 180
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
    justifyContent: 'flex-end',
    left: 150
  },
  buttonContainer: {
    flex: 1,
    alignItems: 'flex-end',
    flexDirection: 'row',
    marginTop: 40
    // justifyContent: 'center'
  },
  listText: {
    fontSize: 20,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  icons: {
    width: 100,
    height: 100,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  headingSmall: {
    fontSize: 25,
    fontFamily: 'AvenirNext-Medium',
    textAlign: 'center',
    padding: 10,
    paddingBottom: 15
  },
  inputLable: {
    fontSize: 15,
    fontFamily: 'AvenirNext-Medium',
    textAlign: 'center',
    padding: 5,
    paddingBottom: 5
  },
  iconRow: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,.5)',
    paddingLeft: 20,
    paddingRight: 20,
    opacity: 0.3,
  },
  iconRowEnd: {
    paddingLeft: 20,
    opacity: 0.3,
  },
  textCenter: {
    textAlign: 'center'
  },
  smallbutton: {
    color: '#FFF',
    fontSize: 20,
    fontFamily: 'AvenirNext-Regular',
    textAlign: 'center'
  },
  createButton: {
    backgroundColor: '#009D9D',
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 3,
    borderColor: '#000',
    height: 60,
    width: 150,
  },
  geometryButton: {
    height: 50
  },
  inputLable2: {
    fontSize: 15,
    fontFamily: 'AvenirNext-Medium',
    textAlign: 'center',
    padding: 5,
    paddingBottom: 20
  },

  // for detail preview
  detailPreview: {
    backgroundColor: 'white',
    height: 170,
    zIndex: 1,
  },
  detailPreview_description: {
    width: 300,
  },
  detailPreview_container: {
    flex:1,
    flexDirection: 'row',
    alignItems:'flex-start'
  },
  detailPreview_content: {
    alignItems:'flex-start',
    paddingLeft:10
  },
  detailPreview_image: {
    resizeMode: 'cover',
    height: 110,
  },
  detailPreview_iconColumn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-end'
  },
  detailPreview_heading: {
    fontFamily: 'AvenirNext-Medium',
    fontSize: 17,
    paddingLeft: 10,
    paddingTop: 10,
    paddingBottom: 10,
  },

  detailPreview_icon: {
    resizeMode: 'cover',
    width: 30,
    height: 30,
  },
  detailPreview_closeBtn: {
    resizeMode: 'cover',
    width: 45,
    height: 45,
  },
  detailPreview_Btn: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingRight: 20
  },
  images: {
    width: 100,
    height: 100,
    padding: 8,
    marginLeft: 2,
    marginRight: 2
  },
  imageUpload: {
    width: 60,
    height: 60,
    marginRight: 4,
    marginLeft: 4
  },
    scrollView: {
    height: 500,
  },
  scrollViewDetails: {
    height: 250,
  },
    detailsHeading: {
    fontSize: 18,
    fontFamily: 'AvenirNext-Medium',
    textAlign: 'center',
    padding: 5
  },
});

export default styles;
