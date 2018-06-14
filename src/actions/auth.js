import {AsyncStorage, Platform, Alert} from "react-native";
import {
    FETCH_PIN,
    FETCH_PIN_ERROR,
    FETCH_PIN_RESPONSE,
    SET_AUTH_ID,
    SET_PIN,
    SET_PINS, SYNC_PINS_END, SYNC_PINS_START, SYNC_PINS_START_FIRST
} from "../utils/constants";
import * as API from "../api";
import AppLink from "react-native-app-link";
import DeviceInfo from 'react-native-device-info';
import I18n from "react-native-i18n";

export const authInit = () => async (dispatch, getState) => {
    const pin = getState().auth.pin;
    const id = JSON.parse(await AsyncStorage.getItem(`@${pin}_agent`)) || null;
    dispatch({type: SET_AUTH_ID, payload: id})
};

export const checkPin = (pin) => async (dispatch, getState) => {
    dispatch({type: FETCH_PIN, payload: true});
    let pins = getState().auth.pins;
    let havePinKey = false;

    _.forEach(pins, (inst, key) => {
        if (inst.pin !== undefined) {
            havePinKey = true
        }
    });

    if (havePinKey) {

        let instance;
        let pinId;

        _.forEach(pins, (inst, key) => {
            if (inst.pin === pin) {
                instance = inst;
                pinId = key;
            }
        });

        if (instance) {
            const allow = checkVersion(instance);
            if (allow !== true) {
                dispatch({type: FETCH_PIN_ERROR});
                return dispatch({type: FETCH_PIN, payload: false});
            }
            await AsyncStorage.setItem("@url", String(instance.url));
            await AsyncStorage.setItem("@token", String(instance.token));
            dispatch({type: SET_PIN, payload: pinId});
            dispatch({type: FETCH_PIN_RESPONSE, payload: pins})
        } else {
            dispatch({type: FETCH_PIN_ERROR});
            dispatch({type: FETCH_PIN, payload: false});
        }
    } else {
        if (pins[pin] !== undefined) {
            await AsyncStorage.setItem("@url", String(pins[pin].url));
            await AsyncStorage.setItem("@token", String(pins[pin].token));
            dispatch({type: SET_PIN, payload: pin});
            dispatch({type: FETCH_PIN_RESPONSE, payload: pins})
        } else {
            dispatch({type: FETCH_PIN_ERROR});
            dispatch({type: FETCH_PIN, payload: false});
        }
    }
};

export const AlertQuestion = () => {
    Alert.alert(I18n.t("alerts.haveUpdate"), I18n.t("alerts.updateQuestion"), [
        {text: I18n.t("alerts.no"), onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {
            text: I18n.t("alerts.yes"), onPress: async () => {
                await AppLink.openInStore("id1360417378", "inspector.cloud");
            }
        },
    ]);
};

export const AlertMust = () => {
    Alert.alert(I18n.t("alerts.haveUpdate"), I18n.t("alerts.mustUpdate"), [
        {
            text: 'Ok', onPress: async () => {
                await AppLink.openInStore("id1360417378", "inspector.cloud")
            }, style: 'cancel'
        },
    ]);
};

export const checkVersion = (inst) => {
    if (Platform.OS === "ios") {
        if (parseInt(inst.min_ios_version) > parseInt(DeviceInfo.getBuildNumber()) && inst.must_update === true) {
            AlertMust();
            return false;
        }
        if (parseInt(inst.min_ios_version) > parseInt(DeviceInfo.getBuildNumber())) {
            AlertQuestion();
            return true;
        }

    } else {
        if (parseInt(inst.min_android_version) > parseInt(DeviceInfo.getBuildNumber()) && inst.must_update === true) {
            AlertMust();
            return false;
        }
        if (parseInt(inst.min_android_version) > parseInt(DeviceInfo.getBuildNumber())) {
            AlertQuestion();
            return true;
        }
    }

    return true;
};

export const setFetchPin = (val) => async (dispatch, getState) => {
    dispatch({type: FETCH_PIN, payload: val});
};

export const initPins = () => async (dispatch, getState) => {
    const pins = JSON.parse(await AsyncStorage.getItem(`@pins`)) || {};
    dispatch({type: SET_PINS, payload: pins});
    dispatch(syncPins());
};

export const syncPins = () => async (dispatch, getState) => {

    if (getState().auth.syncProcess === true) {
        return;
    }

    if (Object.keys(getState().auth.pins).length === 0) {
        dispatch({type: SYNC_PINS_START_FIRST});
    } else {
        dispatch({type: SYNC_PINS_START});
    }

    const pins = await API.getPins();

    if (pins === null) {
        return dispatch({type: SYNC_PINS_END});
    } else {
        dispatch({type: SET_PINS, payload: pins.data});
        await AsyncStorage.setItem("@pins", JSON.stringify(pins.data));
    }

    dispatch({type: SYNC_PINS_END});
};