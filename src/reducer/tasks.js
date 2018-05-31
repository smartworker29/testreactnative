import { List } from "immutable";
import { GET_TASKS_REQUEST_END, GET_TASKS_REQUEST_START, SET_TASKS } from "../utils/constants";

export const init = {
    isFetch: false,
    list: List()
};

export default (state = init, action) => {
    switch (action.type) {
        case GET_TASKS_REQUEST_START:
            return {...state, isFetch: true};
        case GET_TASKS_REQUEST_END:
            return {...state, isFetch: false};
        case SET_TASKS:
            //alert(action.payload);
            return {...state, list: List(action.payload)};
        default:
            return state
    }
}