import React, {Component} from 'react';
import {View, StyleSheet, Text, TouchableOpacity} from "react-native";
import I18n from 'react-native-i18n'
import {selectFavorites, selectNearest} from "../actions/shops";
import {connect} from "react-redux";
import {FAVORITES, NEAREST} from "../reducer/shops";

class SegmentButtonsClass extends React.Component {

    state = {
        active: "left",
        theme: {}
    };

    constructor() {
        super();

    }

    onLeft = () => {
        if (this.props.type !== NEAREST) {
            //this.setState({active: "left"});
            this.props.onLeftPress && this.props.onLeftPress();
        }
    };

    onRight = () => {
        if (this.props.type !== FAVORITES) {
            //this.setState({active: "right"});
            this.props.onRightPress && this.props.onRightPress();
        }
    };

    getActiveStyle(type, state) {
        return (type === state) ? styles.buttonOn : styles.buttonOff;
    }

    getTextStyle(type, state) {
        return (type !== state) ? styles.buttonTextOff : styles.buttonTextOn;
    }

    render() {
        return (
            <View style={styles.container}>
                <TouchableOpacity
                    style={[this.getActiveStyle(this.props.type, NEAREST), styles.leftBorder, styles.buttonLeftRadius]}
                    onPress={this.onLeft}>
                    <Text style={this.getTextStyle(this.props.type, NEAREST)}>{I18n.t("shops.nearest")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[this.getActiveStyle(this.props.type, FAVORITES), styles.rightBorder, styles.buttonRightRadius]}
                    onPress={this.onRight}>
                    <Text style={this.getTextStyle(this.props.type, FAVORITES)}>{I18n.t("shops.favorite")}</Text>
                </TouchableOpacity>
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        theme: state.app.theme,
        type: state.shops.type
    }
};

export const SegmentButtons = connect(mapStateToProps)(SegmentButtonsClass);

const styles = StyleSheet.create({
    container: {
        height: 28,
        flexDirection: "row"
    },
    buttonLeftRadius: {
        borderBottomLeftRadius: 30,
        borderTopLeftRadius: 30
    },
    buttonRightRadius: {
        borderBottomRightRadius: 30,
        borderTopRightRadius: 30
    },
    leftBorder: {
        borderLeftWidth: 1,
        borderLeftColor: "#c40010",
    },
    rightBorder: {
        borderRightWidth: 1,
        borderRightColor: "#c40010",
    },
    buttonOff: {
        justifyContent: "center",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#c40010",
        borderBottomWidth: 1,
        borderBottomColor: "#c40010",
        paddingHorizontal: 20,
    },
    buttonTextOff: {
        fontSize: 13,
        fontWeight: "normal",
        fontStyle: "normal",
        lineHeight: 18,
        letterSpacing: -0.08,
        textAlign: "center",
        color: "#c40010",
    },
    buttonOn: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#c40010",
        borderWidth: 1,
        borderColor: "#c40010"
    },
    buttonTextOn: {
        fontSize: 13,
        fontWeight: "normal",
        fontStyle: "normal",
        lineHeight: 18,
        letterSpacing: -0.08,
        textAlign: "center",
        color: "#ffffff",
        paddingHorizontal: 20,
    }
});