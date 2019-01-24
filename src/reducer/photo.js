import * as types from '../actions/photo'
import _ from "lodash"
import {Map, Set} from "immutable";
import {SET_PHOTO} from "../actions/photo";
import {DELETE_IMAGE} from "../actions/photo";
import {DELETE_IMAGE_REQUEST} from "../actions/photo";
import {DELETE_IMAGE_ERROR} from "../actions/photo";
import {UPLOAD_PROGRESS} from "../actions/photo";
import {UPLOAD_PROGRESS_END} from "../actions/photo";
import {UPLOAD_PROGRESS_START} from "../actions/photo";
import {SET_CAMERA_TYPE} from "../utils/constants";
import {Alert, Platform} from "react-native";
import uuidv4 from 'uuid/v4';
import ErrorLogging from "../utils/Errors";
import {ADD_DELETE_ID} from "../actions/photo";
import {SET_DELETE_IDS} from "../actions/photo";
import {SYNC_DELETE_IMAGE_START} from "../actions/photo";
import {SYNC_DELETE_IMAGE_END} from "../actions/photo";

export const init = {
    isFetch: false,
    error: null,
    uri: null,
    syncProcess: false,
    needSync: false,
    deleteFetch: false,
    deleteError: null,
    loadedProgress: new Map(),
    loadedTokens: new Map(),
    lastSyncDate: new Date(),
    photos: Map(),
    deleteSync: Set(),
    syncDeleteProcess: false,
    cameraTypeIos: Platform.OS === "ios" && Platform.Version >= "11.3" ? "AR_CAMERA" : "STANDARD_CAMERA"
};

const checkNeedSync = (photos) => {
    const photo = photos.find(photo => photo.isUploaded === false && photo.isProblem !== true);
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
                photo.isProblem = action.payload.problem;
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
                if (photo !== undefined) {
                    photo.isUploading = false;
                    photo.isUploaded = false;
                    return photo;
                }
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
                uuid: uuidv4(),
                index: action.payload.index,
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
            ErrorLogging.deletePhotoLog(action.payload, action.from);
            photos = photos.delete(action.payload);
            return {...state, photos, deleteFetch: false};
        case UPLOAD_PROGRESS_START:
            const data = {loaded: 0, total: 100};
            return {
                ...state,
                loadedProgress: state.loadedProgress.set(action.payload, data),
                loadedTokens: state.loadedTokens.set(action.payload, action.controller)
            };
        case UPLOAD_PROGRESS:
            return {
                ...state,
                loadedProgress: state.loadedProgress.set(action.payload.uri, action.payload.data)
            };
        case UPLOAD_PROGRESS_END:
            return {
                ...state,
                loadedProgress: state.loadedProgress.delete(action.payload),
                loadedTokens: state.loadedTokens.delete(action.payload)
            };
        case SET_CAMERA_TYPE:
            return {...state, cameraTypeIos: action.payload};
        case SET_DELETE_IDS:
            return {...state, deleteSync: Set(action.payload)};
        case ADD_DELETE_ID:
            return {...state, deleteSync: state.deleteSync.add(action.payload)};
        case SYNC_DELETE_IMAGE_START:
            return {...state, syncDeleteProcess: true};
        case SYNC_DELETE_IMAGE_END:
            return {
                ...state,
                syncDeleteProcess: false,
                deleteSync: action.payload ? state.deleteSync.delete(action.payload) : state.deleteSync
            };
        default:
            return state
    }
}