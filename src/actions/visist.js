import {visitDetailsAndReset} from './navigation'
import {AsyncStorage} from 'react-native'
import API from '../api/index'
import {
    CREATE_VISIT_ERROR, CREATE_VISIT_REQUEST, CREATE_VISIT_RESPONSE, DELETE_OFFLINE_VISIT,
    REFRESH_VISIT_ERROR,
    REFRESH_VISIT_REQUEST, REFRESH_VISIT_RESPONSE, SEND_FEEDBACK_REQUEST, SET_APP_DATA, SET_LAST_CREATED_ID,
    SET_SYNC_VISIT,
    SET_VISIT_OFFLINE, SYNC_VISIT_END, SYNC_VISIT_REQUEST, SYNC_VISIT_RESPONSE, SYNC_VISIT_START
} from '../utils/constants'
import _ from "lodash";
import {Map} from "immutable";
import {getDeviceInfo} from "../utils/util";

export const createVisit = (shop, taskId, timeout) => async (dispatch, getState) => {

    dispatch({type: CREATE_VISIT_REQUEST});

    let coordinates = {};

    try {
        const {longitude, latitude} = await getCoordinates();
        coordinates.longitude = longitude;
        coordinates.latitude = latitude;
    } catch (error) {
        console.log(error)
    }

    // const data = {...coordinates, route: "PSHD12", customer_id: 12345};
    const name = `${_.trim(getState().profile.surname)} ${_.trim(getState().profile.name)} ${_.trim(getState().profile.patronymic)}`
    const data = {
        ...coordinates,
        route: getState().profile.pathNumber,
        customer_id: shop,
        task: taskId,
        name
    };
    const pin = getState().auth.pin;

    try {

        const response = await API.makeVisit(getState().auth.id, data, timeout);

        if (response.status !== 200) {
            return dispatch({type: CREATE_VISIT_ERROR})
        }

        await AsyncStorage.setItem(`@${pin}_visits`, JSON.stringify({
            entities: {visit: {...getState().visits.entities.visit, [response.data.id]: response.data}},
            result: [response.data.id, ...getState().visits.result]
        }));

        dispatch({type: CREATE_VISIT_RESPONSE, payload: response.data});
        await AsyncStorage.setItem(`@${pin}_last_created_id`, JSON.stringify(getState().visits.lastCreatedId));
        await AsyncStorage.setItem(`@${pin}_visits_offline`, JSON.stringify(getState().visits.entities.offline));
        dispatch(visitDetailsAndReset(response.data.id, false, true))

    } catch (error) {

        if (error.status !== undefined) {
            return dispatch({type: CREATE_VISIT_ERROR, payload: error})
        }

        const id = new Date().getTime();

        const local_date = new Date().toJSON();
        const payload = {id, tmp: true, shop, results: null, moderation: null, local_date, data};

        dispatch({type: CREATE_VISIT_RESPONSE, payload, offline: true});
        await AsyncStorage.setItem(`@${pin}_last_created_id`, JSON.stringify(id));

        await AsyncStorage.setItem(`@${pin}_visits_offline`, JSON.stringify(getState().visits.entities.offline));
        dispatch(visitDetailsAndReset(payload.id, true, true))
    }
};

const getCoordinates = async () => {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(data => {
            resolve(data.coords)
        }, error => reject(error), {
            timeout: 1000,
            maxAge: 0
        })
    })
};

export const initVisits = () => async (dispatch, getState) => {
    const pin = getState().auth.pin;
    const cache = JSON.parse(await AsyncStorage.getItem(`@${pin}_visits`)) || {};

    if (!cache) {
        dispatch({type: REFRESH_VISIT_RESPONSE, payload: cache})
    }

    const offline = JSON.parse(await AsyncStorage.getItem(`@${pin}_visits_offline`)) || {};
    dispatch({type: SET_VISIT_OFFLINE, payload: offline});

    const lastCreatedId = parseInt(await AsyncStorage.getItem(`@${pin}_last_created_id`)) || null;
    dispatch({type: SET_LAST_CREATED_ID, payload: lastCreatedId});

    const visitSync = JSON.parse(await AsyncStorage.getItem(`@${pin}_visits_sync`)) || {};
    dispatch({type: SET_SYNC_VISIT, payload: visitSync});
};

export const refreshVisitsList = (isInit) => async (dispatch, getState) => {

    if (getState().visits.isFetch) {
        return
    }

    dispatch({type: REFRESH_VISIT_REQUEST, payload: {isInit: isInit === undefined ? false : isInit}});
    const pin = getState().auth.pin;

    try {

        const response = await API.getVisitsByAgent(getState().auth.id);

        if (response.status !== 200) {
            return dispatch({type: REFRESH_VISIT_ERROR})
        }

        const slicedData = _.take(response.data, 30);

        const payload = {};
        payload.entities = {visit: _.keyBy(slicedData, 'id')};
        payload.result = slicedData.map(visit => visit.id);
        payload.page = 1;
        payload.count = response.data.length;
        payload.hasMore = false;

        await AsyncStorage.setItem(`@${pin}_visits`, JSON.stringify(payload));
        dispatch({type: REFRESH_VISIT_RESPONSE, payload: payload})

    } catch (error) {

        console.log(error);

        if (error.message.indexOf('403') !== -1) {
            return dispatch({type: 'SHOW_TOAST', payload: 'Ошибка авторизации'})
        }

        if (isInit === true) {
            const cash = JSON.parse(await AsyncStorage.getItem(`@${pin}_visits`)) || {};
            dispatch({type: REFRESH_VISIT_RESPONSE, payload: cash})
        }

        if (error.status === undefined) {
            return dispatch({type: REFRESH_VISIT_ERROR, payload: {connection: false}})
        } else return dispatch({type: REFRESH_VISIT_ERROR, payload: error})
    }
};

export const syncVisitList = () => async (dispatch, getState) => {

    if (getState().visits.syncProcess === true) {
        return;
    }

    dispatch({type: SYNC_VISIT_START});
    dispatch({type: SYNC_VISIT_REQUEST});
    const offline = Map(getState().visits.entities.offline);
    const sync = getState().visits.sync || {};
    let beenSyncVisit = false;
    const item = offline.first();

    if (item && sync[item.id] === undefined) {
        const existVisit = await API.getVisitDetails(item.id);
        if (existVisit && existVisit.status === 404) {
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
    dispatch({type: SYNC_VISIT_END});
    const pin = getState().auth.pin;
    AsyncStorage.setItem(`@${pin}_visits_offline`, JSON.stringify(getState().visits.entities.offline));
    AsyncStorage.setItem(`@${pin}_visits_sync`, JSON.stringify(sync));
};

export const sendFeedback = (visit, request) => async (dispatch, getState) => {
    dispatch({type: SEND_FEEDBACK_REQUEST});
    const agentId = getState().auth.id;
    const deviceInfo = await getDeviceInfo();
    const data = {visit, device_info: deviceInfo, request};
    const response = await API.sendFeedback(agentId, data);
    return response !== null;
};