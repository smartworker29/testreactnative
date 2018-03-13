import * as types from '../actions/photo'
import _ from "lodash"
import { Map } from "immutable";
import { SET_PHOTO_CACHE } from "../actions/photo";

export const init = {
    isFetch: false,
    error: null,
    uri: null,
    syncProcess: false,
    needSync: false,
    photos: Map(),
    cache: Map()
};

const checkNeedSync = (photos) => {
    let needSync = false;
    for (const [, val] of photos) {
        needSync = (val.isUploaded === false)
    }

    return needSync;
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
                return photo;
            })
            return {...state, isFetch: true, error: null, photos};

        case SET_PHOTO_CACHE:
            return {
                ...state,
                cache: Map(action.payload)
            };

        case types.UPLOAD_PHOTO_RESPONSE:
            photos = state.photos.delete(action.payload.uri).delete(action.payload.tmpId);

            return {
                ...state,
                isFetch: false,
                error: null,
                needSync: checkNeedSync(photos),
                photos,
                cache: state.cache.set(getFilename(action.payload.uri), action.payload)
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
            photos = state.photos.set(action.payload.uri, {
                isUpload: false,
                isUploading: false,
                uri: action.payload.uri,
                visit: action.payload.id,
                error: null
            });
            return {
                ...state,
                needSync: true,
                photos
            };
        // case
        // types.CLEAR_PHOTO
        // :
        //     return {...init}
        default:
            return state
    }
}