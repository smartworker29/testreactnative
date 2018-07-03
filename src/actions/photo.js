import {AsyncStorage} from 'react-native'
import API from "../api/"
import {Map} from "immutable";
import AsyncStorageQueue from "../utils/AsyncStorageQueue";
import {exists} from "react-native-fs"
import uuidv4 from 'uuid/v4';

export const ADD_PHOTO = 'ADD_PHOTO';
/**
 * Add photo to store
 * @param uri photo's uri
 * @param id visit's id
 */
export const addPhoto = (uri, id) => async (dispatch, getState) => {
    const offline = getState().visits.entities.offline;
    const tmpId = (offline[id]) ? id : null;
    dispatch({type: ADD_PHOTO, payload: {uri, id, tmpId}});
    const pin = getState().auth.pin;
    await AsyncStorageQueue.push(`@${pin}_photo`, JSON.stringify(getState().photo.photos.toObject()));
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
    for (const photo of Object.values(photos)) {
        photo.isUploading = false;
    }
    dispatch({type: SET_PHOTO, payload: photos});
};

export const uploadPhoto = (uri, id, visitId = null) => async (dispatch, getState) => {

    if (getState().photo.photos.find(photo => photo.isUploading === true)) {
        return;
    }

    dispatch({type: UPLOAD_PHOTO_REQUEST, payload: {uri, id}});

    const data = new FormData();
    data.append('datafile', {
        uri: uri,
        type: 'image/jpg',
        name: uri.replace(/^.*[\\\/]/, ''),
        uuid: uuidv4()
    });
    const pin = getState().auth.pin;

    try {
        dispatch({type: UPLOAD_PROGRESS_START, payload: uri});
        const response = await API.uploadPhoto(id, data, dispatch, uri);
        dispatch({type: UPLOAD_PROGRESS_END, payload: uri});

        if (response.status !== 201) {
            return dispatch({type: UPLOAD_PHOTO_ERROR, payload: {uri, error: response.data}});
        }

        dispatch({type: UPLOAD_PHOTO_RESPONSE, payload: {visit: id, uri, tmpId: visitId, photoId: response.data.id}});
        await AsyncStorageQueue.push(`@${pin}_photo`, JSON.stringify(getState().photo.photos.toObject()));
    } catch (error) {
        console.log("error", error);
        dispatch({type: UPLOAD_PROGRESS_END, payload: uri});
        dispatch({type: "SHOW_TOAST", payload: "Ошибка загрузки фото"});
        dispatch({type: UPLOAD_PHOTO_ERROR, payload: {uri, error}});
        await AsyncStorageQueue.push(`@${pin}_photo`, JSON.stringify(getState().photo.photos.toObject()));
    }
};

export const SYNC_PHOTO_START = 'SYNC_PHOTO_START';
export const SYNC_PHOTO_END = 'SYNC_PHOTO_END';
export const NOT_FIND_PHOTO = "NOT_FIND_PHOTO";

export const syncPhoto = () => async (dispatch, getState) => {

    if (getState().photo.photos.count() === 0 || Map(getState().visits.entities.offline).count() > 0) {
        return;
    }

    if (getState().photo.syncProcess === true || getState().visits.syncProcess === true) {
        return;
    }

    const photo = getState().photo.photos.sort((a, b) => {
        if (a.timestamp < b.timestamp) {
            return -1;
        }
        if (a.timestamp > b.timestamp) {
            return 1;
        }
        if (a.timestamp === b.timestamp) {
            return 0;
        }
    }).find(photo => photo.isUploaded === false);

    if (!photo) {
        return;
    }

    if (await exists(photo.uri) === false) {
        return dispatch({type: DELETE_IMAGE, payload: photo.uri});
    }

    const sync = getState().visits.sync;
    if (getState().visits.entities.visit[photo.visit] === undefined && sync[photo.visit] === undefined) {
        return dispatch({type: DELETE_IMAGE, payload: photo.uri});
    }

    dispatch({type: SYNC_PHOTO_START});

    let id = photo.visit;
    if (sync[photo.visit] !== undefined) {
        id = sync[photo.visit];
    }

    const pin = getState().auth.pin;
    await dispatch(uploadPhoto(photo.uri, id, photo.visit));
    await AsyncStorageQueue.push(`@${pin}_photo`, JSON.stringify(getState().photo.photos.toObject()));
    dispatch({type: SYNC_PHOTO_END});
};

export const DELETE_IMAGE = 'DELETE_IMAGE';
export const DELETE_IMAGE_REQUEST = 'DELETE_IMAGE_REQUEST';
export const DELETE_IMAGE_ERROR = 'DELETE_IMAGE_ERROR';
export const deleteImage = (uri, id) => async (dispatch, getState) => {
    dispatch({type: DELETE_IMAGE_REQUEST});
    const result = await API.deleteImage(id);
    if (result === null) {
        dispatch({type: DELETE_IMAGE_ERROR, payload: "Ошибка удаления"});
        return false
    }
    dispatch({type: DELETE_IMAGE, payload: uri});
    const pin = getState().auth.pin;
    await AsyncStorageQueue.push(`@${pin}_photo`, JSON.stringify(getState().photo.photos.toObject()));
    return true;
};

export const clearDeleteError = () => (dispatch) => {
    dispatch({type: DELETE_IMAGE_ERROR, payload: null});
};

export const UPLOAD_PROGRESS = 'UPLOAD_PROGRESS';
export const UPLOAD_PROGRESS_START = 'UPLOAD_PROGRESS_START';
export const UPLOAD_PROGRESS_END = 'UPLOAD_PROGRESS_END';

export const deleteImageHandler = () => {

};
