import React, {Component} from 'react'
import {Keyboard, Alert} from 'react-native';
import {
    backIcon,
    closeIcon, deleteIcon,
    doneIcon, profileActiveIcon,
    profileIcon, reportsActiveIcon,
    reportsIcon, resultsActiveIcon,
    resultsIcon,
    tasksActiveIcon,
    tasksIcon
} from '../utils/images'
import Styles from '../utils/styles'
import I18n from 'react-native-i18n'
import {Image, TouchableOpacity, View} from 'react-native'
import * as NavigationActions from '../actions/navigation'
import {allowAction} from "../utils/util";

const getNavParam = (navigation, param) => {
    return (navigation.state.params === undefined) ? false : navigation.state.params[param]
};

export const visitsNavigationOptions = (navigation) => {
    return {
        title: I18n.t('visits_list.title'),
        headerStyle: Styles.headerStyle,

        tabBarLabel: I18n.t("tabBar.reports"),
        headerTitleStyle: Styles.headerTitleStyle,
        drawerLockMode: 'unlocked',
        tabBarIcon: (args) => {
            const icon = (args.focused === true) ? reportsActiveIcon : reportsIcon;
            return <Image source={icon}/>
        },
    }
};

export const pinNavigationOptions = (navigation) => {
    return {
        header: null
    }
};

export const tasksNavigationOptions = (navigation) => {
    return {
        title: I18n.t('tabBar.tasks'),
        headerTitleStyle: Styles.headerTitleStyle,
        tabBarLabel: I18n.t('tabBar.tasks'),
        tabBarIcon: (args) => {
            const icon = (args.focused === true) ? tasksActiveIcon : tasksIcon;
            return <Image source={icon}/>
        },
    }
};

export const taskNavigationOptions = (navigation) => {
    const headerLeft = (
        <TouchableOpacity style={Styles.navBarIconAreaLeft} onPress={() => {
            navigation.dispatch(NavigationActions.back())
        }}>
            <Image resizeMode="contain" source={backIcon}/>
        </TouchableOpacity>
    );
    return {
        title: I18n.t('task.title'),
        headerTitleStyle: Styles.headerTitleStyle,
        headerLeft,
        backTitle: null
    }
};

export const resultsNavigationOptions = (navigation) => {

    return {
        title: I18n.t('tabBar.results'),
        header: null,
        tabBarLabel: I18n.t('tabBar.results'),
        tabBarIcon: (args) => {
            const icon = (args.focused === true) ? resultsActiveIcon : resultsIcon;
            return <Image source={icon}/>
        },
    }
};

export const profileNavigationOptions = (navigation) => {

    let isFetch = true;

    if (navigation.state.params) {
        isFetch = navigation.state.params.isFetch;
    }

    const headerRight = (
        <TouchableOpacity style={Styles.navBarIconAreaRight} onPress={() => {
            if (allowAction("saveProfileData")) {
                Keyboard.dismiss();
                navigation.state.params.saveData(NavigationActions.back())
            }
        }}>
            <Image resizeMode="contain" source={doneIcon}/>
        </TouchableOpacity>
    );

    return {
        title: I18n.t('user_profile.title'),
        headerStyle: Styles.headerStyle,
        tabBarLabel: I18n.t('tabBar.profile'),
        headerTitleStyle: Styles.headerTitleStyle,
        drawerLockMode: 'unlocked',
        headerRight: (isFetch !== true) ? headerRight : null,
        tabBarIcon: (args) => {
            const icon = (args.focused === true) ? profileActiveIcon : profileIcon;
            return <Image source={icon}/>
        },
    }
};

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
};

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
};

const alertQuestion = (deleteHandler, currentPhotoUri, photoId) => {
    Alert.alert(
        'Внимание',
        'Удалить фотографию?',
        [
            {
                text: 'Да', onPress: () => {
                    deleteHandler(currentPhotoUri, photoId);
                }
            },
            {
                text: 'Нет', onPress: () => {
                }
            },
        ],
        {cancelable: false}
    )
};

export const previewNavigationOptions = (navigation) => {
    const {deleteHandler, count, index, currentPhotoUri, photoId} = navigation.state.params;
    return {
        title: `${index + 1} из ${count}`,
        headerStyle: Styles.headerStyleDark,
        headerLeft: (
            <TouchableOpacity
                style={Styles.navBarIconAreaLeft}
                onPress={() => navigation.dispatch(NavigationActions.back())}>
                <Image resizeMode="contain" source={backIcon} style={{tintColor: "white"}}/>
            </TouchableOpacity>
        ),
        headerRight: (
            deleteHandler !== undefined ?
                <TouchableOpacity
                    style={Styles.navBarIconAreaRight}
                    onPress={() => {
                        alertQuestion(deleteHandler, currentPhotoUri, photoId)
                    }}>
                    <Image resizeMode="contain" source={deleteIcon} style={{tintColor: "white"}}/>
                </TouchableOpacity> : null
        ),
        headerTitleStyle: [Styles.headerTitleStyle, {color: "white"}],
    }
};

export const feedbackNavigationOptions = (navigation) => {
    return {
        title: I18n.t('feedback.title'),
        headerLeft: (
            <TouchableOpacity
                style={Styles.navBarIconAreaLeft}
                onPress={() => navigation.dispatch(NavigationActions.back())}>
                <Image resizeMode="contain" source={backIcon}/>
            </TouchableOpacity>
        ),
        headerTitleStyle: Styles.headerTitleStyle,
    }
};

export const syncNavigationOptions = (navigation) => {
    return {
        title: `${I18n.t('sync.title')}`,
        headerLeft: (
            <TouchableOpacity
                style={Styles.navBarIconAreaLeft}
                onPress={() => navigation.dispatch(NavigationActions.back())}>
                <Image resizeMode="contain" source={backIcon}/>
            </TouchableOpacity>
        ),
        headerStyle: Styles.headerStyle,
        headerTitleStyle: Styles.headerTitleStyle,
        drawerLockMode: 'unlocked',
    }
};


