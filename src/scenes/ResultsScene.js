import React, {Component} from 'react';
import {resultsNavigationOptions} from "../navigators/options";
import {
    View,
    StyleSheet,
    Text,
    Image,
    ScrollView,
    Platform,
    TouchableWithoutFeedback,
    Button,
    ActivityIndicator
} from "react-native";
import I18n from 'react-native-i18n'
import {likeBigIcon, likeIcon} from "../utils/images";
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {connect} from "react-redux";
import ErrorLogging from "../utils/Errors";
import * as API from "../api";
import _ from "lodash";

class ResultsScene extends Component {
    static navigationOptions = ({navigation}) => resultsNavigationOptions(navigation);

    constructor() {
        super();
        this.state = {
            debug: false,
            data: null,
            error: null,
            text: null
        }
    }

    renderItem(text, val) {
        const textStyle = (val > 0) ? styles.blackText : styles.grayText;
        return (
            <View style={styles.item} key={text}>
                <Text style={styles.itemTitle}>{text}</Text>
                <Text style={[styles.itemValue, textStyle]}>{val}</Text>
            </View>
        )
    }

    onDebug = () => {
        //this.setState({debug: true})
    };

    updateErrors = async () => {

    };

    render() {
        if (this.state.debug === true) {
            return (
                <ScrollView style={{marginTop: 10}}>
                    <Button title="Update"
                            onPress={this.updateErrors}/>
                </ScrollView>
            )
        }

        const mainVal = this.props.main.value;
        const mainText = this.props.main.label;

        let items = [
            //this.renderItem(I18n.t("reports.underNum"), this.props.successVisits),
            //this.renderItem(I18n.t("reports.unassigned"), this.props.failedVisits)
        ];

        if (_.isArray(this.props.details) && this.props.details.length > 0) {
            items = [];
            _.forEach(this.props.details, item => {
                items.push(this.renderItem(item.label, item.value))
            })
        }

        let resultBlock;
        if (this.props.date && this.props.date.length === 0) {
            resultBlock = <View style={{marginTop: 25}}>
                <ActivityIndicator/>
            </View>
        } else {
            resultBlock = items;
        }

        return (
            <ScrollView style={{backgroundColor: "white"}}>
                <View style={styles.greenContainer}>
                    {Platform.OS === 'ios' ? <View style={{height: getStatusBarHeight()}}/> : null}
                    <Text style={styles.date}>{this.props.date}</Text>
                    <TouchableWithoutFeedback>
                        <Image style={styles.like} source={likeBigIcon}/>
                    </TouchableWithoutFeedback>
                    <Text style={styles.number}>{mainVal}</Text>
                    <Text style={styles.textUnderNum}>{mainText}</Text>
                </View>
                {resultBlock}
            </ScrollView>
        )
    }
}

const mapStateToProps = state => ({
    date: state.stats.date,
    main: state.stats.main,
    details: state.stats.details,
    failedVisits: state.stats.failedVisits,
    moderationSuccess: state.stats.moderationSuccess,
    moderationNew: state.stats.moderationNew,
    successVisits: state.stats.successVisits,
    moderationFailed: state.stats.moderationFailed
});

export default connect(mapStateToProps)(ResultsScene)


const styles = StyleSheet.create({
    greenContainer: {
        flexDirection: "column",
        backgroundColor: "#58c02f",
        alignItems: "center"
    },
    date: {
        height: 22,
        marginTop: 13,
        fontSize: 17,
        fontWeight: "600",
        fontStyle: "normal",
        lineHeight: 22,
        letterSpacing: -0.41,
        color: "#ffffff"
    },
    like: {
        marginTop: 27,
        tintColor: "white"
    },
    number: {
        marginTop: 10,
        fontSize: 70,
        fontWeight: "bold",
        fontStyle: "normal",
        color: "#ffffff"
    },
    textUnderNum: {
        fontSize: 18,
        marginBottom: 30,
        fontWeight: "600",
        fontStyle: "normal",
        color: "#28680e"
    },
    item: {
        height: 50,
        paddingRight: 16,
        marginLeft: 16,
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: "row",
        borderBottomWidth: 0.5,
        borderBottomColor: "#bcbbc1"
    },
    itemTitle: {
        fontSize: 17,
        fontWeight: "normal",
        fontStyle: "normal",
        color: "#000000"
    },
    blackText: {
        color: "#000000"
    },
    grayText: {
        color: "#cfcfcf"
    },
    itemValue: {
        fontSize: 17,
        fontWeight: "bold",
        fontStyle: "normal",
        color: "#000000"
    }
});