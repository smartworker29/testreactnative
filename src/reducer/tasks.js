import {List, Map} from "immutable";
import {
    ADD_TASK_NAME,
    GET_TASKS_REQUEST_END,
    GET_TASKS_REQUEST_START,
    SET_TASK_NAMES,
    SET_TASKS
} from "../utils/constants";

export const init = {
    isFetch: false,
    list: List(),
    taskNames: Map(),
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
        case SET_TASK_NAMES:
            return {...state, taskNames: Map(action.payload)};
        case ADD_TASK_NAME:
            return {...state, taskNames: state.taskNames.set(action.payload.id, action.payload.name)};
        default:
            return state
    }
}