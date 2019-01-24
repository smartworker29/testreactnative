import API, {updateId, updateVisit} from "../api"
import _ from "lodash";
import {
    CHANGE_VISIT_ID_REQUEST, CHANGE_VISIT_ID_RESPONSE, CHANGE_VISIT_ROUTE_REQUEST, CHANGE_VISIT_ROUTE_RESPONSE,
    CLEAR_VISIT_DETAILS, GET_VISIT_DETAILS_ERROR, GET_VISIT_DETAILS_REQUEST,
    GET_VISIT_DETAILS_RESPONSE, SHOW_TOAST
} from "../utils/constants";
import {Alert, AsyncStorage} from "react-native";
import uuidv4 from 'uuid/v4';
import AsyncStorageQueue from "../utils/AsyncStorageQueue";
import {SET_LAST_CUSTOMER} from "./shops";
import ErrorLogging from "../utils/Errors";

export const getVisitDetails = (id) => async (dispatch, getState) => {
    dispatch({type: GET_VISIT_DETAILS_REQUEST});

    try {
        const response = await API.getVisitDetails(id);

        if (response.status !== 200) {
            return dispatch({type: GET_VISIT_DETAILS_ERROR, payload: {error: response.data,}})
        }

        dispatch({type: GET_VISIT_DETAILS_RESPONSE, payload: response.data})

    } catch (error) {
        dispatch({type: GET_VISIT_DETAILS_ERROR, payload: error})
    }
};

export const clearVisitDetails = () => async (dispatch) => {
    dispatch({type: CLEAR_VISIT_DETAILS});
};


export const changeId = (id, data) => async (dispatch) => {
    dispatch({type: CHANGE_VISIT_ID_REQUEST});
    const result = await updateId(id, data);
    if (result === null) {
        return;
    }
    dispatch({type: CHANGE_VISIT_ID_RESPONSE, payload: result.data});
};

export const getVisitPosition = (id) => (dispatch, getState) => {
    let index = 1;
    for (const _id of getState().visits.result) {
        if (_id === id) {
            return index
        }
        index = index + 1;
    }
};

export const SET_SKU_REASONS = 'SET_SKU_REASONS';
export const setSkuReasons = (reasons) => (dispatch, getState) => {
    dispatch({type: SET_SKU_REASONS, payload: reasons});
};

export const INIT_SYNC_REASONS = 'INIT_SYNC_REASONS';
export const initSkuSync = () => async (dispatch, getState) => {
    try {
        const pin = getState().auth.pin;
        const syncReasons = JSON.parse(await AsyncStorage.getItem(`@${pin}_sku_sync`));
        if (syncReasons) {
            dispatch({type: INIT_SYNC_REASONS, payload: syncReasons});
        }
    } catch (error) {
        console.log(error);
    }
};

export const ADD_REASON_SYNC = 'ADD_REASON_SYNC';
export const addReasonForSync = (visitId, reasonObject) => async (dispatch, getState) => {
    const pin = getState().auth.pin;
    reasonObject.uuid = uuidv4();
    const storeObject = {
        visitId: visitId,
        reasonObject: reasonObject
    };
    dispatch({type: ADD_REASON_SYNC, payload: storeObject});
    dispatch({
        type: SEND_REASON_RESPONSE,
        payload: {
            component: reasonObject.component,
            visit: visitId,
            gid: reasonObject.sku_gid,
            reason: reasonObject.oos_reason
        }
    });
    AsyncStorageQueue.push(`@${pin}_sku_reasons`, JSON.stringify(getState().visitDetails.skuReasons)).then();
    AsyncStorageQueue.push(`@${pin}_sku_sync`, JSON.stringify(getState().visitDetails.skuSync)).then();
};

export const SHIFT_SKU_SYNC = 'SHIFT_SKU_SYNC';
export const SET_SKU_SYNC = 'SET_SKU_SYNC';
export const syncReasons = () => async (dispatch, getState) => {
    if (getState().visitDetails.skuSync.count() === 0) {
        return;
    }
    if (getState().visitDetails.isSkuSync === true) {
        return;
    }
    dispatch({type: SET_SKU_SYNC, payload: true});
    const pin = getState().auth.pin;
    const {visitId, reasonObject} = getState().visitDetails.skuSync.first();
    const result = await API.sendReason(visitId, reasonObject);
    if (result !== null) {
        dispatch({type: SHIFT_SKU_SYNC});
        AsyncStorageQueue.push(`@${pin}_sku_sync`, JSON.stringify(getState().visitDetails.skuSync)).then();
    } else {
        ErrorLogging.push("syncReasons result = null");
    }
    dispatch({type: SET_SKU_SYNC, payload: false});

};

export const SEND_REASON_REQUEST = 'SEND_REASON_REQUEST';
export const SEND_REASON_RESPONSE = 'SEND_REASON_RESPONSE';
export const sendReason = (id, data) => async (dispatch, getState) => {
    data.uuid = uuidv4();
    dispatch({type: SEND_REASON_REQUEST});
    const result = await API.sendReason(id, data);
    if (result === null) {
        return setTimeout(() => {
            dispatch({type: SEND_REASON_RESPONSE});
            setTimeout(() => Alert.alert("Ошибка", "Ошибка отправки причины"), 100);
        }, 500);
    }
    const pin = getState().auth.pin;
    setTimeout(() => {
        dispatch({
            type: SEND_REASON_RESPONSE,
            payload: {component: data.component, visit: id, gid: data.sku_gid, reason: data.oos_reason}
        });
        AsyncStorageQueue.push(`@${pin}_sku_reasons`, JSON.stringify(getState().visitDetails.skuReasons)).then();
    }, 500);
};

export const changeRoute = (id, route) => async (dispatch) => {
    dispatch({type: CHANGE_VISIT_ROUTE_REQUEST, payload: true});
    const result = await updateVisit(id, {current_agent_route: route});
    dispatch({type: CHANGE_VISIT_ROUTE_REQUEST, payload: false});
    if (result === null) {
        return;
    }
    dispatch({type: CHANGE_VISIT_ID_RESPONSE, payload: result.data});
};

