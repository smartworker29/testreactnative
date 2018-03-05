import React, {Component} from 'react'
import {backIcon, closeIcon, doneIcon, profileIcon} from '../utils/images'
import Styles from '../utils/styles'
import I18n from 'react-native-i18n'
import {ActivityIndicator, Image, TouchableOpacity, View} from 'react-native'
import * as NavigationActions from '../actions/navigation'
import {backToList} from '../actions/navigation'

const getNavParam = (navigation, param) => {
  return (navigation.state.params === undefined) ? false : navigation.state.params[param]
}

export const visitsNavigationOptions = (navigation) => {
  return {
    title: I18n.t('visits_list.title'),
    headerStyle: Styles.headerStyle,

    headerRight: (
      <View style={{flexDirection: 'row'}}>
        <TouchableOpacity style={Styles.navBarIconArea} onPress={() => navigation.state.params.handleProfile()}>
          <Image resizeMode="contain" source={profileIcon}/>
        </TouchableOpacity>
      </View>
    ),
    headerTitleStyle: Styles.headerTitleStyle,
    drawerLockMode: 'unlocked'
  }
}

export const profileNavigationOptions = (navigation) => {

  let hasChanges = false
  let isLock = false

  if (navigation.state.params) {
    hasChanges = navigation.state.params.hasChanges
    isLock = navigation.state.params.lock
  }

  const headerLeft = (!isLock) ? (
    <TouchableOpacity style={Styles.navBarIconArea} onPress={() => navigation.dispatch(NavigationActions.back())}>
      <Image resizeMode="contain" source={closeIcon}/>
    </TouchableOpacity>
  ) : null

  const headerRight = (hasChanges) ? (
    <TouchableOpacity style={Styles.navBarIconArea} onPress={() => {
      navigation.state.params.saveData()
      return navigation.dispatch(NavigationActions.back())
    }}>
      <Image resizeMode="contain" source={doneIcon}/>
    </TouchableOpacity>
  ) : null

  return {
    title: I18n.t('user_profile.title'),
    headerStyle: Styles.headerStyle,
    headerLeft,
    headerTitleStyle: Styles.headerTitleStyle,
    drawerLockMode: 'unlocked',
    headerRight
  }
}

export const visitNavigationOptions = (navigation) => {
  const tmp = navigation.state.params.tmp;
  let id = (!navigation.state.params.id || tmp === true) ? '- - -' : navigation.state.params.id;
  return {
    title: `${I18n.t('visitDetail.title')} № ${id}`,
    headerStyle: Styles.headerStyle,
    headerLeft: (
      <TouchableOpacity style={Styles.navBarIconArea}
                        onPress={() => navigation.dispatch(NavigationActions.back())}>
        <Image resizeMode="contain" source={backIcon}/>
      </TouchableOpacity>
    ),
    headerTitleStyle: Styles.headerTitleStyle,
    drawerLockMode: 'unlocked',
  }
}

export const createVisitsNavigationOptions = (navigation) => {
  return {
    title: I18n.t('CreateVisit.title'),
    headerStyle: Styles.headerStyle,
    headerLeft: (
      <TouchableOpacity style={Styles.navBarIconArea}
                        onPress={() => navigation.dispatch(NavigationActions.back())}>
        <Image resizeMode="contain" source={closeIcon}/>
      </TouchableOpacity>
    ),
    headerTitleStyle: Styles.headerTitleStyle,
    drawerLockMode: 'unlocked',
  }
}


