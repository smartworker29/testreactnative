import * as types from '../actions/visitDetails'

export const init = {
    isFetch: false,
    error: null,
    visit: {}
}

export default (state = init, action) => {
    switch (action.type) {
        case types.GET_VISIT_DETAILS_REQUEST:
            return {...state, isFetch: true, error: null}
        case types.GET_VISIT_DETAILS_ERROR:
            return {...state, isFetch: false, error: null}
        case types.GET_VISIT_DETAILS_RESPONSE:
            return {...state, isFetch: false, error: null, visit: action.payload}
        default:
            return state
    }
}