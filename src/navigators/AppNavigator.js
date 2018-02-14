import React, {Component} from 'react';
import {addNavigationHelpers, StackNavigator, NavigationActions} from 'react-navigation';
import {BackHandler} from "react-native";
import {addListener} from '../utils/redux';
import {clearPhoto} from '../actions/photo'
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import MainScene from '../scenes/MainScene';
import VisitListScene from '../scenes/VisitListScene';
import VisitDetailScene from '../scenes/VisitDetailScene';
import CreateVisitScene from '../scenes/CreateVisitScene';
import PhotoScene from '../scenes/PhotoScene';
import SettingsScene from '../scenes/SettingsScene';
import photo from "../reducer/photo";

export const AppNavigator = StackNavigator({
    Main: {screen: MainScene},
    VisitList: {
        screen: VisitListScene,
        navigationOptions: {
            header: null,
        }
    },
    VisitDetails: {
        screen: VisitDetailScene,
        navigationOptions: {
            header: null,
        }
    },
    CreateVisit: {
        screen: CreateVisitScene,
        navigationOptions: {
            header: null,
        }
    },
    Photo: {
        screen: PhotoScene,
        navigationOptions: {
            header: null,
        }
    },
    Settings: {
        screen: SettingsScene,
        navigationOptions: {
            header: null,
        }
    },
}, {
    // mode: 'modal',
});


class AppWithNavigationState extends Component {
    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
    }

    onBackPress = () => {
        const {dispatch, nav} = this.props;
        if (nav.index === 0) {
            return false;
        }
        // this.props.clearPhoto()
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
});

export default connect(mapStateToProps, )(AppWithNavigationState);
