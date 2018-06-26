import React, {Component} from 'react';
import {View, StyleSheet, TextInput, Keyboard, ScrollView, Text, ActivityIndicator, Alert} from "react-native";
import {connect} from "react-redux";
import {feedbackNavigationOptions} from "../navigators/options";
import I18n from "react-native-i18n";
import GradientButton from "../component/GradientButton";
import {clearFeedbackError, sendFeedback} from "../actions/visist";
import {back} from "../actions/navigation"

class FeedbackScene extends Component {
    static navigationOptions = ({navigation}) => feedbackNavigationOptions(navigation);

    constructor() {
        super();
        this.state = {
            text: "",
            keyboardHeight: 0
        }
    }

    sendFeedback = async () => {
        if (this.state.text.length === 0) {
            return;
        }
        const {id} = this.props.navigation.state.params;
        const response = await this.props.sendFeedback(id, this.state.text);
        if (response !== null) {
            this.hideKeyboard();
            Alert.alert(I18n.t("error.attention"), I18n.t("feedback.success"));
            this.props.navigation.dispatch(back());
        } else {
            Alert.alert(I18n.t("error.attention"), I18n.t("feedback.error"));
            this.props.clearFeedbackError();
        }
    };

    componentDidMount() {
        Keyboard.addListener('keyboardWillShow', this.onShowKeyboard);
        Keyboard.addListener('keyboardWillHide', this.onHideKeyboard)
    }

    hideKeyboard = () => {
        Keyboard.dismiss();
    };

    onShowKeyboard = (data) => {
        this.setState({keyboardHeight: data.endCoordinates.height});
    };

    onHideKeyboard = (data) => {
        this.setState({keyboardHeight: 0});
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
                <TextInput multiline={true} underlineColorAndroid="transparent" placeholder={I18n.t("feedback.describe")}
                           onChangeText={this.changeText} value={this.state.text} autoFocus={true}
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

export default connect(mapStateToProps, {sendFeedback, clearFeedbackError})(FeedbackScene);

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