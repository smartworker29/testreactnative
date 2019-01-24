import {Alert, AsyncStorage} from "react-native";
import AsyncStorageQueue from "../utils/AsyncStorageQueue";
import {Map, OrderedMap, List, OrderedSet} from "immutable";
import * as API from "../api";
import _ from "lodash";

export const INIT_QUESTIONS = "INIT_QUESTIONS";
export const initQuestions = () => async (dispatch, getState) => {
    const value = await AsyncStorage.getItem("questions");
    if (!value) {
        return;
    }
    try {
        const questions = JSON.parse(value);
        if (questions["undefined"] !== undefined) {
            delete questions["undefined"];
        }
        dispatch({type: INIT_QUESTIONS, payload: questions});
    } catch (error) {
        Alert.alert("Error", "error parsing questions");
    }
};

export const SET_QUESTIONS = "SET_QUESTIONS";
export const saveQuestions = (uuid, questions) => async (dispatch, getState) => {
    dispatch({type: SET_QUESTIONS, payload: [uuid, questions]});
    await AsyncStorageQueue.push("questions", JSON.stringify(getState().questions.questions))
};

export const INIT_UUID_VALUES = "INIT_UUID_VALUES";
export const initUuidValues = () => async (dispatch, getState) => {
    const value = await AsyncStorage.getItem("uuid_values");
    if (!value) {
        return;
    }
    try {
        const values = JSON.parse(value);
        dispatch({type: INIT_UUID_VALUES, payload: values});
    } catch (error) {
        Alert.alert("Error", "error parsing uuid values");
    }
};

export const SET_UUID_VALUES = "SET_UUID_VALUES";
export const saveUuidValues = (values) => async (dispatch, getState) => {
    dispatch({type: SET_UUID_VALUES, payload: values});
    await AsyncStorageQueue.push("uuid_values", JSON.stringify(getState().questions.uuidValues))
};

export const INIT_ANSWERS = "INIT_ANSWERS";
export const initAnswers = () => async (dispatch, getState) => {
    const value = await AsyncStorage.getItem("answers");
    if (!value) {
        return;
    }
    try {
        const answers = JSON.parse(value);
        if (_.keys(answers).length > 0) {
            for (const key in answers) {
                if (answers.hasOwnProperty(key) && key.includes("undefined")) {
                    delete answers[key]
                }
            }
        }
        dispatch({type: INIT_ANSWERS, payload: answers});
    } catch (error) {
        Alert.alert("Error", "error parsing answers");
    }
};
export const DELETE_ANSWER_SYNC = 'DELETE_ANSWER_SYNC';
export const SET_ANSWERS_SYNC = 'SET_ANSWERS_SYNC';
export const initAnswersSync = () => async (dispatch, getState) => {
    const value = await AsyncStorage.getItem("answers_sync");
    if (!value) {
        return;
    }
    try {
        const answers_sync = JSON.parse(value);
        if (_.isArray(answers_sync)) {
            const sync = {};
            for (const val of answers_sync) {
                sync[val] = false;
            }
            return dispatch({type: SET_ANSWERS_SYNC, payload: sync});
        }
        if (_.keys(answers_sync).length > 0) {
            for (const key in answers_sync) {
                if (answers_sync.hasOwnProperty(key) && key.includes("undefined")) {
                    delete answers_sync[key]
                }
            }
        }
        dispatch({type: SET_ANSWERS_SYNC, payload: answers_sync});
    } catch (error) {
        Alert.alert("Error", "error parsing answers sync");
    }
};

export const SYNC_ANSWER_START = 'SYNC_ANSWER_START';
export const SYNC_ANSWER_END = 'SYNC_ANSWER_END';
export const SYNC_ANSWER_COMPLETE = 'SYNC_ANSWER_COMPLETE';
export const syncAnswers = () => async (dispatch, getState) => {
    if (getState().questions.isSync === true) {
        return;
    }
    dispatch({type: SYNC_ANSWER_START});
    const questionUUID = getState().questions.sync.findKey(sync => sync === false);
    if (!questionUUID) {
        return dispatch({type: SYNC_ANSWER_END});
    }
    const request = getState().questions.answers.get(questionUUID);
    if (!request) {
        dispatch({type: DELETE_ANSWER_SYNC, payload: questionUUID});
        AsyncStorageQueue.push("answers_sync", JSON.stringify(getState().questions.sync)).then().catch(console.log);
        return dispatch({type: SYNC_ANSWER_END});
    }
    const result = await API.sendAnswer(JSON.stringify(request));
    if (result === null) {
        return dispatch({type: SYNC_ANSWER_END});
    }
    dispatch({type: SYNC_ANSWER_COMPLETE, payload: questionUUID});
    AsyncStorageQueue.push("answers_sync", JSON.stringify(getState().questions.sync)).then().catch(console.log);
    dispatch({type: SYNC_ANSWER_END});
};

export const SET_ANSWERS = "SET_ANSWERS";
export const setAnswers = (answers) => async (dispatch, getState) => {
    dispatch({type: SET_ANSWERS, payload: answers});
    AsyncStorageQueue.push("answers", JSON.stringify(getState().questions.answers)).then().catch(console.log)
};

export const setSync = (sync) => async (dispatch, getState) => {
    dispatch({type: SET_ANSWERS_SYNC, payload: sync});
    AsyncStorageQueue.push("answers_sync", JSON.stringify(getState().questions.sync)).then().catch(console.log);
};

export const initRequiredQuestions = () => async (dispatch, getState) => {
    const value = await AsyncStorage.getItem("questions_required");
    if (!value) {
        return;
    }
    try {
        const required = JSON.parse(value);
        dispatch({type: SET_QUESTIONS_REQUIRED, payload: required});
    } catch (error) {
        Alert.alert("Error", "error parsing answers");
    }
};

export const SET_QUESTIONS_REQUIRED = 'SET_QUESTIONS_REQUIRED';
export const setRequiredQuestions = (required) => async (dispatch, getState) => {
    dispatch({type: SET_QUESTIONS_REQUIRED, payload: required});
    AsyncStorageQueue.push("questions_required", JSON.stringify(getState().questions.required)).then().catch(console.log);
};