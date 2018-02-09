import React, {Component} from 'react';
import {addNavigationHelpers, StackNavigator, NavigationActions} from 'react-navigation';
import {BackHandler} from "react-native";
import { addListener } from '../utils/redux';

import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import MainScene from '../scenes/MainScene';
import VisitListScene from '../scenes/VisitListScene';

export const AppNavigator = StackNavigator(
    {
        Main: {
            screen: MainScene,
            navigationOptions: {
                header: null,
            }
        },
        VisitList:{
            screen: VisitListScene,
            navigationOptions: {
                header: null,
            }

        }

    },{
        headerMode: 'none',
        // initialRouteName: 'Main',
    }
)

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
        dispatch(NavigationActions.back());
        return true;
    };


    render() {
        const { dispatch, nav } = this.props;
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

export default connect(mapStateToProps)(AppWithNavigationState);
