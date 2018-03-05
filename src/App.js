import React, { Component } from 'react'
import { Provider } from 'react-redux'
import { Root } from 'native-base'
import { configureStore } from './configStore'
import AppWithNavigationState from './navigators/AppNavigator'
import I18n from 'react-native-i18n'
import en from '../locales/en'
import ru from '../locales/ru'
import { StatusBar } from 'react-native'

const currentLocale = I18n.currentLocale()

const store = configureStore()

export default class App extends Component {
  render () {
    return (
      <Root>
        <Provider store={store}>
          <AppWithNavigationState/>
        </Provider>
      </Root>
    )
  }
}

// Should the app fallback to English if user locale doesn't exists
I18n.fallbacks = true

// Define the supported locales
I18n.translations = {
  en,
  ru
}
