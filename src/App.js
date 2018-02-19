/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {Component} from 'react';
import {Provider} from 'react-redux';
import {Root} from 'native-base'
import {configureStore} from './configStore'
import AppWithNavigationState from './navigators/AppNavigator'
import {NetInfo} from 'react-native'
import * as types from './actions/app'
import I18n from 'react-native-i18n';
import en from '../locales/en';
import ru from '../locales/ru';


const currentLocale = I18n.currentLocale();

const store = configureStore();

export default class App extends Component {
    // componentDidMount() {
    //     NetInfo.isConnected.addEventListener('change', this._handleConnectionChange);
    // }
    //
    // componentWillUnmount() {
    //     NetInfo.isConnected.removeEventListener('change', this._handleConnectionChange);
    // }
    //
    // _handleConnectionChange = (isConnected) => {
    //     const { dispatch, actionQueue } = this.props;
    //     dispatch(store.dispatch({ type:types.CHANGE_CONNECTION_STATUS,payload: isConnected }));
    //
    //
    // };
    render() {
        return (
            <Root>
                <Provider store={store}>
                    <AppWithNavigationState/>

                </Provider>
            </Root>
        );
    }
}

// Should the app fallback to English if user locale doesn't exists
I18n.fallbacks = true;

// Define the supported locales
I18n.translations = {
    en,
    ru
};

