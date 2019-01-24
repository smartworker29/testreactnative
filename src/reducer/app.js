import {
    DEBUG_CLEAR_OFFLINE_STORE,
    DEBUG_CLEAR_PHOTOS_STORE,
    DEBUG_CLEAR_SYNC_STORE,
    SET_APP_DATA, SET_FORCE_SYNC, SET_GEO_STATUS,
    SET_RATIO_EXCEPTIONS,
    SET_SYNC_TIME,
    SHOW_TOAST
} from "../utils/constants";
import {AsyncStorage} from "react-native";
import ErrorLogging from "../utils/Errors";

export const genSeed = () => {
    return Math.random().toString(32).substr(2);
};

export const init = {
    isConnected: false,
    syncTime: null,
    isForceSync: false,
    beenSyncVisit: false,
    beenSyncPhoto: false,
    sync: false,
    error: "",
    ratioExceptions: ["M5s", "MEIZU_M5", "SP56", "WAS-LX1", "SM-A500F", "SM-G930F", "K10a40Lenov", "SM-T311", "ZTE BLADE V7"],
    errorSeed: genSeed(),
    geoStatus: null
};

const excludeActions = [
    "SET_TASKS",
    "SET_PINS",
    "REFRESH_VISIT_REQUEST",
    "REFRESH_VISIT_RESPONSE",
    "FETCH_PIN",
    "FETCH_PIN_RESPONSE",
    "SET_STATISTICS",
    "SYNC_PINS_START",
    "SYNC_PINS_END",
    "GET_TASKS_REQUEST_START",
    "GET_TASKS_REQUEST_END",
    "Navigation/RESET",
    "Navigation/NAVIGATE",
    "Navigation/BACK",
    "Navigation/SET_PARAMS",
    "Navigation/COMPLETE_TRANSITION"
];

export default (state = init, action) => {

    if (!excludeActions.includes(action.type)) {
        ErrorLogging.storeReduxAction(action);
    }

    switch (action.type) {
        case SHOW_TOAST :
            const errorSeed = action.errorSeed || state.errorSeed;
            return {...state, error: action.payload, errorSeed};
        case SET_FORCE_SYNC:
            return {...state, isForceSync: action.payload};
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
        case SET_GEO_STATUS:
            return {...state, geoStatus: action.payload};
        default:
            return state
    }
}