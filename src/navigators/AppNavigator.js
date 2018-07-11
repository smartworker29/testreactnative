import React, {Component} from 'react';
import {addNavigationHelpers, StackNavigator, NavigationActions, TabNavigator} from 'react-navigation';
import {
    BackHandler,
    YellowBox,
    Linking,
    AppState,
    Alert,
    AlertIOS,
    Platform,
    StyleSheet,
    View,
    Text,
    TouchableOpacity
} from "react-native";
import {addListener} from '../utils/redux';
import {clearPhoto, photoInit, syncPhoto} from '../actions/photo'
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import MainScene from '../scenes/MainScene';
import VisitListScene from '../scenes/VisitListScene';
import VisitDetailScene from '../scenes/VisitDetailScene';
import CreateVisitScene from '../scenes/CreateVisitScene';
import PhotoScene from '../scenes/PhotoScene';
import ProfileScene from '../scenes/ProfileScene';
import PhotoViewScene from '../scenes/PhotoViewScene';
import EnterPinScene from '../scenes/EnterPinScene';
import TasksScene from '../scenes/TasksScene';
import ResultsScene from "../scenes/ResultsScene";

import {Toast} from "native-base";
import {initVisits, refreshVisitsList, syncVisitList} from "../actions/visist";
import {appInit, deleteOldPhoto, initFolders, updateDeviceInfo, updateRatioExceptions} from "../actions/app";
import {resetToList, resetToProfile} from "../actions/navigation";
import {authInit, initPins, setFetchPin, syncPins} from "../actions/auth";
import {loadData} from "../actions/profile";
import {getTasksList, initTasks} from "../actions/tasks";
import TaskScene from "../scenes/TaskScene";
import {getStatistics} from "../actions/stats";
import PreviewScene from "../scenes/PreviewScene";
import FeedbackScene from "../scenes/FeedbackScene";
import ErrorLogging from "../utils/Errors";
import I18n from "react-native-i18n";
import Permissions from 'react-native-permissions';
import OpenSettings from 'react-native-open-settings';
import GoogleAPIAvailability from 'react-native-google-api-availability-bridge';

YellowBox.ignoreWarnings([
    'Warning: componentWillMount is deprecated',
    'Warning: componentWillReceiveProps is deprecated',
    'Warning: componentWillUpdate is deprecated',
]);

const AppTabNavigator = TabNavigator({
    Tasks: {
        screen: TasksScene
    },
    Results: {
        screen: ResultsScene
    },
    VisitList: {
        screen: VisitListScene,
        key: "list",
    },
    Profile: {
        screen: ProfileScene,
        mode: 'modal'
    },
}, {
    tabBarPosition: "bottom",
    tabBarOptions: {
        renderIndicator: () => null,
        activeTintColor: '#C2071B',
        inactiveTintColor: "#8e8e93",
        upperCaseLabel: false,
        animationEnabled: false,
        showIcon: true,
        labelStyle: {
            fontSize: 9,
        },
        style: {
            borderTopWidth: 0.5,
            borderColor: "#B3B3B6",
            backgroundColor: "#F5F5F6",
        },
    }
});

export const AppNavigator = StackNavigator({
    VisitList: {
        screen: AppTabNavigator,
        key: "list"
    },
    VisitDetails: {
        screen: VisitDetailScene
    },
    CreateVisit: {
        screen: CreateVisitScene,
        mode: 'modal'
    },
    Task: {
        screen: TaskScene
    },
    Pin: {
        screen: EnterPinScene,
    },
    Photo: {
        screen: PhotoScene,
        navigationOptions: {
            header: null,
        }
    },
    PhotoView: {
        screen: PhotoViewScene,
    },
    Profile: {
        screen: ProfileScene,
        mode: 'modal'
    },
    Preview: {
        screen: PreviewScene
    },
    Feedback: {
        screen: FeedbackScene
    }
}, {
    // mode: 'modal',
});


class AppWithNavigationState extends Component {

    constructor() {
        super();

        this.state = {
            geo: null,
            checkGeo: false,
            service: null,
            platform: Platform.OS
        };

        AppState.addEventListener("change", async event => {
            if (event === "active") {
                if (this.state.checkGeo === false) {
                    await this.checkLocation();
                }
            }
        });
    }

    async checkLocation() {
        this.setState({checkGeo: true}, async () => {
            const status = await Permissions.request('location');
            if (this.state.platform === "android") {
                GoogleAPIAvailability.checkGooglePlayServices((result) => {
                    this.setState({service: result});
                });
            }
            this.setState({geo: status, checkGeo: false});
        });
    }

    async init() {
        await this.props.dispatch(appInit());
        await this.props.dispatch(authInit());
        await this.props.dispatch(initTasks());
        await this.props.dispatch(initVisits());
        await this.props.dispatch(deleteOldPhoto());
        await this.props.dispatch(photoInit());
        await this.props.dispatch(loadData());
        await this.props.dispatch(updateDeviceInfo());

        setInterval(async () => {
            await this.props.dispatch(updateDeviceInfo());
        }, 300000);

        if (this.props.authId === null || this.props.pathNumber.length === 0) {
            this.props.dispatch(resetToProfile());
        } else {
            await this.props.dispatch(resetToList());
        }
    }

    async componentDidMount() {
        await this.checkLocation();
        await this.props.dispatch(initFolders());
        await this.props.dispatch(initPins());
        //await this.props.dispatch(updateRatioExceptions());
        BackHandler.addEventListener('hardwareBackPress', this.onBackPress);

        this.intervalSyncPins = setInterval(async () => {
            await this.props.dispatch(syncPins());
        }, 7000);

        setInterval(() => {
            ErrorLogging.save();
        }, 5000);
    }

    async componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
    }

    async componentWillReceiveProps(props) {

        if (props.pin !== null && this.props.pin !== props.pin) {
            await this.init();
            this.props.dispatch(setFetchPin(false));
        }

        if (this.props.authId !== props.authId && this.props.dispatch) {
            clearInterval(this.intervalSyncPins);

            await this.props.dispatch(refreshVisitsList(true));

            setInterval(async () => {
                await this.props.dispatch(syncVisitList());
            }, 2000);

            setInterval(async () => {
                await this.props.dispatch(syncPhoto());
            }, 2000);

            setInterval(async () => {
                await this.props.dispatch(refreshVisitsList(false));
            }, 7000);

            setInterval(async () => {
                await this.props.dispatch(getTasksList());
            }, 7000);

            setInterval(async () => {
                await this.props.dispatch(getStatistics());
            }, 7000);

            setInterval(async () => {
                await this.props.dispatch(syncPins());
            }, 7000);
        }
    }

    onBackPress = () => {
        const {dispatch, nav} = this.props;
        if (nav.index === 0) {
            return false;
        }
        dispatch(NavigationActions.back());
        return true;
    };

    render() {
        const {dispatch, nav} = this.props;

        if (this.state.geo === null) {
            return null;
        }

        if (this.state.platform === "android" && this.state.service === null) {
            return null;
        }

        if (this.state.platform === "android" && (this.state.service === "failure" || this.state.service === "invalid")) {
            return (
                <View style={styles.containerInfo}>
                    <Text style={styles.deleteText}>{I18n.t("overScreen.notInstall")}</Text>
                    <Text style={styles.deleteText}>{"Google Play Services"}</Text>
                    <TouchableOpacity onPress={() => {
                        GoogleAPIAvailability.promptGooglePlayUpdate(false);
                    }}>
                        <Text style={styles.link}>{I18n.t("overScreen.install")}</Text>
                    </TouchableOpacity>
                </View>
            )
        }

        if (this.state.platform === "android" && (this.state.service === "update")) {
            return (
                <View style={styles.containerInfo}>
                    <Text style={styles.deleteText}>{I18n.t("overScreen.needUpdate")}</Text>
                    <Text style={styles.deleteText}>{"Google Play Services"}</Text>
                    <TouchableOpacity onPress={() => {
                        GoogleAPIAvailability.promptGooglePlayUpdate(false);
                    }}>
                        <Text style={styles.link}>{I18n.t("overScreen.update")}</Text>
                    </TouchableOpacity>
                </View>
            )
        }

        if (this.state.platform === "android" && (this.state.service === "disabled")) {
            return (
                <View style={styles.containerInfo}>
                    <Text style={styles.deleteText}>{I18n.t("overScreen.offService")}</Text>
                    <Text style={styles.deleteText}>{"Google Play Services"}</Text>
                    <TouchableOpacity onPress={() => {
                        GoogleAPIAvailability.promptGooglePlayUpdate(false);
                    }}>
                        <Text style={styles.link}>{I18n.t("overScreen.onService")}</Text>
                    </TouchableOpacity>
                </View>
            )
        }

        if (this.state.geo === "denied" || this.state.geo === "restricted") {
            return (
                <View style={styles.containerInfo}>
                    <Text style={styles.deleteText}>{I18n.t("overScreen.geoOff")}</Text>
                    <Text style={styles.deleteText}>{I18n.t("overScreen.startGeoInSettings")}</Text>
                    <TouchableOpacity onPress={() => {
                        if (Platform.OS === "ios") {
                            Linking.openURL('app-settings:');
                        } else {
                            OpenSettings.openSettings();
                        }
                    }}>
                        <Text style={styles.link}>{I18n.t("overScreen.goToSettings")}</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <AppNavigator
                navigation={addNavigationHelpers({
                    dispatch,
                    state: nav,
                    addListener,
                })}
            />
        );
    }

}

AppWithNavigationState.propTypes = {
    dispatch: PropTypes.func.isRequired,
    nav: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
    pin: state.auth.pin,
    nav: state.nav,
    error: state.app.error,
    seed: state.app.errorSeed,
    authId: state.auth.id,
    pathNumber: state.profile.pathNumber,
    isForceSync: state.app.isForceSync
});

export default connect(mapStateToProps)(AppWithNavigationState);

const styles = StyleSheet.create({
    containerPhoto: {
        flex: 1,
        backgroundColor: "black"
    },
    containerInfo: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    image: {
        flex: 1
    },
    deleteText: {
        fontSize: 20,
        color: "black",
        fontWeight: "bold"
    },
    link: {
        marginTop: 20,
        fontWeight: "bold",
        fontSize: 20,
        color: "blue",
    }
});
