import {
    FEEDBACK_CLEAR_ERROR,
    SEND_FEEDBACK_REQUEST,
    SEND_FEEDBACK_RESPONSE,
    SEND_FEEDBACK_TIMEOUT
} from "../utils/constants";

const init = {
    isFetch: false,
    error: null
};

export default (state = init, action) => {
    switch (action.type) {
        case SEND_FEEDBACK_REQUEST :
            return {...state, isFetch: true};
        case SEND_FEEDBACK_TIMEOUT:
            return {...state, isFetch: false, error: "Таймаут запрса."};
        case SEND_FEEDBACK_RESPONSE:
            return {...state, isFetch: false};
        case FEEDBACK_CLEAR_ERROR:
            return {...state, error: null};
        default:
            return state
    }
}
