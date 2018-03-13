import React, { Component } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Text, Platform } from 'react-native';
import { Item, Input, Label } from 'native-base';
import { connect } from 'react-redux';
import { back, goToVisitDetails } from '../actions/navigation'
import { createVisit } from '../actions/visist'
import I18n from 'react-native-i18n'
import { createVisitsNavigationOptions } from "../navigators/options";
import GradientButton from "../component/GradientButton";
import { allowAction } from "../utils/util";

export class CreateVisitScene extends Component {

    static navigationOptions = ({navigation}) => createVisitsNavigationOptions(navigation);

    constructor(props) {
        super(props)
        this.state = {
            text: '',
        }
    }

    componentWillMount() {
        if (Platform.OS === 'ios') {
            navigator.geolocation.requestAuthorization();
        }
    }

    createVisit = () => {
        if (this.state.text.length === 0 || this.props.isFetch === true) {
            return;
        }
        if (allowAction("create_visit_process")) {
            this.props.createVisit(this.state.text)
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={{flex: 1, justifyContent: "flex-start"}}>
                    <Text style={styles.description}>{I18n.t("CreateVisit.description")}</Text>
                    <View style={styles.input}>
                        <Item floatingLabel>
                            <Label>{I18n.t('CreateVisit.label')}</Label>
                            <Input onChangeText={(text) => this.setState({text: text.replace(/[^0-9]/g, '')})}
                                   maxLength={9}
                                   keyboardType="numeric"
                                   value={this.state.text}
                                // disable = {this.props.isFetch}
                            />
                        </Item>
                    </View>
                    <View style={{marginTop: 10}}>
                        <GradientButton disable={this.state.text.length === 0 || this.props.isFetch === true}
                                        text={I18n.t('CreateVisit.createAction')}
                                        onPress={this.createVisit}/>
                    </View>
                </View>

                <KeyboardAvoidingView/>
            </View>
        )
    }
}

export default connect(state => {
    const {nav, visits} = state
    return {
        nav: nav,
        error: visits.error,
        isFetch: visits.isCreateFetch,
        result: visits.result
    }
}, {back, createVisit, goToVisitDetails})(CreateVisitScene)

const styles = StyleSheet.create({
    container: {
        flex: 2,
        justifyContent: "center",
        backgroundColor: "white"
    },
    input: {
        marginTop: 38,
        padding: 16
    },
    description: {
        marginTop: 45,
        width: 272,
        //fontFamily: "OpenSansRegular",
        fontSize: 15,
        fontWeight: "normal",
        fontStyle: "normal",
        letterSpacing: 0,
        textAlign: "center",
        alignSelf: "center",
        color: "#636363"
    },

    createBtn: {
        position: "absolute",
        bottom: 10,
        zIndex: 1
    },
    empty: {
        //backgroundColor: "red",
        backgroundColor: "white",
        justifyContent: 'center',
        alignItems: 'center'
    },
})
