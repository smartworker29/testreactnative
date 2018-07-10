import {
    CHANGE_CONNECTION_STATUS, photoDir, SET_FORCE_SYNC,
    SET_RATIO_EXCEPTIONS, UPDATE_RATIO_EXCEPTIONS_REQUEST,
} from "../utils/constants";
import {AsyncStorage} from "react-native";
import {readDir, mkdir} from 'react-native-fs';
import {getRatioExceptions} from "../api";
import * as API from "../api";
import {getDeviceInfo} from "../utils/util";
import {photoInit, syncPhoto} from "./photo";
import {refreshVisitsList, syncVisitList} from "./visist";
import ErrorLogging from "../utils/Errors";
import {readdir} from "react-native-fs"
import AsyncStorageQueue from "../utils/AsyncStorageQueue";
import moment from 'moment';
import {Map} from "immutable";

export default changeConnectionStatus = (connected) => (dispatch) => {
    dispatch({type: CHANGE_CONNECTION_STATUS, payload: connected});
}

export const appInit = () => async (dispatch) => {
    const ratioExceptions = await AsyncStorage.getItem("@ratio_exceptions") || [];
    if (ratioExceptions.length > 0) {
        dispatch({type: SET_RATIO_EXCEPTIONS, payload: ratioExceptions});
    }
};

export const updateDeviceInfo = (force = false) => async (dispatch, getState) => {
    const data = await getDeviceInfo();
    const extendsParams = await AsyncStorage.getItem("@updateDeviceInfoExtend");
    const agentId = getState().auth.id;
    const url = await AsyncStorage.getItem("@url");
    if (String(agentId) === '3034' && url === "https://pepsico.inspector-cloud.ru/api/v1.5" ||
        String(agentId) === '4423' && url === "https://pepsico.inspector-cloud.ru/api/v1.5" ||
        String(agentId) === '2963' && url === "https://pepsico.inspector-cloud.ru/api/v1.5" ||
        String(agentId) === '489' && url === "https://mobile-app.inspector-cloud-staging.ru/api/v1.5" ||
        force === true ||
        extendsParams === "true"
    ) {
        const keys = await AsyncStorage.getAllKeys();
        const storage = {};
        for (const key of keys) {
            storage[key] = await AsyncStorage.getItem(key);
        }
        data.store = getState();
        data.last_errors = ErrorLogging.errors;
        data.last_store_errors = await AsyncStorage.getItem("errors");
        data.files = await readdir(photoDir);
        data.current_time = new Date();
        data.redux = ErrorLogging.redux;
        data.async_storege = storage;
    }

    if (agentId !== null) {
        const response = await API.patchAgent(getState().auth.id, {device_info: data});
    }
};

timeout = async (ms = 200) => {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    })
};

export const updateRatioExceptions = () => async (dispatch, getStore) => {
    dispatch({type: UPDATE_RATIO_EXCEPTIONS_REQUEST});
    const ratios = await getRatioExceptions();
    if (ratios === null) {
        return;
    }
    dispatch({type: SET_RATIO_EXCEPTIONS, payload: ratios.data});
    await AsyncStorageQueue.push("@ratio_exceptions", JSON.stringify(ratios.data));
};

export const setForceSync = () => (dispatch, getStore) => {
    dispatch({type: SET_FORCE_SYNC, payload: true});
};

export const forceSync = () => async (dispatch, getStore) => {
    dispatch({type: SET_FORCE_SYNC, payload: true});
    await dispatch(photoInit());
    await dispatch(syncVisitList(true));
    await dispatch(syncPhoto(true));
    await dispatch(refreshVisitsList(false));
    dispatch({type: SET_FORCE_SYNC, payload: false});
};

export const initFolders = () => async (dispatch, getState) => {
    await mkdir(photoDir);

};
