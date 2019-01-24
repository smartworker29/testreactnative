import React, {Component} from 'react';
import {View, StyleSheet, TextInput, Keyboard, ScrollView, Text, ActivityIndicator, Alert} from "react-native";
import {connect} from "react-redux";
import {feedbackNavigationOptions} from "../navigators/options";
import I18n from "react-native-i18n";
import GradientButton from "../component/GradientButton";
import {clearFeedbackError, sendFeedback} from "../actions/visist";
import {back, backToDetails} from "../actions/navigation"
import {updateDeviceInfo} from "../actions/app";
import uuidv4 from 'uuid/v4';

class FeedbackScene extends Component {
    static navigationOptions = ({navigation}) => feedbackNavigationOptions(navigation);

    constructor() {
        super();
        this.state = {
            focus: true,
            text: "",
            keyboardHeight: 0,
            uuid: null
        }
    }

    timeout = () => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve()
            }, 3000)
        })
    };

    sendFeedback = async () => {
        if (this.state.text.length === 0) {
            return;
        }
        this.hideKeyboard();
        const {id, category} = this.props.navigation.state.params;
        try {
            await this.props.sendFeedback(id, this.state.text, category === 'APP_ERROR', category, this.state.uuid);
        } catch (error) {
            Alert.alert("Ошибка", error.message)
        }
        this.props.navigation.pop(2)
    };

    componentDidMount() {
        Keyboard.addListener('keyboardWillShow', this.onShowKeyboard);
        Keyboard.addListener('keyboardWillHide', this.onHideKeyboard);
        this.setState({uuid: uuidv4()})
    }

    hideKeyboard = () => {
        Keyboard.dismiss();
    };

    onShowKeyboard = (data) => {
        this.setState({keyboardHeight: data.endCoordinates.height});
    };

    onHideKeyboard = (data) => {
        this.setState({keyboardHeight: 0, focus: false});
    };

    changeText = (text) => {
        this.setState({text})
    };

    render() {
        const padding = {bottom: 10 + this.state.keyboardHeight};
        const indicator = (this.props.isFetch) ? <ActivityIndicator size="small"/> : null;

        if (this.props.isFetch) {
            const text = (this.props.error) ? this.props.error : I18n.t("feedback.request");
            return (
                <View style={styles.containerInfo}>
                    {indicator}
                    <Text style={styles.infoText}>{text}</Text>
                </View>
            );
        }

        return (
            <View style={styles.container}>
                <TextInput multiline={true} underlineColorAndroid="transparent"
                           placeholder={I18n.t("feedback.describe")}
                           onChangeText={this.changeText} value={this.state.text} autoFocus={this.state.focus}
                           style={styles.textContainer}/>
                <GradientButton style={[styles.takePhotoBtn, padding]} text={I18n.t('feedback.send')}
                                onPress={this.sendFeedback}/>
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        isFetch: state.feedback.isFetch,
        error: state.feedback.error
    }
};

export default connect(mapStateToProps, {sendFeedback, clearFeedbackError, updateDeviceInfo})(FeedbackScene);

const styles = StyleSheet.create({
    containerInfo: {
        flex: 1,
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center"
    },
    infoText: {
        color: "black",
        marginTop: 20
    },
    container: {
        flex: 1,
        backgroundColor: "white"
    },
    textContainer: {
        height: 150,
        padding: 16,
        marginTop: 16
    },
    takePhotoBtn: {
        flex: 1,
        alignSelf: "center",
        position: 'absolute',
        zIndex: 1
    }
});