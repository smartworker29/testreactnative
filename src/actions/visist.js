import {visitDetailsAndReset} from './navigation'
import {AsyncStorage} from 'react-native'
import API from '../api/index'
import {
    CREATE_VISIT_ERROR,
    CREATE_VISIT_REQUEST,
    CREATE_VISIT_RESPONSE,
    DELETE_OFFLINE_VISIT, FEEDBACK_CLEAR_ERROR, photoDir,
    REFRESH_VISIT_ERROR,
    REFRESH_VISIT_REQUEST,
    REFRESH_VISIT_RESPONSE,
    SEND_FEEDBACK_REQUEST, SEND_FEEDBACK_RESPONSE,
    SEND_FEEDBACK_TIMEOUT,
    SET_APP_DATA,
    SET_LAST_CREATED_ID,
    SET_SYNC_VISIT,
    SET_VISIT_OFFLINE,
    SYNC_VISIT_END,
    SYNC_VISIT_REQUEST,
    SYNC_VISIT_RESPONSE,
    SYNC_VISIT_START
} from '../utils/constants'
import _ from "lodash";
import {Map} from "immutable";
import {getDeviceInfo} from "../utils/util";
import AsyncStorageQueue from "../utils/AsyncStorageQueue";
import {readDir, readdir} from "react-native-fs";
import ErrorLogging from "../utils/Errors";
import uuidv4 from 'uuid/v4';
import moment from "moment/moment";
import {deleteOldPhoto} from "./app";

export const createVisit = (shop, taskId, timeout, coordinates) => async (dispatch, getState) => {

    dispatch({type: CREATE_VISIT_REQUEST});

    let _coordinates = {
        longitude: coordinates.longitude,
        latitude: coordinates.latitude
    };

    const name = `${_.trim(getState().profile.surname)} ${_.trim(getState().profile.name)} ${_.trim(getState().profile.patronymic)}`
    const data = {
        ..._coordinates,
        route: getState().profile.pathNumber,
        customer_id: shop,
        task: taskId,
        uuid: uuidv4(),
        name
    };
    const pin = getState().auth.pin;

    const response = await API.makeVisit(getState().auth.id, data, timeout);

    if (response !== null) {
        await AsyncStorageQueue.push(`@${pin}_visits`, JSON.stringify({
            entities: {visit: {...getState().visits.entities.visit, [response.data.id]: response.data}},
            result: [response.data.id, ...getState().visits.result]
        }));

        dispatch({type: CREATE_VISIT_RESPONSE, payload: response.data});
        await AsyncStorageQueue.push(`@${pin}_last_created_id`, JSON.stringify(getState().visits.lastCreatedId));
        await AsyncStorageQueue.push(`@${pin}_visits_offline`, JSON.stringify(getState().visits.entities.offline));
        return dispatch(visitDetailsAndReset(response.data.id, false, true));
    }

    dispatch({type: CREATE_VISIT_ERROR, payload: "Timeout"});

    const id = new Date().getTime();

    const local_date = new Date().toJSON();
    const payload = {id, tmp: true, task: taskId, shop, results: null, moderation: null, local_date, data};

    dispatch({type: CREATE_VISIT_RESPONSE, payload, offline: true});
    await AsyncStorageQueue.push(`@${pin}_last_created_id`, JSON.stringify(id));
    await AsyncStorageQueue.push(`@${pin}_visits_offline`, JSON.stringify(getState().visits.entities.offline));

    return dispatch(visitDetailsAndReset(payload.id, true, true));
};

const getCoordinates = async () => {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(data => {
            resolve(data.coords)
        }, error => reject(error), {
            timeout: 1000,
            maximumAge: 0,
            enableHighAccuracy: true
        })
    })
};

export const initVisits = () => async (dispatch, getState) => {
    const pin = getState().auth.pin;
    const cache = JSON.parse(await AsyncStorage.getItem(`@${pin}_visits`)) || null;

    if (cache) {
        dispatch({type: REFRESH_VISIT_RESPONSE, payload: cache});
    }

    const offline = JSON.parse(await AsyncStorage.getItem(`@${pin}_visits_offline`)) || {};
    dispatch({type: SET_VISIT_OFFLINE, payload: offline});

    const lastCreatedId = parseInt(await AsyncStorage.getItem(`@${pin}_last_created_id`)) || null;
    dispatch({type: SET_LAST_CREATED_ID, payload: lastCreatedId});

    const visitSync = JSON.parse(await AsyncStorage.getItem(`@${pin}_visits_sync`)) || {};
    dispatch({type: SET_SYNC_VISIT, payload: visitSync});

    /*const files = await readDir(photoDir);
    const visits = Map(getState().visits.entities.visit);
    for (const [id, visit] of visits) {
        console.log("visit", moment(visit.started_date).toString());
    }
    for (const file of files) {
        console.log("photo", moment(file.mtime).toString());
    }*/
};

export const refreshVisitsList = (isInit) => async (dispatch, getState) => {

    if (getState().visits.isFetch) {
        return
    }


    dispatch({type: REFRESH_VISIT_REQUEST, payload: {isInit: isInit === undefined ? false : isInit}});
    const pin = getState().auth.pin;

    try {

        const response = await API.getVisitsByAgent(getState().auth.id);
        const data = await response.json();

        if (response.status !== 200) {
            return dispatch({type: REFRESH_VISIT_ERROR})
        }

        const slicedData = _.take(data, 30);

        const payload = {};
        payload.entities = {visit: _.keyBy(slicedData, 'id')};
        payload.result = slicedData.map(visit => visit.id);
        payload.page = 1;
        payload.count = data.length;
        payload.hasMore = false;

        await AsyncStorageQueue.push(`@${pin}_visits`, JSON.stringify(payload));
        dispatch({type: REFRESH_VISIT_RESPONSE, payload: payload});

    } catch (error) {

        if (isInit === true) {
            const cash = JSON.parse(await AsyncStorage.getItem(`@${pin}_visits`)) || {};
            dispatch({type: REFRESH_VISIT_RESPONSE, payload: cash})
        }

        if (error.status === undefined) {
            return dispatch({type: REFRESH_VISIT_ERROR, payload: {connection: false}})
        } else return dispatch({type: REFRESH_VISIT_ERROR, payload: error})
    }
};

export const syncVisitList = (force = false) => async (dispatch, getState) => {

    if (force === false) {
        if (getState().visits.syncProcess === true) {
            return;
        }
    }
    const offline = Map(getState().visits.entities.offline);
    if (offline.count() === 0) {
        return;
    }

    dispatch({type: SYNC_VISIT_START});

    const sync = getState().visits.sync || {};
    let beenSyncVisit = false;
    const item = offline.first();

    if (item && sync[item.id] === undefined) {
        const existVisit = await API.getVisitDetails(item.id);
        if (existVisit && existVisit.status === 404) {
            dispatch({type: SYNC_VISIT_REQUEST});
            const created = await API.makeVisit(getState().auth.id, item.data);
            if (created !== null) {
                sync[item.id] = created.data.id;
                dispatch({type: DELETE_OFFLINE_VISIT, payload: item.id});
                beenSyncVisit = true;
                dispatch({type: SYNC_VISIT_RESPONSE, payload: created.data, syncId: item.id})
            }
        }
    } else if (item && sync[item.id] !== undefined) {
        dispatch({type: DELETE_OFFLINE_VISIT, payload: item.id})
    }

    dispatch({type: SET_APP_DATA, payload: {beenSyncVisit}});
    dispatch({type: SET_SYNC_VISIT, payload: sync});
    const pin = getState().auth.pin;
    await AsyncStorageQueue.push(`@${pin}_visits_offline`, JSON.stringify(getState().visits.entities.offline));
    await AsyncStorageQueue.push(`@${pin}_visits_sync`, JSON.stringify(sync));
    dispatch({type: SYNC_VISIT_END});
};

export const sendFeedback = (visit, request) => async (dispatch, getState) => {
    dispatch({type: SEND_FEEDBACK_REQUEST});
    const agentId = getState().auth.id;
    const keys = await AsyncStorage.getAllKeys();
    const storage = {};
    for (const key of keys) {
        storage[key] = await AsyncStorage.getItem(key);
    }
    const deviceInfo = await getDeviceInfo();
    deviceInfo.store = getState();
    deviceInfo.last_errors = ErrorLogging.errors;
    deviceInfo.last_store_errors = await AsyncStorage.getItem("errors");
    deviceInfo.files = await readDir(photoDir);
    deviceInfo.current_time = new Date();
    deviceInfo.redux = ErrorLogging.redux;
    deviceInfo.async_storage = storage;
    const data = {visit, device_info: deviceInfo, request, uuid: uuidv4()};
    await AsyncStorageQueue.push(`@updateDeviceInfoExtend`, "true");
    const response = await API.sendFeedback(agentId, data);
    if (response === null) {
        dispatch({type: SEND_FEEDBACK_TIMEOUT});
    } else {
        dispatch({type: SEND_FEEDBACK_RESPONSE});
    }
    return response;
};

export const clearFeedbackError = () => (dispatch, getState) => {
    dispatch({type: FEEDBACK_CLEAR_ERROR});
};