import {
    DEBUG_CLEAR_OFFLINE_STORE,
    DEBUG_CLEAR_PHOTOS_STORE,
    DEBUG_CLEAR_SYNC_STORE,
    SET_APP_DATA,
    SET_RATIO_EXCEPTIONS,
    SET_SYNC_TIME,
    SHOW_TOAST
} from "../utils/constants";
import {AsyncStorage} from "react-native";

export const genSeed = () => {
    return Math.random().toString(32).substr(2);
};

export const init = {
    isConnected: false,
    syncTime: null,
    beenSyncVisit: false,
    beenSyncPhoto: false,
    sync: false,
    error: "",
    ratioExceptions: ['M5s', 'MEIZU_M5', 'SP56', 'WAS-LX1', 'SM-A500F', 'SM-G930F'],
    errorSeed: genSeed()
};

export default (state = init, action) => {
    switch (action.type) {
        case SHOW_TOAST :
            const errorSeed = action.errorSeed || state.errorSeed;
            return {...state, error: action.payload, errorSeed};
        case SET_APP_DATA :
            return {...state, ...action.payload};
        case SET_RATIO_EXCEPTIONS:
            return {...state, ratioExceptions: action.payload};
        case SET_SYNC_TIME :
            return {...state, syncTime: action.payload};
        case DEBUG_CLEAR_SYNC_STORE :
            //AsyncStorage.setItem("@visits_sync", "{}");
            return state;
        case DEBUG_CLEAR_PHOTOS_STORE:
            //AsyncStorage.setItem("@photo", "{}");
            return state;
        case DEBUG_CLEAR_OFFLINE_STORE :
            //AsyncStorage.setItem("@visits_offline", "{}");
            return state;
        default:
            return state
    }
}