import {AsyncStorage} from "react-native";
import {SET_AUTH_ID} from "../utils/constants";

export const authInit = () => async (dispatch) => {
    const id = JSON.parse(await AsyncStorage.getItem("@auth_id")) || null;
    dispatch({type: SET_AUTH_ID, payload: id})
}