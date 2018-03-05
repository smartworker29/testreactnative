import React, {Component} from 'react';
import {addNavigationHelpers, StackNavigator, NavigationActions} from 'react-navigation';
import {BackHandler, AsyncStorage} from "react-native";
import {addListener} from '../utils/redux';
import {clearPhoto, syncPhoto} from '../actions/photo'
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import MainScene from '../scenes/MainScene';
import VisitListScene from '../scenes/VisitListScene';
import VisitDetailScene from '../scenes/VisitDetailScene';
import CreateVisitScene from '../scenes/CreateVisitScene';
import PhotoScene from '../scenes/PhotoScene';
import ProfileScene from '../scenes/ProfileScene';
import {Toast} from "native-base";
import {getVisitsList, initVisits, refreshVisitsList, syncVisitList} from "../actions/visist";
import {appInit, setSyncTime} from "../actions/app";
import I18n from "react-native-i18n";
import {resetToProfile} from "../actions/navigation";
import {authInit} from "../actions/auth";

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
    Photo: {
        screen: PhotoScene,
        navigationOptions: {
            header: null,
        }
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

    async componentWillMount() {
        await this.props.dispatch(appInit());
        await this.props.dispatch(authInit());

        if (this.props.authId === null) {
            this.props.dispatch(resetToProfile());
        }
    }

    async componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
    }

    async sync() {
        await this.props.dispatch(syncVisitList());
        await this.props.dispatch(syncPhoto());
        await this.props.dispatch(refreshVisitsList(false));
        this.props.dispatch(setSyncTime());
    }

    async componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
    }

    async componentWillReceiveProps(props) {

        if (this.props.authId !== props.authId && this.props.dispatch) {
            await this.props.dispatch(initVisits());
            await this.props.dispatch(refreshVisitsList(false));

            setInterval(async () => {
                await this.sync();
            }, 15000)
        }


        if (this.props.error !== props.error) {
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
    nav: state.nav,
    error: state.app.error,
    authId: state.auth.id
});

export default connect(mapStateToProps)(AppWithNavigationState);
