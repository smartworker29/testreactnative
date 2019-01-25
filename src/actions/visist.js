import {visitDetailsAndReset} from './navigation'
import {AsyncStorage, Alert, Clipboard} from 'react-native'
import API from '../api/index'
import {
    ADD_TASK_NAME,
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
    SET_LAST_CREATED_ID, SET_STORED_VISITS,
    SET_SYNC_VISIT, SET_TASK_NAMES,
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
import {SET_SKU_REASONS} from "./visitDetails";
import {SET_LAST_CUSTOMER, setLastCustomer} from "./shops";

const wait = (timeout) => new Promise(resolve => {
    setTimeout(() => {
        resolve();
    }, timeout)
});

export const createVisit = (shop, taskId, timeout, coordinates, taskName, shopData) => async (dispatch, getState) => {

    dispatch({type: CREATE_VISIT_REQUEST});
    await wait(200);

    let _coordinates = {};

    if (coordinates) {
        _coordinates = {
            longitude: coordinates.longitude,
            latitude: coordinates.latitude
        };
    }

    const name = `${_.trim(getState().profile.surname)} ${_.trim(getState().profile.name)} ${_.trim(getState().profile.patronymic)}`;
    const data = {
        ..._coordinates,
        route: getState().profile.pathNumber,
        customer_id: _.isObject(shopData) ? shopData.customer_id : shop,
        task: taskId,
        uuid: uuidv4(),
        name
    };

    const pin = getState().auth.pin;
    dispatch({type: SET_LAST_CUSTOMER, payload: data.customer_id});
    AsyncStorageQueue.push(`@${pin}_last_customer`, data.customer_id).then();
    const taskNameKey = `${shop}_${taskId}`;

    let response = null;
    try {
        const answer = await API.makeVisit(getState().auth.id, data, timeout);
        if (answer !== null && answer.status === 201) {
            response = await answer.json();
        }
    } catch (error) {
        console.log(error);
    }

    if (response !== null) {
        await AsyncStorageQueue.push(`@${pin}_visits`, JSON.stringify({
            entities: {visit: {...getState().visits.entities.visit, [response.id]: response}},
            result: [response.id, ...getState().visits.result]
        }));

        dispatch({type: CREATE_VISIT_RESPONSE, payload: response});
        dispatch({type: ADD_TASK_NAME, payload: {id: taskNameKey, name: taskName}});
        await AsyncStorageQueue.push(`@${pin}_last_created_id`, JSON.stringify(getState().visits.lastCreatedId));
        await AsyncStorageQueue.push(`@${pin}_visits_offline`, JSON.stringify(getState().visits.entities.offline));
        await AsyncStorageQueue.push(`@${pin}_task_names`, JSON.stringify(getState().tasks.taskNames));
        await AsyncStorageQueue.push(`@${pin}_stored_visits`, JSON.stringify(getState().visits.storedVisits.toArray()));
        return dispatch(visitDetailsAndReset(response.id, false, true, shopData, getState().shops.favorites));
    }

    dispatch({type: CREATE_VISIT_ERROR, payload: "Timeout"});

    const id = new Date().getTime();

    const local_date = new Date().toJSON();
    const payload = {
        id,
        tmp: true,
        task: taskId,
        customer_id: _.isObject(shopData) ? shopData.customer_id : shop,
        shop, results: null,
        moderation: null,
        local_date,
        uuid: data.uuid,
        data,
        customer_name: _.get(shopData, "customer_name", null)
    };

    dispatch({type: CREATE_VISIT_RESPONSE, payload, offline: true});
    dispatch({type: ADD_TASK_NAME, payload: {id: taskNameKey, name: taskName}});
    await AsyncStorageQueue.push(`@${pin}_last_created_id`, JSON.stringify(id));
    await AsyncStorageQueue.push(`@${pin}_visits_offline`, JSON.stringify(getState().visits.entities.offline));
    await AsyncStorageQueue.push(`@${pin}_task_names`, JSON.stringify(getState().tasks.taskNames));
    await AsyncStorageQueue.push(`@${pin}_stored_visits`, JSON.stringify(getState().visits.storedVisits.toArray()));
    return dispatch(visitDetailsAndReset(payload.id, true, true, shopData, getState().shops.favorites));
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

const parseError = (name, data) => {
    Alert.alert("Ошибка", `Ошибка считывания ${name}, данные будут восстановленны, ошибочные данные скопированны в буфер обмена`);
    Clipboard.setString(data)
};

export const initVisits = () => async (dispatch, getState) => {

    const pin = getState().auth.pin;

    try {
        const storedVisits = JSON.parse(await AsyncStorage.getItem(`@${pin}_stored_visits`)) || [];
        const filteredBadVisits = [];
        for (const [id, visit] of storedVisits) {
            if (id !== null && id !== undefined) {
                filteredBadVisits.push([id, visit])
            }
        }
        dispatch({type: SET_STORED_VISITS, payload: filteredBadVisits});
    } catch (error) {
        dispatch({type: SET_STORED_VISITS, payload: {}});
        //Alert.alert("Ошибка", "Ошибка считывания stored_visits, ошибочные данные скопированны в буфер обмена");
        //Clipboard.setString(await AsyncStorage.getItem(`@${pin}_stored_visits`))
    }

    try {
        const offline = JSON.parse(await AsyncStorage.getItem(`@${pin}_visits_offline`)) || {};
        dispatch({type: SET_VISIT_OFFLINE, payload: offline});
    } catch (error) {
        dispatch({type: SET_VISIT_OFFLINE, payload: {}});
        //Alert.alert("Ошибка", "Ошибка считывания visits_offline, ошибочные данные скопированны в буфер обмена, обратитесь в службу поддержки");
        //Clipboard.setString(await AsyncStorage.getItem(`@${pin}_visits_offline`))
    }

    try {
        const cache = JSON.parse(await AsyncStorage.getItem(`@${pin}_visits`)) || null;
        if (cache) {
            delete cache.entities.visit[undefined];
            delete cache.entities.visit[null];
            dispatch({type: REFRESH_VISIT_RESPONSE, payload: cache, limit: getState().auth.instance.visits_limit});
        }
    } catch (error) {
        //Alert.alert("Ошибка", "Ошибка считывания visits, ошибочные данные скопированны в буфер обмена, обратитесь в службу поддержки");
        //Clipboard.setString(await AsyncStorage.getItem(`@${pin}_visits`))
    }

    try {
        const lastCreatedId = parseInt(await AsyncStorage.getItem(`@${pin}_last_created_id`)) || null;
        dispatch({type: SET_LAST_CREATED_ID, payload: lastCreatedId});
    } catch (error) {
        dispatch({type: SET_LAST_CREATED_ID, payload: null});
        //Alert.alert("Ошибка", "Ошибка считывания last_created_id, ошибочные данные скопированны в буфер обмена, обратитесь в службу поддержки");
        //Clipboard.setString(await AsyncStorage.getItem(`@${pin}_last_created_id`))
    }

    try {
        const visitSync = JSON.parse(await AsyncStorage.getItem(`@${pin}_visits_sync`)) || {};
        dispatch({type: SET_SYNC_VISIT, payload: visitSync});
    } catch (error) {
        dispatch({type: SET_SYNC_VISIT, payload: {}});
        //Alert.alert("Ошибка", "Ошибка считывания visits_sync, ошибочные данные скопированны в буфер обмена, обратитесь в службу поддержки");
        //Clipboard.setString(await AsyncStorage.getItem(`@${pin}_visits_sync`))
    }

    try {
        const skuReasons = JSON.parse(await AsyncStorage.getItem(`@${pin}_sku_reasons`)) || {};
        dispatch({type: SET_SKU_REASONS, payload: skuReasons});
    } catch (error) {
        dispatch({type: SET_SKU_REASONS, payload: {}});
        //Alert.alert("Ошибка", "Ошибка считывания sku_reasons, ошибочные данные скопированны в буфер обмена, обратитесь в службу поддержки");
        //Clipboard.setString(await AsyncStorage.getItem(`@${pin}_sku_reasons`));
    }

    try {
        const lastCustomer = await AsyncStorage.getItem(`@${pin}_last_customer`) || null;
        dispatch({type: SET_LAST_CUSTOMER, payload: lastCustomer});
    } catch (error) {
        dispatch({type: SET_LAST_CUSTOMER, payload: null});
        //Alert.alert("Ошибка", "Ошибка считывания last_customer, ошибочные данные скопированны в буфер обмена, обратитесь в службу поддержки");
        //Clipboard.setString(await AsyncStorage.getItem(`@${pin}_last_customer`));
    }
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
        dispatch({type: REFRESH_VISIT_RESPONSE, payload: payload, limit: getState().auth.instance.visits_limit});
        await AsyncStorageQueue.push(`@${pin}_stored_visits`, JSON.stringify(getState().visits.storedVisits.toArray()));

    } catch (error) {

        if (isInit === true) {
            const cash = JSON.parse(await AsyncStorage.getItem(`@${pin}_visits`)) || {};
            dispatch({type: REFRESH_VISIT_RESPONSE, payload: cash, limit: getState().auth.instance.visits_limit});
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
            let created = null;
            try {
                const answer = await API.makeVisit(getState().auth.id, item.data);
                if (answer !== null && answer.status === 201) {
                    created = await answer.json();
                }
            } catch (error) {
                console.log(error);
            }
            if (created !== null) {
                sync[item.id] = created.id;
                dispatch({type: DELETE_OFFLINE_VISIT, payload: item.id});
                beenSyncVisit = true;
                dispatch({type: SYNC_VISIT_RESPONSE, payload: created, syncId: item.id})
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


export const ADD_FEEDBACK_OFFLINE = 'ADD_FEEDBACK_OFFLINE';
export const sendFeedback = (visit, request, sendState, category, uuid) => async (dispatch, getState) => {
    const deviceInfo = await getDeviceInfo();
    deviceInfo.current_time = new Date();
    if (sendState === true) {
        deviceInfo.store = getState();
        deviceInfo.files = await readDir(photoDir);
        deviceInfo.last_errors = ErrorLogging.errors;
        deviceInfo.last_store_errors = await AsyncStorage.getItem("errors");
        deviceInfo.deleted_photos = ErrorLogging.deletedPhotos;
        await AsyncStorageQueue.push(`@updateDeviceInfoExtendDate`, moment().toJSON());
    }
    const data = {visit, device_info: deviceInfo, request, uuid, category};
    const agentId = getState().auth.id;
    const key = agentId + "_" + uuid;
    dispatch({type: ADD_FEEDBACK_OFFLINE, payload: {key, data}});
    const pin = getState().auth.pin;
    await AsyncStorageQueue.push(`@${pin}_feedback_offline`, JSON.stringify(getState().visits.feedbackOffline));
};

export const INIT_FEEDBACK_OFFLINE = 'INIT_FEEDBACK_OFFLINE';
export const initFeedback = () => async (dispatch, getState) => {
    const pin = getState().auth.pin;
    try {
        const feedbackOffline = JSON.parse(await AsyncStorage.getItem(`@${pin}_feedback_offline`)) || {};
        dispatch({type: INIT_FEEDBACK_OFFLINE, payload: feedbackOffline});
    } catch (error) {
    }
};

export const SET_FEEDBACK_SYNC = 'SET_FEEDBACK_SYNC';
export const DELETE_FEEDBACK_OFFLINE = 'DELETE_FEEDBACK_OFFLINE';
export const SET_FEEDBACK_ERROR = 'SET_FEEDBACK_ERROR';
export const syncFeedback = () => async (dispatch, getState) => {
    if (getState().visits.isFeedbackSync === true) {
        return;
    }
    dispatch({type: SET_FEEDBACK_SYNC, payload: true});
    const key = getState().visits.feedbackOffline.keySeq().first();
    if (!key) {
        return dispatch({type: SET_FEEDBACK_SYNC, payload: false});
    }
    let [agentId,] = key.split("_");
    const feedback = getState().visits.feedbackOffline.get(key);
    if (getState().visits.sync[feedback.visit] !== undefined) {
        feedback.visit = getState().visits.sync[feedback.visit];
    }
    if (feedback) {
        const response = await API.sendFeedback(agentId, feedback);
        if (response !== null && response.status === 200) {
            dispatch({type: DELETE_FEEDBACK_OFFLINE, payload: key});
            const pin = getState().auth.pin;
            await AsyncStorageQueue.push(`@${pin}_feedback_offline`, JSON.stringify(getState().visits.feedbackOffline));
        } else if (response !== null) {
            dispatch({type: SET_FEEDBACK_ERROR, payload: response.data, meta: {agentId, feedback}});
        }
    }
    dispatch({type: SET_FEEDBACK_SYNC, payload: false});
};

export const clearFeedbackError = () => (dispatch, getState) => {
    dispatch({type: FEEDBACK_CLEAR_ERROR});
};