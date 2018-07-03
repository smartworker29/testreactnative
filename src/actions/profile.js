import {
    AGENT_FETCH,
    SET_AUTH_ID,
    SET_PROFILE_CONTACT_NUMBER, SET_PROFILE_DATA,
    SET_PROFILE_NAME,
    SET_PROFILE_PATH_NUMBER,
    SET_PROFILE_PATRONYMIC,
    SET_PROFILE_SURMANE, SHOW_TOAST
} from "../utils/constants";
import {AsyncStorage, Alert} from "react-native";
import {resetToList} from "./navigation";
import * as API from "../api";
import I18n from "react-native-i18n";
import {genSeed} from "../reducer/app";
import _ from "lodash";
import bugsnag from '../bugsnag';
import DeviceInfo from 'react-native-device-info';
import AsyncStorageQueue from "../utils/AsyncStorageQueue";
import uuidv4 from 'uuid/v4';

export const saveData = (action) => async (dispatch, getState) => {

    const data = getState().profile;
    const authId = getState().auth.id;

    if (data.surname.length === 0) {
        return Alert.alert(I18n.t("error.attention"), I18n.t("error.emptySurname"));
    }

    if (data.name.length === 0) {
        return Alert.alert(I18n.t("error.attention"), I18n.t("error.emptyName"));
    }

    if (data.patronymic.length === 0) {
        return Alert.alert(I18n.t("error.attention"), I18n.t("error.emptyPatronymic"));
    }

    if (data.pathNumber.length === 0) {
        return Alert.alert(I18n.t("error.attention"), I18n.t("error.emptyPathNumber"));
    }

    const name = `${_.trim(data.surname)} ${_.trim(data.name)} ${_.trim(data.patronymic)}`;
    data.hasChanges = false;
    dispatch({type: SET_PROFILE_DATA, payload: data});
    const pin = getState().auth.pin;
    await AsyncStorageQueue.push(`@${pin}_profile`, JSON.stringify(data));
    const device_info = {
        battery_level: String(await DeviceInfo.getBatteryLevel()),
        brand: DeviceInfo.getBrand(),
        model: DeviceInfo.getModel(),
        build_number: DeviceInfo.getBuildNumber(),
        carrier: DeviceInfo.getCarrier(),
        uid: DeviceInfo.getUniqueID(),
        manufacturer: DeviceInfo.getManufacturer(),
        device_id: DeviceInfo.getDeviceId(),
        system_name: DeviceInfo.getSystemName(),
        system_version: DeviceInfo.getSystemVersion(),
        version: DeviceInfo.getVersion(),
        bundle_id: DeviceInfo.getBundleId(),
        device_name: DeviceInfo.getDeviceName(),
        user_agent: DeviceInfo.getUserAgent(),
        device_location: DeviceInfo.getDeviceLocale(),
        device_country: DeviceInfo.getDeviceCountry(),
        timezone: DeviceInfo.getTimezone(),
        total_memory: String(DeviceInfo.getTotalMemory())
    };

    dispatch({type: AGENT_FETCH, payload: true});

    if (authId == null) {
        const result = await API.createAgent({
            name,
            device_info,
            route: data.pathNumber,
            uuid: uuidv4()
        });
        if (result !== null) {
            await AsyncStorageQueue.push(`@${pin}_agent`, String(result.data.id));
            dispatch({type: SET_AUTH_ID, payload: String(result.data.id)});
            dispatch({type: AGENT_FETCH, payload: false});
            return dispatch(resetToList());
        } else {
            Alert.alert(I18n.t("error.attention"), I18n.t("error.createAgent"));
        }
    } else {
        if (await API.updateAgent(authId, name) === null) {
            Alert.alert(I18n.t("error.attention"), I18n.t("error.updateAgent"));
        }
    }

    dispatch({type: AGENT_FETCH, payload: false});
    bugsnag.setUser(`${authId}`, data.pathNumber, 'example@example.com');

    if (action) {
        dispatch(action);
    }
};

export const loadData = () => async (dispatch, getState) => {
    const pin = getState().auth.pin;
    const data = JSON.parse(await AsyncStorage.getItem(`@${pin}_profile`)) || {};
    dispatch({type: SET_PROFILE_DATA, payload: data});
};

export const setSurname = (text) => (dispatch) => {
    dispatch({type: SET_PROFILE_SURMANE, payload: _.trim(text)});
};

export const setName = (text) => (dispatch) => {
    dispatch({type: SET_PROFILE_NAME, payload: _.trim(text)});
};

export const setPatronymic = (text) => (dispatch) => {
    dispatch({type: SET_PROFILE_PATRONYMIC, payload: _.trim(text)});
};

export const setPathNumber = (text) => (dispatch) => {
    dispatch({type: SET_PROFILE_PATH_NUMBER, payload: _.trim(text)});
};