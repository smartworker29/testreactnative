import {SET_APP_DATA, SET_SYNC_TIME, SHOW_TOAST} from "../utils/constants";

export const init = {
    isConnected: false,
    syncTime: null,
    beenSyncVisit: false,
    beenSyncPhoto: false,
    sync: false,
    error: ""
};

export default (state = init, action) => {
    switch (action.type) {
        case SHOW_TOAST :
            return {...state, error: action.payload};
        case SET_APP_DATA :
            return {...state, ...action.payload}
        case SET_SYNC_TIME :
            return {...state, syncTime: action.payload};
        default:
            return state
    }
}