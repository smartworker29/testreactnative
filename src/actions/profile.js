import {
    SET_AUTH_ID,
    SET_PROFILE_CONTACT_NUMBER, SET_PROFILE_DATA,
    SET_PROFILE_NAME,
    SET_PROFILE_PATH_NUMBER,
    SET_PROFILE_PATRONYMIC,
    SET_PROFILE_SURMANE
} from "../utils/constants";
import { AsyncStorage } from "react-native";
import { resetToList } from "./navigation";
import * as API from "../api";

export const saveData = (action) => async (dispatch, getState) => {

    const data = getState().profile;
    const authId = getState().auth.id;

    if (data.name.length === 0) {
        return alert("Введите имя");
    }

    if (data.pathNumber.length === 0) {
        return alert("Введите Номер маршрута");
    }

    data.hasChanges = false;
    dispatch({type: SET_PROFILE_DATA, payload: data});
    await AsyncStorage.setItem("@profile", JSON.stringify(data))

    if (authId === null) {
        const result = await API.createAgent({name: data.name})

        if (result !== null) {
            await AsyncStorage.setItem("@auth_id", String(result.data.id))
            dispatch({type: SET_AUTH_ID, payload: String(result.data.id)})
            return dispatch(resetToList());
        }
    }

    if (action) {
        dispatch(action);
    }
}

export const loadData = () => async (dispatch) => {
    const data = JSON.parse(await AsyncStorage.getItem("@profile")) || {};
    dispatch({type: SET_PROFILE_DATA, payload: data});
}

export const setSurname = (text) => (dispatch) => {
    dispatch({type: SET_PROFILE_SURMANE, payload: text});
};

export const setName = (text) => (dispatch) => {
    dispatch({type: SET_PROFILE_NAME, payload: text});
};

export const setPatronymic = (text) => (dispatch) => {
    dispatch({type: SET_PROFILE_PATRONYMIC, payload: text});
};

export const setPathNumber = (text) => (dispatch) => {
    dispatch({type: SET_PROFILE_PATH_NUMBER, payload: text});
};

export const setContactNumber = (text) => (dispatch) => {
    dispatch({type: SET_PROFILE_CONTACT_NUMBER, payload: text});
};