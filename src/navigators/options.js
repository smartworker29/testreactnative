import React, {Component} from 'react'
import {Keyboard, Alert, Text, SafeAreaView, ActivityIndicator, Platform} from 'react-native';
import {
    backIcon, cameraIcon,
    closeIcon, deleteIcon,
    doneIcon, likeOffBigIcon, likeOnBigIcon, profileActiveIcon,
    profileIcon, reportsActiveIcon,
    reportsIcon, resultsActiveIcon,
    resultsIcon, shopsActiveIcon, shopsIcon,
    tasksActiveIcon,
    tasksIcon
} from '../utils/images'
import Styles from '../utils/styles'
import I18n from 'react-native-i18n'
import {Image, TouchableOpacity, View} from 'react-native'
import * as NavigationActions from '../actions/navigation'
import {allowAction} from "../utils/util";
import {Body, Button, Header, Icon, Left, Right, Segment} from "native-base";
import {SegmentButtons} from "../component/SegmentButtons";
import _ from "lodash";

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
    const {shop, favorites, favoriteHandler, favoritePostRequest} = navigation.state.params;
    const headerLeft = (
        <TouchableOpacity style={Styles.navBarIconAreaLeft} onPress={() => {
            navigation.dispatch(NavigationActions.back())
        }}>
            <Image resizeMode="contain" source={backIcon}/>
        </TouchableOpacity>
    );

    let icon;

    if (!favorites || favorites.count() === 0) {
        icon = null;
    }

    //console.log("favorites", favorites.toArray());

    icon = (favorites && favorites.find(item => item.gps_shop && item.gps_shop.id === shop.id)) ? likeOnBigIcon : likeOffBigIcon;

    let headerRight = (favoriteHandler && !_.isString(shop)) ? (
        <TouchableOpacity style={Styles.navBarIconAreaRight} onPress={() => {
            favoriteHandler(shop.id)
        }}>
            <Image resizeMode="contain" source={icon}/>
        </TouchableOpacity>
    ) : null;

    if (favoritePostRequest === true) {
        headerRight = <ActivityIndicator style={Styles.navBarIconAreaRight} size="small"/>
    }

    return {
        title: _.get(shop, "customer_name", _.isString(shop) ? shop : ""),
        headerTitleStyle: Styles.headerTitleStyle,
        tabBarLabel: I18n.t('tabBar.tasks'),
        headerLeft,
        headerRight,
        tabBarIcon: (args) => {
            const icon = (args.focused === true) ? tasksActiveIcon : tasksIcon;
            return <Image source={icon}/>
        },
    }
};

let favHandler;
let nearHandler;
let enterIdHandler;

export const shopsNavigationOptions = (navigation) => {
    if (navigation.state.params && favHandler === undefined) {
        favHandler = navigation.state.params.favHandler;
    }
    if (navigation.state.params && nearHandler === undefined) {
        nearHandler = navigation.state.params.nearHandler;
    }
    if (navigation.state.params && navigation.state.params.enterIdHandler !== undefined) {
        enterIdHandler = navigation.state.params.enterIdHandler;
    }

    let shopIsFetch = false;
    if (navigation.state.params) {
        shopIsFetch = navigation.state.params.shopIsFetch;
    }

    const leftButton = (!shopIsFetch) ?
        <TouchableOpacity hitSlop={{left: 50, right: 50, bottom: 50, top: 50}}
                          style={{paddingRight: 16}}
                          onPress={enterIdHandler}>
            <Text style={Styles.idText}>ID</Text>
        </TouchableOpacity> : <ActivityIndicator style={{paddingRight: 16}}/>;

    const style = (Platform.OS === "android") ? {backgroundColor: "#f8f8f8d1"} : {};
    return {
        header: (
            <Header style={style} androidStatusBarColor="#777">
                <SafeAreaView style={{flex: 1}}>
                    <View style={{flex: 1, flexDirection: "row", justifyContent: "space-between"}}>
                        <View style={{flex: 1, justifyContent: 'center'}}>

                        </View>
                        <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
                            {(favHandler && nearHandler) ?
                                <SegmentButtons onLeftPress={nearHandler} onRightPress={favHandler}/> : null}
                        </View>
                        <View style={{flex: 1, justifyContent: 'center', alignItems: "flex-end"}}>
                            {(enterIdHandler) ? leftButton : null}
                        </View>
                    </View>
                </SafeAreaView>
            </Header>
        ),
        tabBarLabel: I18n.t('shops.shops'),
        tabBarIcon: (args) => {
            const icon = (args.focused === true) ? shopsActiveIcon : shopsIcon;
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

export const QuestionnaireNavigationOptions = (navigation) => {
    const backHandler = navigation.getParam("backHandler", NavigationActions.back);
    return {
        title: "Опросник",
        headerStyle: Styles.headerStyle,
        headerTitleStyle: Styles.headerTitleStyle,
        headerLeft: (
            <TouchableOpacity
                style={Styles.navBarIconAreaLeft}
                onPress={() => navigation.dispatch(backHandler())}>
                <Image resizeMode="contain" source={backIcon}/>
            </TouchableOpacity>
        ),
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
        I18n.t("error.attention"),
        I18n.t("preview.remove"),
        [
            {
                text: I18n.t("alerts.yes"), onPress: () => {
                    deleteHandler(currentPhotoUri, photoId);
                }
            },
            {
                text: I18n.t("alerts.no"), onPress: () => {
                }
            },
        ],
        {cancelable: false}
    )
};

const AlertRePhoto = (rePhotoHandler, photo) => {
    Alert.alert(
        I18n.t("error.attention"),
        "Вы хотите переснять фото?",
        [
            {
                text: I18n.t("alerts.yes"), onPress: () => {
                    rePhotoHandler(photo);
                }
            },
            {
                text: I18n.t("alerts.no"), onPress: () => {
                }
            },
        ],
        {cancelable: false}
    )
};

export const previewNavigationOptions = (navigation) => {
    const {deleteHandler, count, index, photo} = navigation.state.params;
    const rePhotoHandler = navigation.getParam("rePhoto", null);
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
                <View
                    style={{flexDirection: "row", justifyContent: "flex-end", paddingRight: 14, alignItems: "center"}}>
                    {rePhotoHandler ? <TouchableOpacity
                        style={{marginRight: 20}}
                        onPress={() => {
                            AlertRePhoto(rePhotoHandler, photo)
                        }}>
                        <Image resizeMode="contain" source={cameraIcon} style={{tintColor: "white"}}/>
                    </TouchableOpacity> : null}
                    <TouchableOpacity
                        onPress={() => {
                            alertQuestion(deleteHandler, photo.uri, photo.id)
                        }}>
                        <Image resizeMode="contain" source={deleteIcon} style={{tintColor: "white"}}/>
                    </TouchableOpacity>
                </View> : null
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

export const feedbackCategoriesNavigationOptions = (navigation) => {
    return {
        title: "Тема жалобы",
        headerTitleStyle: Styles.headerTitleStyle,
        headerLeft: (
            <TouchableOpacity
                style={Styles.navBarIconAreaLeft}
                onPress={() => navigation.dispatch(NavigationActions.back())}>
                <Image resizeMode="contain" source={backIcon}/>
            </TouchableOpacity>
        ),
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


