import {
    AGENT_FETCH,
    FETCH_PIN,
    FETCH_PIN_ERROR,
    FETCH_PIN_RESPONSE,
    SET_AUTH_ID,
    SET_PIN,
    SET_PINS, SYNC_PINS_END, SYNC_PINS_RESPONSE,
    SYNC_PINS_START
} from '../utils/constants'

const init = {
    token: null,
    url: null,
    id: null,
    pin: null,
    pins: {},
    agentFetch: false,
    wrongPin: false,
    isFetchPin: false,
    syncProcess: false
};

export default (state = init, action) => {
    switch (action.type) {
        case SET_AUTH_ID :
            return {...state, id: action.payload};
        case SET_PIN :
            return {...state, pin: action.payload, wrongPin: false};
        case AGENT_FETCH:
            return {...state, agentFetch: action.payload};
        case SET_PINS:
            return {...state, pins: action.payload};
        case FETCH_PIN:
            return {...state, isFetchPin: action.payload};
        case FETCH_PIN_RESPONSE:
            const {token, url} = action.payload;
            return {...state, token, url};
        case FETCH_PIN_ERROR:
            return {...state, pin: null, isFetchPin: false, wrongPin: true};
        case SYNC_PINS_START:
            return {...state, syncProcess: true};
        case SYNC_PINS_END:
            return {...state, syncProcess: false};
        default:
            return state
    }
}
