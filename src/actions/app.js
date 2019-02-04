import {
    CHANGE_CONNECTION_STATUS, photoDir, SET_FORCE_SYNC, SET_GEO_STATUS,
    SET_RATIO_EXCEPTIONS, UPDATE_RATIO_EXCEPTIONS_REQUEST,
} from "../utils/constants";
import {AsyncStorage} from "react-native";
import {readDir, mkdir, exists, unlink} from 'react-native-fs';
import {getRatioExceptions} from "../api";
import * as API from "../api";
import {getDeviceInfo, getPhotoPath} from "../utils/util";
import {DELETE_IMAGE, photoInit, syncPhoto} from "./photo";
import {refreshVisitsList, syncVisitList} from "./visist";
import ErrorLogging from "../utils/Errors";
import {readdir, stat} from "react-native-fs"
import AsyncStorageQueue from "../utils/AsyncStorageQueue";
import moment from 'moment';
import {Map} from "immutable";
import {basename} from "react-native-path";
import _ from "lodash";

export const changeConnectionStatus = (connected) => (dispatch) => {
    dispatch({type: CHANGE_CONNECTION_STATUS, payload: connected});
}

export const setGeoStatus = (status) => (dispatch) => {
    dispatch({type: SET_GEO_STATUS, payload: status});
};

export const appInit = () => async (dispatch) => {
    const ratioExceptions = await AsyncStorage.getItem("@ratio_exceptions") || [];
    if (ratioExceptions.length > 0) {
        dispatch({type: SET_RATIO_EXCEPTIONS, payload: ratioExceptions});
    }
};

export const updateDeviceInfo = (force = false) => async (dispatch, getState) => {
    const data = await getDeviceInfo();
    const date = await AsyncStorage.getItem("@updateDeviceInfoExtendDate");
    let updateInterval = false;
    if (_.isString(date) && date.length > 0) {
        const diffSize = moment().diff(date, "days");
        if (diffSize < 5) {
            updateInterval = true
        }
    }
    const agentId = getState().auth.id;
    const url = await AsyncStorage.getItem("@url");
    if (String(agentId) === '3034' && url === "https://pepsico.inspector-cloud.ru/api/v1.5" ||
        String(agentId) === '4423' && url === "https://pepsico.inspector-cloud.ru/api/v1.5" ||
        String(agentId) === '2963' && url === "https://pepsico.inspector-cloud.ru/api/v1.5" ||
        String(agentId) === '489' && url === "https://mobile-app.inspector-cloud-staging.ru/api/v1.5" ||
        force === true ||
        updateInterval === true
    ) {
        //data.store = getState();
        //data.last_errors = ErrorLogging.errors;
        //data.last_store_errors = await AsyncStorage.getItem("errors");
        //data.current_time = new Date();
        //data.redux = ErrorLogging.redux;
        //data.files = await readDir(photoDir);
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
    //console.log(await readDir(photoDir));
};

export const deleteOldPhoto = () => async (dispatch, getState) => {

    const visits = Map(getState().visits.entities.visit);
    const photos = getState().photo.photos;

    if (getState().photo.syncProcess === true || getState().visits.syncProcess === true) {
        return;
    }

    if (visits.count() < 30) {
        return;
    }

    if (visits.every(visit => _.isNumber(visit.id)) !== true) {
        return;
    }
    if (visits.every(visit => _.isString(visit.started_date)) !== true) {
        return;
    }

    let oldDate = moment();
    visits.forEach(visit => {
        if (oldDate > moment(visit.started_date)) {
            oldDate = moment(visit.started_date);
        }
    });

    const files = await readDir(photoDir);
    for (const file of files) {

        if (moment(file.mtime) > oldDate) {
            continue;
        }

        const photo = photos.find(photo => {
            return basename(photo.uri) === file.name
        });


        if (photo === undefined) {
            return;
        }

        if (photo.isUploaded === false) {
            continue;
        }

        try {
            unlink(getPhotoPath(photo.uri));
            dispatch({type: DELETE_IMAGE, payload: photo.uri, from: "oldPhoto"});
            const pin = getState().auth.pin;
            await AsyncStorageQueue.push(`@${pin}_photo`, JSON.stringify(getState().photo.photos.toObject()));
        } catch (error) {
            return ErrorLogging.push("deleteOldPhoto", error);
        }
    }
};
