import React, { Component } from 'react';
import {
  StyleSheet
} from 'react-native';

import Svg,{
    Circle,
    Ellipse,
    G,
    LinearGradient,
    RadialGradient,
    Line,
    Path,
    Polygon,
    Polyline,
    Rect,
    Symbol,
    Text,
    Use,
    Defs,
    Stop
} from 'react-native-svg';


class Compass extends Component {
  constructor(props) {
    super(props);
    console.log('this.props.rotation', this.props.rotation);
  }

  renderArrow() {
    return (
      <G id="arrow"
        rotate="-135"
        origin="45, 45"
      >
        <G
          fill="rgba(0,255,255,1)"
        >
          <Circle cx="45" cy="45" r="6" />
          <Rect x="45" y="45" width="6" height="6" />
          <Circle cx="45" cy="45" r="3" fill="rgba(0,0,255,1)"/>
        </G>
      </G>
    );
  }
          // rotate={`${this.props.rotation}`}
  render() {
    return (
      <Svg
        width="200"
        height="200">
        <G
          rotate={`${this.props.rotation}`}
          origin="45, 45"
        >


          <Rect
              x="0"
              y="0"
              width="90"
              height="90"
              fill="rgba(0,255,255,.2)"
              strokeWidth="5"
              stroke="rgba(0,255,255,.2)"
          />

          <G
            rotate={45}
            origin="78, 4"
          >
            <Text
              fill="blue"
              fontSize="12"
              x="84"
              y="0"
              textAnchor="middle">
              N
            </Text>
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