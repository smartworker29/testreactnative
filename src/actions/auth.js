import {AsyncStorage, Platform, Alert} from "react-native";
import {
    FETCH_PIN,
    FETCH_PIN_ERROR,
    FETCH_PIN_RESPONSE,
    SET_AUTH_ID,
    SET_PIN,
    SET_PINS, SYNC_PINS_END, SYNC_PINS_START
} from "../utils/constants";
import * as API from "../api";
import AppLink from "react-native-app-link";
import DeviceInfo from 'react-native-device-info';

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
            checkVersion(instance);
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
    Alert.alert("Внимание", "Обновить до новой версии", [
        {text: 'Нет', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {
            text: 'Да', onPress: async () => {
                await AppLink.openInStore("id1360417378", "inspector.cloud");
            }
        },
    ]);
};

export const AlertMust = () => {
    Alert.alert("Внимание", "Необходимо обновиться до новой версии", [
        {
            text: 'Ok', onPress: async () => {
                await AppLink.openInStore("id1360417378", "inspector.cloud")
            }, style: 'cancel'
        },
    ]);
};

export const checkVersion = async (inst) => {
    if (Platform.OS === "ios") {
        if (parseInt(inst.min_ios_version) > parseInt(DeviceInfo.getBuildNumber()) && inst.must_update === true) {
            return AlertMust();
        }
        if (parseInt(inst.min_ios_version) > parseInt(DeviceInfo.getBuildNumber())) {
            return AlertQuestion();
        }

    } else {
        if (parseInt(inst.min_android_version) > parseInt(DeviceInfo.getBuildNumber()) && inst.must_update === true) {
            return AlertMust();
        }
        if (parseInt(inst.min_android_version) > parseInt(DeviceInfo.getBuildNumber())) {
            return AlertQuestion();
        }
    }
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

    dispatch({type: SYNC_PINS_START});

    const pins = await API.getPins();

    if (pins === null) {
        return dispatch({type: SYNC_PINS_END});
    } else {
        dispatch({type: SET_PINS, payload: pins.data});
        await AsyncStorage.setItem("@pins", JSON.stringify(pins.data));
    }

    dispatch({type: SYNC_PINS_END});
};