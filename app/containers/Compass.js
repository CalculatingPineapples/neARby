import React, { Component } from 'react';
import {
  StyleSheet
} from 'react-native';

import Svg,{
    Circle,
    G,
    Rect,
    Text,
} from 'react-native-svg';

const calculateOffSet = (userLocation, placeLocation) => {
  let offset = {
    xOffset: (userLocation.deltaX - placeLocation.lat) * 0.3,
    zOffset: (placeLocation.lon - userLocation.deltaZ) * 0.3
  };
  return offset;
};

const Dots = (props) => {
  return (<Circle cx={`${props.zOffset}`} cy={`${props.xOffset}`} r="3" fill="rgba(0,0,255,1)"/>);
};


class Compass extends Component {
  constructor(props) {
    super(props);
    // console.log('this.props.rotation', this.props.rotation);
  }

  componentWillReceiveProps() {
    // console.log('this.props.places',this.props.places);
    // console.log('this.props.currentLocation',this.props.currentLocation);
    this.renderPlacesOnCompass();
  }

  renderPlacesOnCompass(originX, originZ) {
    return this.props.places.map((place, idx) => {
      let offset = calculateOffSet(this.props.currentLocation, place);
      let theta = Math.atan2(offset.xOffset, offset.zOffset) * 180 / Math.PI;
      let hypontenus = Math.sqrt(offset.xOffset * offset.xOffset + offset.zOffset * offset.zOffset);

      if (Math.abs(Math.sin(90 - theta + 45 * Math.PI / 180) * hypontenus) < 45 && Math.abs(Math.cos(90 - theta + 45 * Math.PI / 180) * hypontenus) < 45) {
        // console.log('sin', Math.sin(90 - theta + 45 * Math.PI / 180) * hypontenus);
        // console.log('cos', Math.cos(90 - theta + 45 * Math.PI / 180) * hypontenus);
        
        return (
          <Dots xOffset={originX + offset.xOffset} zOffset={originZ + offset.zOffset} key={idx} />
        );
      } else {
        return;
      }

    });
  }

  renderArrow() {
    return (
      <G id="arrow"
        rotate="-135"
        origin="0, 0"
        x="185"
        y="95"
      >
        <G
          fill="rgba(0,255,255,1)"
        >
          <Circle r="6" />
          <Rect width="6" height="6" />
          <Circle r="3" fill="rgba(0,0,255,1)"/>
        </G>

      </G>
    );
  }
  render() {
    return (
      <Svg
        width="600"
        height="200">

        {/*
          <Rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(255,0,0,.2)"/>
          */}

        <G
          x="140"
          y="50">

          <G
            rotate={`${-1 * this.props.rotation}`}
            origin="45, 45">

            {/* this is the square with the north lable */}
            <G
              rotate={`${-45}`}
              origin="45, 45">
              <Rect
                width="90"
                height="90"
                fill="rgba(0,255,255,.2)"
                strokeWidth="5"
                stroke="rgba(0,255,255,.2)"/>

              <G
                rotate={45}
                origin="78, 4">
                <Text
                  fill="cyan"
                  fontSize="12"
                  x="84"
                  y="0"
                  textAnchor="middle">
                  N
                </Text>
              </G>
            </G>

            {this.renderPlacesOnCompass(45, 45)}
          </G>
        </G>
        {this.renderArrow()}
      </Svg>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,1)'
  }
});

let Place = (props) => {
  return (
    <Circle
      cx="45"
      cy="45"
      r="5"
      fill="blue"
    />
  )
};

export default Compass;