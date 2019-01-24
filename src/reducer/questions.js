import _ from "lodash"
import {Map, Set} from "immutable";
import {
    DELETE_ANSWER_SYNC,
    INIT_ANSWERS,
    INIT_QUESTIONS,
    INIT_UUID_VALUES,
    SET_ANSWERS, SET_ANSWERS_SYNC,
    SET_QUESTIONS, SET_QUESTIONS_REQUIRED,
    SET_UUID_VALUES, SYNC_ANSWER_COMPLETE, SYNC_ANSWER_END, SYNC_ANSWER_START
} from "../actions/questions";

export const init = {
    questions: Map(),
    uuidValues: Map(),
    answers: Map(),
    isSync: false,
    sync: Map(),
    required: Set()
};

export default (state = init, action) => {
    switch (action.type) {
        case INIT_QUESTIONS:
            return {...state, questions: Map(action.payload)};
        case SET_QUESTIONS:
            const [uuid, questions] = action.payload;
            return {...state, questions: state.questions.set(uuid, questions)};
        case INIT_UUID_VALUES:
            return {...state, uuidValues: Map(action.payload)};
        case SET_UUID_VALUES:
            return {...state, uuidValues: state.uuidValues.merge(action.payload)};
        case INIT_ANSWERS:
            return {...state, answers: Map(action.payload)};
        case SET_ANSWERS:
            return {...state, answers: state.answers.merge(action.payload)};
        case SYNC_ANSWER_START:
            return {...state, isSync: true};
        case SYNC_ANSWER_END:
            return {...state, isSync: false};
        case SYNC_ANSWER_COMPLETE:
            return {...state, sync: state.sync.update(action.payload, _ => true)};
        case SET_ANSWERS_SYNC:
            return {...state, sync: Map(action.payload)};
        case DELETE_ANSWER_SYNC:
            return {...state, sync: state.sync.delete(action.payload)};
        case SET_QUESTIONS_REQUIRED:
            return {...state, required: state.required.merge(action.payload)};
        default:
            return state;
    }
}