import React, {Component} from 'react'
import {Provider} from 'react-redux'
import {Root} from 'native-base'
import {configureStore} from './configStore'
import AppWithNavigationState from './navigators/AppNavigator'
import I18n from 'react-native-i18n'
import en from '../locales/en'
import ru from '../locales/ru'
import Orientation from "react-native-orientation";
import {Sentry} from 'react-native-sentry'
import ErrorBoundary from './component/ErrorBoundary'

if (!__DEV__) {
  Sentry.config('https://11d80528d8d744ce9098692402b0339f@sentry.inspector-cloud.ru//6').install();
}
const currentLocale = I18n.currentLocale();

const store = configureStore();

export default class App extends React.Component {

  componentDidMount() {
    Orientation.lockToPortrait();
  }

  render() {
    return (
      <Provider store={store}>
        <ErrorBoundary>
          <Root>
            <AppWithNavigationState/>
          </Root>
        </ErrorBoundary>
      </Provider>
    )
  }
}

// Should the app fallback to English if user locale doesn't exists
I18n.fallbacks = true;

// Define the supported locales
I18n.translations = {
  en,
  ru
};
