import * as API from "../api";
import { AsyncStorage } from 'react-native'
import { GET_TASKS_REQUEST_END, GET_TASKS_REQUEST_START, SET_TASKS } from "../utils/constants";

export const initTasks = () => async (dispatch, getState) => {
    const pin = getState().auth.pin;
    const tasks = JSON.parse(await AsyncStorage.getItem(`@${pin}_tasks`)) || [];
    dispatch({type: SET_TASKS, payload: tasks})
}

export const getTasksList = () => async (dispatch, getState) => {
    dispatch({type: GET_TASKS_REQUEST_START})
    const response = await API.getTasks();

    if (response === null) {
        return dispatch({type: GET_TASKS_REQUEST_END});
    }
    const pin = getState().auth.pin;
    dispatch({type: SET_TASKS, payload: response.data.results})
    AsyncStorage.setItem(`@${pin}_tasks`, JSON.stringify(response.data.results));
    dispatch({type: GET_TASKS_REQUEST_END})
}