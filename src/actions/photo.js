import { AsyncStorage } from 'react-native'
import API from "../api/"
import { getVisitDetails } from "./visitDetails";
import { SET_APP_DATA } from "../utils/constants";

export const ADD_PHOTO = 'ADD_PHOTO';
/**
 * Add photo to store
 * @param uri photo's uri
 * @param id visit's id
 */
export const addPhoto = (uri, id) => (dispatch, getState) => {
    dispatch({type: ADD_PHOTO, payload: {uri, id}});
};

export const CLEAR_PHOTO = 'CLEAR_PHOTO';
export const clearPhoto = () => (dispatch) => dispatch({type: CLEAR_PHOTO});

export const UPLOAD_PHOTO_REQUEST = 'UPLOAD_PHOTO_REQUEST';
export const UPLOAD_PHOTO_RESPONSE = 'UPLOAD_PHOTO_RESPONSE';
export const UPLOAD_PHOTO_ERROR = 'UPLOAD_PHOTO_ERROR';

export const uploadPhoto = (uri, id, visitId = null) => async (dispatch, getState) => {
    dispatch({type: UPLOAD_PHOTO_REQUEST, payload: {uri, id}});

    const data = new FormData();
    data.append('datafile', {uri: uri, type: 'image/jpg', name: uri.replace(/^.*[\\\/]/, '')});

    try {
        const response = await API.uploadPhoto(id, data);

        if (response.status !== 201) {
            return dispatch({type: UPLOAD_PHOTO_ERROR, payload: {uri, error: response.data}});
        }

        dispatch({type: UPLOAD_PHOTO_RESPONSE, payload: {id, uri, tmpId: visitId}});
        await dispatch(getVisitDetails(id));

    } catch (error) {
        console.log("error", error);
        dispatch({type: "SHOW_TOAST", payload: "Ошибка загрузки фото"});
        dispatch({type: UPLOAD_PHOTO_ERROR, payload: {uri, error}})
    }
};

export const SYNC_PHOTO_START = 'SYNC_PHOTO_START';
export const SYNC_PHOTO_END = 'SYNC_PHOTO_END';

export const syncPhoto = () => async (dispatch, getState) => {
    dispatch({type: SYNC_PHOTO_START});
    const sync = JSON.parse(await AsyncStorage.getItem('@visits_sync')) || {};
    let beenSyncPhoto = false;

    for (const [uri, photo] of getState().photo.photos) {
        if (photo.isUploading === true || photo.isUpload === true) {
            continue;
        }

        let id = photo.visit;

        if (sync[photo.visit] !== undefined) {
            id = sync[photo.visit];
        }

        try {
            await dispatch(uploadPhoto(uri, id, photo.visit));
            beenSyncPhoto = true;
        } catch (error) {
            dispatch({type: UPLOAD_PHOTO_ERROR, payload: error})
        }
    }

    dispatch({type: SET_APP_DATA, payload: {beenSyncPhoto}});
    dispatch({type: SYNC_PHOTO_END});
};
