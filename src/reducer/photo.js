import * as types from '../actions/photo'
import _ from "lodash"
import {Map} from "immutable";
import {SET_PHOTO} from "../actions/photo";
import {DELETE_IMAGE} from "../actions/photo";
import {DELETE_IMAGE_REQUEST} from "../actions/photo";
import {DELETE_IMAGE_ERROR} from "../actions/photo";
import {UPLOAD_PROGRESS} from "../actions/photo";
import {UPLOAD_PROGRESS_END} from "../actions/photo";
import {UPLOAD_PROGRESS_START} from "../actions/photo";

export const init = {
    isFetch: false,
    error: null,
    uri: null,
    syncProcess: false,
    needSync: false,
    deleteFetch: false,
    deleteError: null,
    loadedProgress: new Map(),
    lastSyncDate: new Date(),
    photos: Map()
};

const checkNeedSync = (photos) => {
    const photo = photos.find(photo => photo.isUploaded === false);
    return !!(photo);
};

const getFilename = (path) => {
    return path.replace(/^.*[\\\/]/, '');
};

export default (state = init, action) => {
    let photos = state.photos;
    switch (action.type) {
        case types.UPLOAD_PHOTO_REQUEST:
            photos = photos.updateIn([action.payload.uri], photo => {
                photo.isUploading = true;
                photo.visit = action.payload.id;
                return photo;
            });
            return {...state, isFetch: true, error: null, photos};

        case types.UPLOAD_PHOTO_RESPONSE:
            photos = photos.updateIn([action.payload.uri], photo => {
                photo.visit = action.payload.visit;
                photo.tmpId = action.payload.tmpId;
                photo.id = action.payload.photoId;
                photo.isUploading = false;
                photo.isUploaded = true;
                return photo;
            });
            return {
                ...state,
                isFetch: false,
                error: null,
                lastSyncDate: new Date(),
                needSync: checkNeedSync(photos),
                photos
            };

        case SET_PHOTO:
            return {
                ...state,
                photos: Map(action.payload)
            };

        case types.UPLOAD_PHOTO_ERROR:
            photos = photos.updateIn([action.payload.uri], photo => {
                photo.isUploading = false;
                photo.isUploaded = false;
                return photo;
            });
            return {...state, photos, isFetch: false, error: action.payload.error};

        case types.SYNC_PHOTO_START:
            return {...state, syncProcess: true, needSync: checkNeedSync(state.photos)};

        case types.SYNC_PHOTO_END:
            return {...state, syncProcess: false, needSync: checkNeedSync(state.photos)};

        case types.ADD_PHOTO:
            photos = photos.set(action.payload.uri, {
                isUploaded: false,
                isUploading: false,
                uri: action.payload.uri,
                timestamp: Date.now(),
                visit: action.payload.id,
                tmpId: action.payload.tmpId,
                error: null
            });
            return {
                ...state,
                needSync: true,
                photos
            };
        case DELETE_IMAGE_REQUEST:
            return {...state, deleteFetch: true, deleteError: null};
        case DELETE_IMAGE_ERROR:
            return {...state, deleteError: action.payload, deleteFetch: false};
        case DELETE_IMAGE:
            photos = photos.delete(action.payload);
            return {...state, photos, deleteFetch: false};
        case UPLOAD_PROGRESS_START:
            const data = {loaded: 0, total: 100};
            return {...state, loadedProgress: state.loadedProgress.set(action.payload.uri, data)};
        case UPLOAD_PROGRESS:
            return {...state, loadedProgress: state.loadedProgress.set(action.payload.uri, action.payload.data)};
        case UPLOAD_PROGRESS_END:
            return {...state, loadedProgress: state.loadedProgress.delete(action.payload)};
        default:
            return state
    }
}