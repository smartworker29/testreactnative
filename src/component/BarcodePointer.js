import React from "react";
import {Dimensions, View, StyleSheet} from "react-native";

const {height, width} = Dimensions.get('window');
const pointerWidth = width * 80 / 100;
const pointerHeight = width * 40 / 100;

export default () => (
  <View style={styles.container}>
    <View style={styles.block}/>
  </View>
)

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    borderColor: "white",
    borderWidth: 2,
    width: pointerWidth,
    height: pointerHeight,
    top: height / 2 - pointerHeight / 2,
    left: width / 2 - pointerWidth / 2
  },
  block: {
    flex: 1, position: "absolute",
    width: "100%",
    height: "100%",
    borderWidth: 2,
    borderColor: "black",
  }
});