import React, { Component } from 'react'
import { backIcon, closeIcon, doneIcon, profileIcon } from '../utils/images'
import Styles from '../utils/styles'
import I18n from 'react-native-i18n'
import { ActivityIndicator, Image, TouchableOpacity, View } from 'react-native'
import * as NavigationActions from '../actions/navigation'
import { backToList } from '../actions/navigation'
import { allowAction } from "../utils/util";

const getNavParam = (navigation, param) => {
    return (navigation.state.params === undefined) ? false : navigation.state.params[param]
}

export const visitsNavigationOptions = (navigation) => {
    return {
        title: I18n.t('visits_list.title'),
        headerStyle: Styles.headerStyle,

        headerRight: (
            <View style={{flexDirection: 'row'}}>
                <TouchableOpacity style={Styles.navBarIconAreaRight} onPress={() => {
                    if (allowAction("profile")) {
                        navigation.state.params.handleProfile()
                    }
                }}>
                    <Image resizeMode="contain" source={profileIcon}/>
                </TouchableOpacity>
            </View>
        ),
        headerTitleStyle: Styles.headerTitleStyle,
        drawerLockMode: 'unlocked'
    }
}

export const pinNavigationOptions = (navigation) => {
    return {
        header: null
    }
}

export const profileNavigationOptions = (navigation) => {

    let isLock = false

    if (navigation.state.params) {
        isLock = navigation.state.params.lock
    }

    const headerLeft = (isLock === true) ? null : (
        <TouchableOpacity style={Styles.navBarIconAreaLeft}
                          onPress={() => navigation.dispatch(NavigationActions.back())}>
            <Image resizeMode="contain" source={closeIcon}/>
        </TouchableOpacity>
    );

    const headerRight = (
        <TouchableOpacity style={Styles.navBarIconAreaRight} onPress={() => {
            navigation.state.params.saveData(NavigationActions.back())
        }}>
            <Image resizeMode="contain" source={doneIcon}/>
        </TouchableOpacity>
    )

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
    const {tmp, sync} = navigation.state.params;
    let id = (!navigation.state.params.id || tmp === true) ? '- - -' : navigation.state.params.id;
    if (sync && sync[navigation.state.params.id] !== undefined) {
        id = sync[navigation.state.params.id];
    }
    return {
        title: `${I18n.t('visitDetail.title')} № ${id}`,
        headerStyle: Styles.headerStyle,
        headerLeft: (
            <TouchableOpacity
                style={Styles.navBarIconAreaLeft}
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
        headerBackImage: {closeIcon},
        headerLeft: (
            <TouchableOpacity
                style={Styles.navBarIconAreaLeft}
                onPress={() => navigation.dispatch(NavigationActions.back())}>
                <Image resizeMode="contain" source={closeIcon}/>
            </TouchableOpacity>
        ),
        headerTitleStyle: Styles.headerTitleStyle,
        drawerLockMode: 'unlocked',
    }
}


