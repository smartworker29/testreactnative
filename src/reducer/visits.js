import _ from "lodash"
import {
    CREATE_VISIT_ERROR,
    CREATE_VISIT_REQUEST, CREATE_VISIT_RESPONSE, GET_VISIT_DETAILS_RESPONSE,
    GET_VISIT_REQUEST, GET_VISIT_RESPONSE, REFRESH_VISIT_ERROR, REFRESH_VISIT_REQUEST, REFRESH_VISIT_RESPONSE,
    SET_SYNC_VISIT,
    SET_VISIT_OFFLINE, SYNC_VISIT_END, SYNC_VISIT_REQUEST, SYNC_VISIT_RESPONSE, SYNC_VISIT_START
} from "../utils/constants";
import { Map } from "immutable";
import * as types from "../actions/photo";

export const init = {
    isFetch: false,
    isCreateFetch: false,
    isSync: false,
    refresh: false,
    hasMore: false,
    needSync: false,
    syncProcess: false,
    error: null,
    count: 0,
    page: '1',
    result: [],
    sync: {},
    entities: {
        visit: {},
        offline: {}
    }
};

export default (state = init, action) => {
    switch (action.type) {
        case GET_VISIT_REQUEST:
            return {...state, isFetch: true, error: null};
        case GET_VISIT_RESPONSE:
            const getVisits = Map(action.payload.entities.visit).take(30).toObject();
            return {
                ...state, isFetch: false,
                error: null,
                result: [...state.result, ...action.payload.result],
                entities: {visit: {...state.entities.visit, ...getVisits}},
                count: action.payload.count,
                page: action.payload.page,
                hasMore: action.payload.hasMore
            };

        case REFRESH_VISIT_REQUEST:
            return {...state, isFetch: true, refresh: action.payload.isInit, error: null, page: 1, hasMore: false};

        case REFRESH_VISIT_ERROR:
            return {...state, isFetch: false, refresh: false, error: action.payload, page: 1, hasMore: false};

        case SET_VISIT_OFFLINE:
            const nState = _.cloneDeep(state);
            nState.entities.offline = {...action.payload, ...nState.entities.offline}
            return nState;

        case REFRESH_VISIT_RESPONSE:
            const refreshVisits = Map(action.payload.entities.visit).take(30).toObject();
            let tmpVisits = state.entities.offline || {};
            let tmpIds = [];
            if (state.entities.offline) {
                tmpIds = Object.keys(state.entities.offline)
            }
            let ids = [...tmpIds, ...action.payload.result].reduce((x, y) => x.includes(y) ? x : [...x, y], []);

            return {
                ...state,
                refresh: false,
                error: null,
                isFetch: false,
                result: [...ids],
                needSync: (tmpIds.length > 0),
                entities: {visit: {...tmpVisits, ...refreshVisits}, offline: tmpVisits},
                count: action.payload.count,
                page: action.payload.page,
                hasMore: action.payload.hasMore
            };

        case CREATE_VISIT_REQUEST:
            return {...state, isCreateFetch: true, error: null};

        case CREATE_VISIT_ERROR:
            return {...state, isCreateFetch: false, error: action.payload};

        case CREATE_VISIT_RESPONSE:
            let offline = {...state.entities.offline};

            if (action.offline === true) {
                offline = {...offline, [action.payload.id]: action.payload}
            }

            return {
                ...state,
                isFetch: false,
                error: null,
                isCreateFetch: false,
                entities: {visit: {...state.entities.visit, [action.payload.id]: action.payload}, offline},
                needSync: (action.offline === true),
                result: [action.payload.id, ...state.result],
            };

        case SYNC_VISIT_REQUEST:
            return {...state, isSync: true};

        case SYNC_VISIT_RESPONSE:

            const needSync = (Object.keys(action.offline).length > 0);

            const visit = _.cloneDeep(state.entities.visit)
            visit[action.payload.id] = action.payload;
            delete visit[action.syncId];

            return {
                ...state,
                isFetch: false,
                error: null,
                entities: {visit: visit, offline: action.offline},
                sync: {...state.sync, [action.syncId]: action.payload.id},
                needSync,
                result: Object.keys(visit).reverse(),
            };

        case SET_SYNC_VISIT:
            return {...state, sync: action.payload}

        case "SYNC_PHOTO_END":
            return {...state, isSync: false};

        case SYNC_VISIT_START:
            return {...state, syncProcess: true};

        case SYNC_VISIT_END:
            return {...state, syncProcess: false};

        case GET_VISIT_DETAILS_RESPONSE:
            return {
                ...state,
                isFetch: false,
                error: null,
                entities: {visit: {...state.entities.visit, [action.payload.id]: action.payload}}
            }


        // case types.GET_VISIT_DETAILS_REQUEST:
        //     return {...state, isFetch: true, error: null}
        // case types.GET_VISIT_DETAILS_RESPONSE:
        //     return {
        //         ...state, isFetch: false, error: null,
        //         entities: {
        //             visit: {...state.entities.visit, [action.payload.id]: action.payload}
        //         }
        //     }
        default:
            return state;
    }
}