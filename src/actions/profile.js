import {
    AGENT_FETCH,
    SET_AUTH_ID,
    SET_PROFILE_CONTACT_NUMBER, SET_PROFILE_DATA, SET_PROFILE_FIELD_VALUE,
    SET_PROFILE_NAME,
    SET_PROFILE_PATH_NUMBER,
    SET_PROFILE_PATRONYMIC,
    SET_PROFILE_SURMANE, SHOW_TOAST
} from "../utils/constants";
import {AsyncStorage, Alert, View, Text} from "react-native";
import {resetToList} from "./navigation";
import * as API from "../api";
import I18n from "react-native-i18n";
import {genSeed} from "../reducer/app";
import _ from "lodash";
import bugsnag from '../bugsnag';
import DeviceInfo from 'react-native-device-info';
import AsyncStorageQueue from "../utils/AsyncStorageQueue";
import uuidv4 from 'uuid/v4';
import {Input} from "native-base";
import {validate as emailValidate} from 'email-validator';
import React from "react";

export const saveData = (action, alert = true) => async (dispatch, getState) => {

    const data = getState().profile;
    const authId = getState().auth.id;


    const nameFields = getState().auth.instance.agent_name_fields;
    if (nameFields) {
        let [lang] = DeviceInfo.getDeviceLocale().split("-");
        for (const name of nameFields) {
            const value = String(name[`label_${lang}`]).toUpperCase();
            if (value === "FIRST NAME" || value === "ФАМИЛИЯ") {
                if (data.surname.length === 0) {
                    return Alert.alert(I18n.t("error.attention"), I18n.t("error.emptySurname"));
                }
            }
            if (value === "SECOND NAME" || value === "ИМЯ") {
                if (data.name.length === 0) {
                    return Alert.alert(I18n.t("error.attention"), I18n.t("error.emptyName"));
                }
            }
            if (value === "MIDDLE NAME" || value === "ОТЧЕСТВО") {
                if (data.patronymic.length === 0) {
                    return Alert.alert(I18n.t("error.attention"), I18n.t("error.emptyPatronymic"));
                }
            }
        }
    } else {
        if (data.surname.length === 0) {
            return Alert.alert(I18n.t("error.attention"), I18n.t("error.emptySurname"));
        }

        if (data.name.length === 0) {
            return Alert.alert(I18n.t("error.attention"), I18n.t("error.emptyName"));
        }

        if (data.patronymic.length === 0) {
            return Alert.alert(I18n.t("error.attention"), I18n.t("error.emptyPatronymic"));
        }
    }

    let [lang] = DeviceInfo.getDeviceLocale().split("-");

    const agent_fields = getState().auth.instance.agent_fields;
    if (agent_fields) {
        for (const field of agent_fields) {
            if (field.required === true && (data.fields[field.name] === undefined || _.trim(data.fields[field.name]).length === 0)) {
                const name = field[`label_${lang}`] || field.name;
                return Alert.alert(I18n.t("error.attention"), `Пожалуйста, заполните обязательное поле профиля ${name}`);
            }
            if (field.name === "email" && !emailValidate(data.fields[field.name])) {
                return Alert.alert(I18n.t("error.attention"), `Введите правильный Email`);
            }
        }
    }

    if (data.fields["route"] !== undefined) {
        data.pathNumber = data.fields["route"];
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
            _.forEach(agent_fields, field => {
                if (result.data[field.name] !== undefined || result.data[field.name] !== null) {
                    AsyncStorageQueue.push(`@${pin}_profile_field_${field.name}`, String(result.data[field.name])).then();
                }
            });
            dispatch({type: SET_AUTH_ID, payload: String(result.data.id)});
            dispatch({type: AGENT_FETCH, payload: false});
            return dispatch(resetToList());
        } else {
            alert && Alert.alert(I18n.t("error.attention"), I18n.t("error.createAgent"));
        }
    } else {
        const fields = _.clone(data.fields);
        _.forEach(data.fields, (val, key) => {
            fields[key] = _.isArray(val) ? JSON.stringify(val) : val;
        });
        const result = await API.updateAgent(authId, name, fields);
        if (result === null) {
            alert && Alert.alert(I18n.t("error.attention"), I18n.t("error.updateAgent"));
        } else {
            _.forEach(agent_fields, field => {
                if (result.data[field.name] !== undefined || result.data[field.name] !== null) {
                    AsyncStorageQueue.push(`@${pin}_profile_field_${field.name}`, String(result.data[field.name])).then();
                }
            });
        }
    }

    dispatch({type: AGENT_FETCH, payload: false});
    bugsnag.setUser(`${authId}`, data.pathNumber, 'example@example.com');

    if (action) {
        dispatch(action);
    }
};

const validateEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

export const loadData = () => async (dispatch, getState) => {
    const pin = getState().auth.pin;
    const data = JSON.parse(await AsyncStorage.getItem(`@${pin}_profile`)) || {};
    if (data.fields !== undefined && data.fields.route !== undefined) {
        data.pathNumber = data.fields.route;
    }
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

export const setFieldValue = (field, value) => (dispatch) => {
    dispatch({type: SET_PROFILE_FIELD_VALUE, payload: {field, value: _.trim(value)}});
};