import { AsyncStorage } from 'react-native'
import API from "../api/"
import { getVisitDetails } from "./visitDetails";
import { SET_APP_DATA } from "../utils/constants";
import { Map } from "immutable";

export const ADD_PHOTO = 'ADD_PHOTO';
/**
 * Add photo to store
 * @param uri photo's uri
 * @param id visit's id
 */
export const addPhoto = (uri, id) => async (dispatch, getState) => {
    dispatch({type: ADD_PHOTO, payload: {uri, id}});
    const pin = getState().auth.pin;
    await AsyncStorage.setItem(`@${pin}_photo`, JSON.stringify(getState().photo.photos.toObject()));
};

export const CLEAR_PHOTO = 'CLEAR_PHOTO';
export const clearPhoto = () => (dispatch) => dispatch({type: CLEAR_PHOTO});

export const UPLOAD_PHOTO_REQUEST = 'UPLOAD_PHOTO_REQUEST';
export const UPLOAD_PHOTO_RESPONSE = 'UPLOAD_PHOTO_RESPONSE';
export const UPLOAD_PHOTO_ERROR = 'UPLOAD_PHOTO_ERROR';
export const SET_PHOTO = 'SET_PHOTO';

export const photoInit = () => async (dispatch, getState) => {
    const pin = getState().auth.pin;
    const photos = JSON.parse(await AsyncStorage.getItem(`@${pin}_photo`)) || {};
    dispatch({type: SET_PHOTO, payload: photos});
}

export const uploadPhoto = (uri, id, visitId = null) => async (dispatch, getState) => {

    if (getState().photo.photos.find(photo => photo.isUploading === true)) {
        return;
    }

    dispatch({type: UPLOAD_PHOTO_REQUEST, payload: {uri, id}});

    const data = new FormData();
    data.append('datafile', {uri: uri, type: 'image/jpg', name: uri.replace(/^.*[\\\/]/, '')});
    const pin = getState().auth.pin;

    try {
        const response = await API.uploadPhoto(id, data);

        if (response.status !== 201) {
            return dispatch({type: UPLOAD_PHOTO_ERROR, payload: {uri, error: response.data}});
        }

        dispatch({type: UPLOAD_PHOTO_RESPONSE, payload: {visit: id, uri, tmpId: visitId, photoId: response.data.id}});
        await AsyncStorage.setItem(`@${pin}_photo`, JSON.stringify(getState().photo.photos.toObject()));

    } catch (error) {
        console.log("error", error);
        dispatch({type: "SHOW_TOAST", payload: "Ошибка загрузки фото"});
        dispatch({type: UPLOAD_PHOTO_ERROR, payload: {uri, error}})
        await AsyncStorage.setItem(`@${pin}_photo`, JSON.stringify(getState().photo.photos.toObject()));
    }
};

export const SYNC_PHOTO_START = 'SYNC_PHOTO_START';
export const SYNC_PHOTO_END = 'SYNC_PHOTO_END';

export const syncPhoto = () => async (dispatch, getState) => {

    if (getState().photo.photos.count() === 0 || Map(getState().visits.entities.offline).count() > 0) {
        return;
    }

    if (getState().photo.syncProcess === true || getState().visits.syncProcess === true) {
        return;
    }

    const photo = getState().photo.photos.find(photo => photo.isUploaded === false);
    const sync = getState().visits.sync;

    if (!photo) {
        return;
    }

    dispatch({type: SYNC_PHOTO_START});

    let id = photo.visit;
    if (sync[photo.visit] !== undefined) {
        id = sync[photo.visit];
    }

    const pin = getState().auth.pin;
    await dispatch(uploadPhoto(photo.uri, id, photo.visit));
    await AsyncStorage.setItem(`@${pin}_photo`, JSON.stringify(getState().photo.photos.toObject()));

    dispatch({type: SYNC_PHOTO_END});
};
