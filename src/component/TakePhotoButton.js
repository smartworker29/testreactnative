import React, {Component} from "react";
import {TouchableOpacity, StyleSheet, Image, Text} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import {cameraIcon} from "../utils/images";

const styles = StyleSheet.create({
    container: {
        height: 44,
        borderRadius: 30,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        elevation: 5,
        paddingHorizontal: 16,
        marginVertical: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowRadius: 5,
        shadowOpacity: 0.4
    },
    text: {
        fontSize: 16,
        fontWeight: "600",
        fontStyle: "normal",
        color: "#ffffff",
        marginLeft: 9
    }
});

export default (props) => {
    return (
        <TouchableOpacity style={{marginTop: 20, flex: 1}} onPress={props.onPress}>
            <LinearGradient
                start={{x: 0.0, y: 0.5}} end={{x: 1, y: 0.5}}
                style={styles.container}
                locations={[0, 1.0]}
                colors={['#ff415f', '#c40010']}
            >
                <Image source={cameraIcon}/>
                <Text style={styles.text}>Сделать фото</Text>
            </LinearGradient>
        </TouchableOpacity>
    )
}