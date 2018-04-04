import React, {Component} from "react";
import {TouchableOpacity, StyleSheet, Image, Text} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import {cameraIcon} from "../utils/images";

const styles = StyleSheet.create({
    area: {
        width: "100%",
        paddingHorizontal: 16,
    },
    container: {
        height: 50,
        borderRadius: 30,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        elevation: 3,
        marginBottom: 6,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowRadius: 5,
        shadowOpacity: 0.4
    },
    icon: {
        marginRight: 9
    },
    text: {
        fontSize: 16,
        fontWeight: "600",
        fontStyle: "normal",
        color: "#ffffff",

    }
});

export default (props) => {
    const icon = (props.icon) ? <Image style={styles.icon} source={props.icon}/> : null;
    let colors = ['#ff415f', '#c40010']
    if (props.disable === true) {
        colors = ["#b4b4b4", "#b4b4b4"]
    }
    return (
        <TouchableOpacity style={[styles.area, props.style]} onPress={props.onPress}>
            <LinearGradient
                start={{x: 0.0, y: 0.5}} end={{x: 1, y: 0.5}}
                style={styles.container}
                locations={[0, 1.0]}
                colors={colors}
            >
                {icon}
                <Text style={styles.text}>{props.text}</Text>
            </LinearGradient>
        </TouchableOpacity>
    )
}