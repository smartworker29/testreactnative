import React, {Component} from 'react'
import {View, StyleSheet, TouchableOpacity, ActivityIndicator, Text} from 'react-native'
import {Item, Label, Input} from 'native-base'
import I18n from 'react-native-i18n'
import {connect} from 'react-redux'
import {profileNavigationOptions} from '../navigators/options'
import {loadData, saveData, setName, setPathNumber, setPatronymic, setSurname} from '../actions/profile'
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import DeviceInfo from 'react-native-device-info';
import {allowAction, getDeviceInfo} from "../utils/util";
import {forceSync, setForceSync} from "../actions/app";

const styles = StyleSheet.create({
    item: {
        marginTop: 15,
    },
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
    input: {
        paddingLeft: 0,
        paddingBottom: 0,
        marginTop: 16,
        marginBottom: 10
    },
    container: {
        backgroundColor: 'white'
    },
    placeholder: {
        color: '#b4b4b4'
    },
    feedbackButton: {
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: "#cfcfcf",
        marginTop: 20,
        marginHorizontal: 16,
        justifyContent: "center"
    },
    feedbackText: {
        fontSize: 16,
        fontWeight: "600",
        fontStyle: "normal",
        letterSpacing: 0,
        textAlign: "center",
        color: "#b4b4b4"
    },
    statusRow: {
        marginTop: 15,
        alignItems: "center"
    },
    activity: {
        marginRight: 10
    },
    text: {
        textAlign: "center"
    }
});

class ProfileScene extends Component {

    static navigationOptions = ({navigation}) => profileNavigationOptions(navigation);

    constructor() {
        super();
        this.syncLock = false;
    }

    //
    // async componentWillMount() {
    //   // this.props.navigation.setParams({
    //   //   saveData: this.props.saveData,
    //   //   hasChanges: this.props.hasChanges
    //   // })
    //   //
    //   // await this.props.loadData()
    //
    // }

    async componentDidMount() {
        this.props.navigation.setParams({
            saveData: this.props.saveData,
            hasChanges: this.props.hasChanges
        });

        await this.props.loadData();
    }

    componentWillReceiveProps(props) {
        if (this.props.agentFetch !== props.agentFetch) {
            this.props.navigation.setParams({
                isFetch: props.agentFetch
            })
        }
    }

    onChangeSurname = (text) => {
        this.props.setSurname(text)
    };

    onChangeName = (text) => {
        this.props.setName(text)
    };

    onChangePatronymic = (text) => {
        this.props.setPatronymic(text)
    };

    onChangePathNumber = (text) => {
        this.props.setPathNumber(text)
    };

    showAgentId = () => {
        alert(this.props.agentId);
    };

    showDeviceInfo = async () => {
        alert(JSON.stringify(await getDeviceInfo()))
    };

    forceSync = async () => {
        if (this.syncLock === true) {
            return;
        }
        this.syncLock = true;
        await this.props.forceSync();
        this.syncLock = false;
    };

    renderForceSync() {
        const {isForceSync} = this.props;
        if (!this.props.agentId) {
            return null;
        }
        if (isForceSync === true) {
            return (
                <View>
                    <TouchableOpacity style={styles.feedbackButton} onPress={this.forceSync}>
                        <View style={{flexDirection: "row", alignItems: "center", justifyContent: "center"}}>
                            <ActivityIndicator size="small" style={styles.activity}/>
                            <Text style={styles.text}>{I18n.t("user_profile.sync")}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )
        }
        return (
            <View>
                <TouchableOpacity style={styles.feedbackButton} onPress={this.forceSync}>
                    <Text style={styles.feedbackText}>{I18n.t("user_profile.sync")}</Text>
                </TouchableOpacity>
            </View>
        )
    }

    render() {

        const {pins, pin} = this.props;
        const name = pins[pin].name;

        if (this.props.agentFetch === true) {
            const text = (this.props.agentId) ? I18n.t("user_profile.updateAgent") : I18n.t("user_profile.createAgent");
            return (
                <View style={styles.containerInfo}>
                    <ActivityIndicator size="small"/>
                    <Text style={styles.infoText}>{text}</Text>
                </View>
            );
        }

        return (
            <KeyboardAwareScrollView extraScrollHeight={100} style={styles.container} enableOnAndroid={true}>
                <View style={{flex: 1, padding: 16}}>
                    <Item floatingLabel style={styles.item}>
                        <Label style={{color: '#b4b4b4'}}>{I18n.t('settings.surname')}</Label>
                        <Input style={styles.input} onChangeText={this.onChangeSurname} value={this.props.surname}/>
                    </Item>

                    <Item floatingLabel style={styles.item}>
                        <Label style={{color: '#b4b4b4'}}>{I18n.t('settings.name')}</Label>
                        <Input style={styles.input} onChangeText={this.onChangeName} value={this.props.name}/>
                    </Item>

                    <Item floatingLabel style={styles.item}>
                        <Label style={{color: '#b4b4b4'}}>{I18n.t('settings.patronymic')}</Label>
                        <Input style={styles.input} onChangeText={this.onChangePatronymic}
                               value={this.props.patronymic}/>
                    </Item>

                    <Item floatingLabel style={styles.item}>
                        <Label style={{color: '#b4b4b4'}}>{I18n.t('settings.path_number')}</Label>
                        <Input style={styles.input} onChangeText={this.onChangePathNumber}
                               value={this.props.pathNumber}/>
                    </Item>
                    <TouchableOpacity onLongPress={this.showAgentId}>
                        <Text style={{
                            color: '#b4b4b4',
                            marginTop: 16
                        }}>{`${I18n.t('settings.build')} ${DeviceInfo.getBuildNumber()}`}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onLongPress={this.showDeviceInfo}>
                        <Text style={{
                            color: '#b4b4b4',
                            marginTop: 16
                        }}>{name}</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>
        )
    }
}

const mapStateToProps = state => ({
    name: state.profile.name,
    pins: state.auth.pins,
    pin: state.auth.pin,
    surname: state.profile.surname,
    patronymic: state.profile.patronymic,
    pathNumber: state.profile.pathNumber,
    contactNumber: state.profile.contactNumber,
    hasChanges: state.profile.hasChanges,
    agentId: state.auth.id,
    agentFetch: state.auth.agentFetch,
    visitSync: state.visits.syncProcess,
    photoSync: state.photo.syncProcess,
    isForceSync: state.app.isForceSync
});

export default connect(mapStateToProps, {
    saveData,
    loadData,
    setName,
    setSurname,
    setPatronymic,
    setPathNumber,
    forceSync
})(ProfileScene)


