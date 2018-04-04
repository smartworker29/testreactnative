import { AsyncStorage } from "react-native";
import {
    FETCH_PIN,
    FETCH_PIN_ERROR,
    FETCH_PIN_RESPONSE,
    SET_AUTH_ID,
    SET_PIN,
    SET_PINS, SYNC_PINS_END, SYNC_PINS_START
} from "../utils/constants";
import * as API from "../api";

export const authInit = () => async (dispatch, getState) => {
    const pin = getState().auth.pin;
    const id = JSON.parse(await AsyncStorage.getItem(`@${pin}_agent`)) || null;
    dispatch({type: SET_AUTH_ID, payload: id})
}

export const checkPin = (pin) => async (dispatch, getState) => {
    dispatch({type: FETCH_PIN, payload: true});
    let pins = getState().auth.pins;
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

export const setFetchPin = (val) => async (dispatch, getState) => {
    dispatch({type: FETCH_PIN, payload: val});
}

export const initPins = () => async (dispatch, getState) => {
    const pins = JSON.parse(await AsyncStorage.getItem(`@pins`)) || {};
    if (Object.keys(pins).length === 0) {
        await dispatch(syncPins());
    } else {
        dispatch({type: SET_PINS, payload: pins});
    }
}

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
        AsyncStorage.setItem("@pins", JSON.stringify(pins.data)).then();
    }

    dispatch({type: SYNC_PINS_END});
}