import React, { Component } from 'react';
import { addNavigationHelpers, StackNavigator, NavigationActions } from 'react-navigation';
import { BackHandler, YellowBox } from "react-native";
import { addListener } from '../utils/redux';
import { clearPhoto, photoInit, syncPhoto } from '../actions/photo'
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import MainScene from '../scenes/MainScene';
import VisitListScene from '../scenes/VisitListScene';
import VisitDetailScene from '../scenes/VisitDetailScene';
import CreateVisitScene from '../scenes/CreateVisitScene';
import PhotoScene from '../scenes/PhotoScene';
import ProfileScene from '../scenes/ProfileScene';
import PhotoViewScene from '../scenes/PhotoViewScene';
import EnterPinScene from '../scenes/EnterPinScene';
import { Toast } from "native-base";
import { initVisits, refreshVisitsList, syncVisitList } from "../actions/visist";
import { appInit, setSyncTime } from "../actions/app";
import I18n from "react-native-i18n";
import { resetToList, resetToPin, resetToProfile } from "../actions/navigation";
import { authInit, initPins, setFetchPin, syncPins } from "../actions/auth";
import { loadData } from "../actions/profile";
import { AsyncStorage } from "react-native";

YellowBox.ignoreWarnings([
    'Warning: componentWillMount is deprecated',
    'Warning: componentWillReceiveProps is deprecated',
    'Warning: componentWillUpdate is deprecated',
]);

export const AppNavigator = StackNavigator({
    Main: {screen: MainScene},
    VisitList: {
        screen: VisitListScene,
        key: "list"
    },
    VisitDetails: {
        screen: VisitDetailScene,

    },
    CreateVisit: {
        screen: CreateVisitScene,
        mode: 'modal'
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
}, {
    // mode: 'modal',
});


class AppWithNavigationState extends Component {

    constructor() {
        super()
    }


    async init() {
        await this.props.dispatch(appInit());
        await this.props.dispatch(authInit());
        await this.props.dispatch(initVisits());
        await this.props.dispatch(photoInit());
        await this.props.dispatch(loadData());

        if (this.props.authId === null || this.props.pathNumber.length === 0) {
            this.props.dispatch(resetToProfile());
        } else {
            await this.props.dispatch(resetToList());
        }
    }


    async componentDidMount() {
        await this.props.dispatch(initPins());
        if (this.props.pin === null) {
            return this.props.dispatch(resetToPin());
        }
        BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
    }

    async sync() {
        await this.props.dispatch(syncVisitList());
        await this.props.dispatch(syncPhoto());
        await this.props.dispatch(refreshVisitsList(false));
        await this.props.dispatch(syncPins());
        this.props.dispatch(setSyncTime());
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
            await this.props.dispatch(refreshVisitsList(true));
            setInterval(async () => {
                await this.sync();
            }, 2000)
        }

        if (this.props.error !== props.error || this.props.seed !== props.seed) {
            Toast.show({
                text: props.error,
                position: 'bottom',
                buttonText: null
            });
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
});

export default connect(mapStateToProps)(AppWithNavigationState);
