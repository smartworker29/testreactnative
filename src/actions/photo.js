import {AsyncStorage, Alert} from 'react-native'
import API from "../api/"
import {Map} from "immutable";
import AsyncStorageQueue from "../utils/AsyncStorageQueue";
import {exists, hash, stat} from "react-native-fs"
import uuidv4 from 'uuid/v4';
import {getPhotoPath, getPhotoPathWithPrefix} from "../utils/util";
import {SET_CAMERA_TYPE} from "../utils/constants";
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch'

export const ADD_PHOTO = 'ADD_PHOTO';
/**
 * Add photo to store
 * @param uri photo's uri
 * @param id visit's id
 * @param index image index
 */
export const addPhoto = (uri, id, index) => async (dispatch, getState) => {
    const offline = getState().visits.entities.offline;
    const tmpId = (offline[id]) ? id : null;
    dispatch({type: ADD_PHOTO, payload: {uri, id, tmpId, index}});
    const pin = getState().auth.pin;
    await AsyncStorageQueue.push(`@${pin}_photo`, JSON.stringify(getState().photo.photos.toObject()));
};

export const CLEAR_PHOTO = 'CLEAR_PHOTO';
export const clearPhoto = () => (dispatch) => dispatch({type: CLEAR_PHOTO});

export const UPLOAD_PHOTO_REQUEST = 'UPLOAD_PHOTO_REQUEST';
export const UPLOAD_PHOTO_STAT = 'UPLOAD_PHOTO_STAT';
export const UPLOAD_PHOTO_RESPONSE = 'UPLOAD_PHOTO_RESPONSE';
export const UPLOAD_PHOTO_HASH = 'UPLOAD_PHOTO_HASH';
export const UPLOAD_PHOTO_ERROR = 'UPLOAD_PHOTO_ERROR';
export const SET_PHOTO = 'SET_PHOTO';

export const setCameraType = (type) => async (dispatch, getState) => {
    dispatch({type: SET_CAMERA_TYPE, payload: type});
};

export const SET_DELETE_IDS = 'SET_DELETE_IDS';
export const photoInit = () => async (dispatch, getState) => {
    const pin = getState().auth.pin;
    const photos = JSON.parse(await AsyncStorage.getItem(`@${pin}_photo`)) || {};
    const _photos = {};
    for (const [key, value] of Object.entries(photos)) {
        value.uri = getPhotoPathWithPrefix(value.uri);
        value.isUploading = false;
        _photos[getPhotoPathWithPrefix(key)] = value;
    }
    dispatch({type: SET_PHOTO, payload: _photos});

    const deleteSync = JSON.parse(await AsyncStorage.getItem(`@${pin}_deleteSync`)) || [];
    dispatch({type: SET_DELETE_IDS, payload: deleteSync});
};

export const uploadPhoto = (uri, id, visitId = null, uuid, index) => async (dispatch, getState) => {

    if (getState().photo.photos.find(photo => photo.isUploading === true)) {
        return;
    }

    dispatch({type: UPLOAD_PHOTO_REQUEST, payload: {uri, id}});

    try {
        dispatch({type: UPLOAD_PHOTO_STAT, payload: await stat(uri)});
        dispatch({type: UPLOAD_PHOTO_HASH, payload: await hash(uri, "md5")});
    } catch (error) {
        dispatch({type: UPLOAD_PHOTO_ERROR, payload: error});
    }

    const data = new FormData();
    data.append('datafile', {
        uri: getPhotoPathWithPrefix(uri),
        type: 'image/jpg',
        name: uri.replace(/^.*[\\\/]/, ''),
    });
    data.append('uuid', uuid ? uuid : uuidv4());
    if (index) {
        data.append('scene_order', index);
    }
    const pin = getState().auth.pin;

    const controller = new AbortController();
    const signal = controller.signal;
    try {
        dispatch({type: UPLOAD_PROGRESS_START, payload: uri, controller});
        const response = await API.uploadPhoto(id, data, dispatch, uri, signal);
        const dataResponse = await response.json();
        dispatch({type: UPLOAD_PROGRESS_END, payload: uri});

        if (response.status === 400) {
            dispatch({
                type: UPLOAD_PHOTO_RESPONSE,
                payload: {visit: id, uri, tmpId: visitId, problem: true}
            });
            return await AsyncStorageQueue.push(`@${pin}_photo`, JSON.stringify(getState().photo.photos.toObject()));
        }

        if (response.status !== 201) {
            dispatch({type: UPLOAD_PHOTO_ERROR, payload: {uri, error: dataResponse}});
            return await AsyncStorageQueue.push(`@${pin}_photo`, JSON.stringify(getState().photo.photos.toObject()));
        }

        dispatch({
            type: UPLOAD_PHOTO_RESPONSE,
            payload: {visit: id, uri, tmpId: visitId, photoId: dataResponse.id}
        });

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
    }).find(photo => photo.isUploaded === false && photo.isProblem !== true);

    if (!photo) {
        return;
    }

    if (await exists(getPhotoPath(photo.uri)) === false) {
        return dispatch({type: DELETE_IMAGE, payload: photo.uri, from: "exists"});
    }

    const sync = getState().visits.sync;
    if (getState().visits.entities.visit[photo.visit] === undefined && sync[photo.visit] === undefined) {
        return dispatch({type: DELETE_IMAGE, payload: photo.uri, from: "sync"});
    }

    dispatch({type: SYNC_PHOTO_START});

    let id = photo.visit;
    if (sync[photo.visit] !== undefined) {
        id = sync[photo.visit];
    }

    if (id === undefined) {
        dispatch({type: SET_PROBLEM_STATUS, payload: photo.uri});
        return dispatch({type: SYNC_PHOTO_END});
    }

    const pin = getState().auth.pin;
    await dispatch(uploadPhoto(photo.uri, id, photo.visit, photo.uuid, photo.index));
    await AsyncStorageQueue.push(`@${pin}_photo`, JSON.stringify(getState().photo.photos.toObject()));
    dispatch({type: SYNC_PHOTO_END});
};

export const DELETE_IMAGE = 'DELETE_IMAGE';
export const DELETE_IMAGE_REQUEST = 'DELETE_IMAGE_REQUEST';
export const DELETE_IMAGE_ERROR = 'DELETE_IMAGE_ERROR';
export const ADD_DELETE_ID = 'ADD_DELETE_ID';
export const deleteImage = (uri, id, forSync = false) => async (dispatch, getState) => {
    dispatch({type: DELETE_IMAGE_REQUEST});
    const foundPhoto = getState().photo.photos.find((val, key) => {
        return val.uri === uri
    });
    const pin = getState().auth.pin;
    if (foundPhoto && foundPhoto.isUploaded === false && foundPhoto.isUploading === false) {
        dispatch({type: DELETE_IMAGE, payload: uri, from: "manual not uploading"});
        await AsyncStorageQueue.push(`@${pin}_photo`, JSON.stringify(getState().photo.photos.toObject()));
        return true;
    }
    if (foundPhoto && foundPhoto.isUploaded === false && foundPhoto.isUploading === true) {
        const controller = getState().photo.loadedTokens.find((val, key) => {
            return key === uri
        });
        if (controller) {
            controller.abort();
            dispatch({type: DELETE_IMAGE, payload: uri, from: "manual uploading"});
            await AsyncStorageQueue.push(`@${pin}_photo`, JSON.stringify(getState().photo.photos.toObject()));
            return true;
        } else {
            return false
        }
    }

    if (forSync === false) {
        const result = await API.deleteImage(id);
        if (result === null) {
            dispatch({type: DELETE_IMAGE_ERROR, payload: "Ошибка удаления"});
            return false
        }
    } else {
        dispatch({type: ADD_DELETE_ID, payload: id});
        await AsyncStorageQueue.push(`@${pin}_deleteSync`, JSON.stringify(getState().photo.deleteSync.toArray()));
    }

    dispatch({type: DELETE_IMAGE, payload: uri, from: "manual"});
    await AsyncStorageQueue.push(`@${pin}_photo`, JSON.stringify(getState().photo.photos.toObject()));
    return true;
};

export const clearDeleteError = () => (dispatch) => {
    dispatch({type: DELETE_IMAGE_ERROR, payload: null});
};


export const SYNC_DELETE_IMAGE_START = 'SYNC_DELETE_IMAGE_START';
export const SYNC_DELETE_IMAGE_END = 'SYNC_DELETE_IMAGE_END';
export const syncDeleteImage = () => async (dispatch, getState) => {
    if (getState().photo.syncDeleteProcess === true || getState().photo.deleteSync.count() === 0) {
        return;
    }
    dispatch({type: SYNC_DELETE_IMAGE_START});

    const id = getState().photo.deleteSync.first();
    if (id === undefined) {
        return dispatch({type: SYNC_DELETE_IMAGE_END});
    }

    const result = await API.deleteImage(id);
    if (result === null) {
        return dispatch({type: SYNC_DELETE_IMAGE_END});
    }
    dispatch({type: SYNC_DELETE_IMAGE_END, payload: id});
    const pin = getState().auth.pin;
    await AsyncStorageQueue.push(`@${pin}_deleteSync`, JSON.stringify(getState().photo.deleteSync.toArray()));
};

export const UPLOAD_PROGRESS = 'UPLOAD_PROGRESS';
export const UPLOAD_PROGRESS_START = 'UPLOAD_PROGRESS_START';
export const UPLOAD_PROGRESS_END = 'UPLOAD_PROGRESS_END';
export const SET_PROBLEM_STATUS = 'SET_PROBLEM_STATUS';

export const deleteImageHandler = () => {

};
