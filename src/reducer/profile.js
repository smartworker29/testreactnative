import {
    SET_PROFILE_CONTACT_NUMBER, SET_PROFILE_DATA, SET_PROFILE_FIELD_VALUE,
    SET_PROFILE_NAME,
    SET_PROFILE_PATH_NUMBER,
    SET_PROFILE_PATRONYMIC,
    SET_PROFILE_SURMANE, SET_STATISTICS
} from '../utils/constants'

export const init = {
    name: '',
    surname: '',
    patronymic: '',
    pathNumber: '',
    hasChanges: false,
    fields: {}
};

export default (state = init, action) => {
    switch (action.type) {
        case SET_PROFILE_DATA :
            return {...state, ...action.payload};
        case SET_PROFILE_NAME :
            return {...state, name: action.payload, hasChanges: true};
        case SET_PROFILE_SURMANE :
            return {...state, surname: action.payload, hasChanges: true};
        case SET_PROFILE_PATRONYMIC :
            return {...state, patronymic: action.payload, hasChanges: true};
        case SET_PROFILE_PATH_NUMBER :
            return {...state, pathNumber: action.payload, hasChanges: true};
        case SET_PROFILE_FIELD_VALUE:
            const fields = {...state.fields};
            fields[action.payload.field] = action.payload.value;
            return {...state, fields};
        default:
            return state
    }
}
