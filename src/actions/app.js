import {CHANGE_CONNECTION_STATUS, SET_APP_DATA, SET_SYNC_TIME, SET_SYNC_VISIT} from "../utils/constants";
import {AsyncStorage} from "react-native";

export default changeConnectionStatus = (connected) => (dispatch) => {
    dispatch({type: CHANGE_CONNECTION_STATUS, payload: connected});
}

export const appInit = () => async (dispatch) => {
    const date = await AsyncStorage.getItem("@last_sync_time");
    if (date !== null) {
        dispatch({type: SET_SYNC_TIME, payload: date});
    } else {
        const newDate = new Date()
        await AsyncStorage.setItem("@last_sync_time", newDate);
        dispatch({type: SET_SYNC_TIME, payload: newDate});
    }
    await AsyncStorage.removeItem("@photo");
}
export const setSyncTime = () => (dispatch, getStore) => {
    if (getStore().app.beenSyncVisit === true || getStore().app.beenSyncPhoto === true) {
        const date = new Date()
        dispatch({type: SET_SYNC_TIME, payload: date})
        dispatch({type: SET_APP_DATA, payload: {beenSync: false}})
        AsyncStorage.setItem("@last_sync_time", date);
    }
}

