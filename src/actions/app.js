import {
    CHANGE_CONNECTION_STATUS, photoDir,
    SET_RATIO_EXCEPTIONS, UPDATE_RATIO_EXCEPTIONS_REQUEST,
} from "../utils/constants";
import {AsyncStorage} from "react-native";
import {readDir, mkdir} from 'react-native-fs';
import {getRatioExceptions} from "../api";

export default changeConnectionStatus = (connected) => (dispatch) => {
    dispatch({type: CHANGE_CONNECTION_STATUS, payload: connected});
}

export const appInit = () => async (dispatch) => {
    const ratioExceptions = await AsyncStorage.getItem("@ratio_exceptions") || [];
    if (ratioExceptions.length > 0) {
        dispatch({type: SET_RATIO_EXCEPTIONS, payload: ratioExceptions});
    }
};

export const updateRatioExceptions = () => async (dispatch, getStore) => {
    dispatch({type: UPDATE_RATIO_EXCEPTIONS_REQUEST});
    const ratios = await getRatioExceptions();
    if (ratios === null) {
        return;
    }
    dispatch({type: SET_RATIO_EXCEPTIONS, payload: ratios.data});
    AsyncStorage.setItem("@ratio_exceptions", JSON.stringify(ratios.data));
};

export const initFolders = () => async (dispatch, getStore) => {
    await mkdir(photoDir);
    const files = await readDir(photoDir);
    console.log("files", files);
};
