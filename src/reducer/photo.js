import * as types from '../actions/photo'
import _ from "lodash"
import { Map } from "immutable";
import { SET_PHOTO } from "../actions/photo";

export const init = {
    isFetch: false,
    error: null,
    uri: null,
    syncProcess: false,
    needSync: false,
    photos: Map()
};

const checkNeedSync = (photos) => {
    const photo = photos.find(photo => photo.isUploaded === false);
    return !!(photo);
};

const getFilename = (path) => {
    return path.replace(/^.*[\\\/]/, '');
}

export default (state = init, action) => {
    let photos = state.photos;
    switch (action.type) {
        case types.UPLOAD_PHOTO_REQUEST:
            photos = photos.updateIn([action.payload.uri], photo => {
                photo.isUploading = true;
                photo.visit = action.payload.id
                return photo;
            })
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
            })
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
                visit: action.payload.id,
                tmpId: null,
                error: null
            });
            return {
                ...state,
                needSync: true,
                photos
            };
        default:
            return state
    }
}