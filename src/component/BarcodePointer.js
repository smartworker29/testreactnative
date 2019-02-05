import {Component} from "react";
import {Dimensions, View} from "react-native";
import React from "react";

const {height, width} = Dimensions.get('window');

export default class BarcodePointer extends Component {
  render() {
    const pointerWidth = width * 80 / 100;
    const pointerHeight = width * 40 / 100;
    return (
      <View style={{
        position: "absolute",
        borderColor: "white",
        borderWidth: 2,
        width: pointerWidth,
        height: pointerHeight,
        top: height / 2 - pointerHeight / 2,
        left: width / 2 - pointerWidth / 2
      }}>
        <View style={{
          flex: 1, position: "absolute",
          width: "100%",
          height: "100%",
          borderWidth: 2,
          borderColor: "black",
        }}/>
      </View>
    )
  }
}