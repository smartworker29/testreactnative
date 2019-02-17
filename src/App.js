import React, {Component} from 'react'
import {Provider} from 'react-redux'
import {Root} from 'native-base'
import I18n from 'react-native-i18n'
import DeviceInfo from 'react-native-device-info'
import Orientation from "react-native-orientation";
import {Sentry} from 'react-native-sentry'
import codePush from "react-native-code-push";

import en from '../locales/en'
import ru from '../locales/ru'

import {configureStore} from './configStore'
import AppWithNavigationState from './navigators/AppNavigator'

import ErrorBoundary from './component/ErrorBoundary'

const dsn = 'https://11d80528d8d744ce9098692402b0339f@sentry.inspector-cloud.ru/6'
let codePushOptions = { checkFrequency: codePush.CheckFrequency.ON_APP_RESUME };

const setupSentry = () => {
  Sentry.config(dsn).install()
  addBuildContext()
}

const addBuildContext = () => {
  Sentry.setTagsContext({
    appVersion: DeviceInfo.getVersion(),
    buildNumber: DeviceInfo.getBuildNumber(),
    deviceInfo: {
      systemName: DeviceInfo.getSystemName(),
      systemVersion: DeviceInfo.getSystemVersion(),
      deviceName: DeviceInfo.getDeviceName()
    }
  })
}

if (!__DEV__) {
  setupSentry();
}

const currentLocale = I18n.currentLocale();

const store = configureStore();

class MyApp extends React.Component {

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

const App = codePush(codePushOptions)(MyApp);
export default App;

// Should the app fallback to English if user locale doesn't exists
I18n.fallbacks = true;

// Define the supported locales
I18n.translations = {
  en,
  ru
};
