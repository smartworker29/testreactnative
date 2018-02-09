/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import  React, {Component} from 'react';
import MainScene from './scenes/MainScene';
import {Provider} from 'react-redux';
import {configureStore} from './configStore'
import AppWithNavigationState from './navigators/AppNavigator'

const store = configureStore();

export default class App extends Component {
  render() {
    return(
        <Provider store={store}>
            {/*<MainScene/>*/}
            <AppWithNavigationState/>

        </Provider>
        );
  }
}

