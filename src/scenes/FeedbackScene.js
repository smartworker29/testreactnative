import React, {Component} from 'react';
import {View, StyleSheet, TextInput, Keyboard, ScrollView} from "react-native";
import {connect} from "react-redux";
import {feedbackNavigationOptions} from "../navigators/options";
import I18n from "react-native-i18n";
import GradientButton from "../component/GradientButton";
import {sendFeedback} from "../actions/visist";
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

    sendFeedback = () => {
        if (this.state.text.length === 0) {
            return;
        }
        const {id} = this.props.navigation.state.params;
        this.props.sendFeedback(id, this.state.text);
        this.props.navigation.dispatch(back());
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
        this.setState({keyboardHeight: data.endCoordinates.height});
    };

    changeText = (text) => {
        this.setState({text})
    };

    render() {
        const padding = {bottom: 10 + this.state.keyboardHeight};
        return (
            <View style={styles.container}>
                <TextInput multiline={true} underlineColorAndroid="transparent" placeholder="Опишите ситуацию"
                           onChangeText={this.changeText} value={this.state.text} autoFocus={true}
                           style={styles.textContainer}/>
                <GradientButton style={[styles.takePhotoBtn, padding]} text={I18n.t('feedback.send')}
                                onPress={this.sendFeedback}/>
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    return {}
};

export default connect(mapStateToProps, {sendFeedback})(FeedbackScene);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white"
    },
    textContainer: {
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