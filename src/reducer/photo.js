import * as types from '../actions/photo'

const init = {
    isFetch: false,
    uri: null,
    error: null

}

export default (state = init, action) => {
    switch (action.type) {
        case types.UPLOAD_PHOTO_REQUEST:
            return {...state, isFetch: true, error: null}
        case types.UPLOAD_PHOTO_RESPONSE:
            return {...state, isFetch: false, error: null}
        case types.UPLOAD_PHOTO_ERROR:
            return {...state, isFetch: false, error: action.payload}

        case types.ADD_PHOTO:
            return {...state, uri:action.payload.uri}
        default:
            return state
    }
}