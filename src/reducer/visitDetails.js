import {
    CREATE_VISIT_REQUEST, GET_VISIT_DETAILS_ERROR, GET_VISIT_DETAILS_REQUEST,
    GET_VISIT_DETAILS_RESPONSE
} from "../utils/constants";

export const init = {
    isFetch: false,
    error: null,
    visit: {}
};

export default (state = init, action) => {
    switch (action.type) {
        case CREATE_VISIT_REQUEST:
            return {...state, visit: {}};
        case GET_VISIT_DETAILS_REQUEST:
            return {...state, isFetch: true, error: null};
        case GET_VISIT_DETAILS_ERROR:
            return {...state, isFetch: false, error: null, visit: {}};
        case GET_VISIT_DETAILS_RESPONSE:
            return {...state, isFetch: false, error: null, visit: action.payload};
        default:
            return state
    }
}