import {
    CHANGE_VISIT_ROUTE_REQUEST,
    CREATE_VISIT_REQUEST, GET_VISIT_DETAILS_ERROR, GET_VISIT_DETAILS_REQUEST,
    GET_VISIT_DETAILS_RESPONSE
} from "../utils/constants";
import {
    ADD_REASON_SYNC,
    INIT_SYNC_REASONS, SHIFT_SKU_SYNC,
    SEND_REASON_REQUEST,
    SEND_REASON_RESPONSE,
    SET_SKU_REASONS, SET_SKU_SYNC
} from "../actions/visitDetails";
import {Map, List} from "immutable"

export const init = {
    isFetch: false,
    error: null,
    routeChangeProcessing: false,
    visit: {},
    reasonSending: false,
    skuReasons: Map(),
    skuSync: List(),
    isSkuSync: false
};

export default (state = init, action) => {
    switch (action.type) {
        case CREATE_VISIT_REQUEST:
            return {...state, visit: {}};
        case GET_VISIT_DETAILS_REQUEST:
            return {...state, isFetch: true, error: null};
        case GET_VISIT_DETAILS_ERROR:
            return {...state, isFetch: false, error: null, visit: {}};
        case GET_VISIT_DETAILS_RESPONSE:
            return {...state, isFetch: false, error: null, visit: action.payload};
        case CHANGE_VISIT_ROUTE_REQUEST:
            return {...state, routeChangeProcessing: action.payload};
        case SEND_REASON_REQUEST:
            return {...state, reasonSending: true};
        case SET_SKU_REASONS:
            return {...state, skuReasons: Map(action.payload)};
        case SEND_REASON_RESPONSE:

            if (action.payload) {
                const {component, visit, gid, reason} = action.payload;
                return {
                    ...state,
                    reasonSending: false,
                    skuReasons: state.skuReasons.set(`${visit}_${component}_${gid}`, reason)
                };
            } else {
                return {...state, reasonSending: false}
            }
        case ADD_REASON_SYNC:
            return {...state, skuSync: state.skuSync.push(action.payload)};
        case INIT_SYNC_REASONS:
            return {...state, skuSync: List(action.payload)};
        case SET_SKU_SYNC:
            return {...state, isSkuSync: action.payload};
        case SHIFT_SKU_SYNC:
            return {...state, skuSync: state.skuSync.shift()};
        default:
            return state
    }
}