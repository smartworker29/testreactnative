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

export default changeConnectionStatus = (connected) => (dispatch) => {
    dispatch({type: CHANGE_CONNECTION_STATUS, payload: connected});
}

export const appInit = () => async (dispatch) => {
    const ratioExceptions = await AsyncStorage.getItem("@ratio_exceptions") || [];
    if (ratioExceptions.length > 0) {
        dispatch({type: SET_RATIO_EXCEPTIONS, payload: ratioExceptions});
    }
};

const addAdditionData = (data) => async (dispatch, getState) => {
    data.last_errors = ErrorLogging.errors;
    data.store = getState();
    data.files = await readdir(photoDir);
};

export const updateDeviceInfo = () => async (dispatch, getState) => {
    const data = await getDeviceInfo();
    const agentId = getState().auth.id;
    const url = await AsyncStorage.getItem("@url");
    if (String(agentId) === '3034' && url === "https://pepsico.inspector-cloud.ru/api/v1.5") {
        addAdditionData(data);
    }
    if (String(agentId) === '3042' && url === "https://pepsico.inspector-cloud.ru/api/v1.5") {
        addAdditionData(data);
    }
    if (String(agentId) === '3021' && url === "https://pepsico.inspector-cloud.ru/api/v1.5") {
        addAdditionData(data);
    }
    if (String(agentId) === '2932' && url === "https://pepsico.inspector-cloud.ru/api/v1.5") {
        addAdditionData(data);
    }
    const response = await API.patchAgent(getState().auth.id, {device_info: data});
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
    await AsyncStorage.setItem("@ratio_exceptions", JSON.stringify(ratios.data));
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

export const initFolders = () => async (dispatch, getStore) => {
    await mkdir(photoDir);
    const files = await readDir(photoDir);
};
