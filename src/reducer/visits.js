import _ from "lodash"
import {
    CHANGE_VISIT_ID_RESPONSE,
    CREATE_VISIT_ERROR,
    CREATE_VISIT_REQUEST, CREATE_VISIT_RESPONSE, DELETE_OFFLINE_VISIT, GET_VISIT_DETAILS_RESPONSE,
    GET_VISIT_REQUEST, GET_VISIT_RESPONSE, REFRESH_VISIT_ERROR, REFRESH_VISIT_REQUEST, REFRESH_VISIT_RESPONSE,
    SET_LAST_CREATED_ID, SET_STORED_VISITS,
    SET_SYNC_VISIT,
    SET_VISIT_OFFLINE, SYNC_VISIT_END, SYNC_VISIT_REQUEST, SYNC_VISIT_RESPONSE, SYNC_VISIT_START
} from "../utils/constants";
import {Map, OrderedMap, List, OrderedSet} from "immutable";
import {SET_QUESTIONS, SET_UUID_VALUES} from "../actions/questions";
import {
    ADD_FEEDBACK_OFFLINE,
    DELETE_FEEDBACK_OFFLINE,
    INIT_FEEDBACK_OFFLINE, SET_FEEDBACK_ERROR,
    SET_FEEDBACK_SYNC
} from "../actions/visist";

export const init = {
    isFetch: false,
    isCreateFetch: false,
    isSync: false,
    syncVisitId: null,
    syncVisitError: "",
    refresh: false,
    hasMore: false,
    needSync: false,
    syncProcess: false,
    lastCreatedId: null,
    error: null,
    count: 0,
    visitLimit: 30,
    page: '1',
    result: [],
    sync: {},
    visitsQuestions: Map(),
    storedVisits: OrderedMap(),
    questions: Map(),
    uuidValues: Map(),
    isFeedbackSync: false,
    feedbackOffline: Map(),
    feedbackError: null,
    feedbackRequest: null,
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
            const getVisits = Map(action.payload.entities.visit).toObject();
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
            nState.entities.offline = {...action.payload, ...nState.entities.offline};
            return nState;

        case SET_LAST_CREATED_ID:
            return {...state, lastCreatedId: action.payload};

        case REFRESH_VISIT_RESPONSE:
            const limit = action.limit || state.visitLimit;
            const limitVisits = OrderedMap(action.payload.entities.visit).reverse().take(30);
            const refreshVisits = limitVisits.toObject();
            let tmpVisits = state.entities.offline || {};
            let tmpIds = [];
            if (state.entities.offline) {
                OrderedMap(state.entities.offline).forEach((val, key) => {
                    tmpIds.push(parseInt(key))
                })
            }

            let storedVisits = state.storedVisits;
            let additionalVisits = OrderedMap();
            let additionalIds = [];
            limitVisits.forEach(visit => {
                storedVisits = storedVisits.update(visit.id, _ => visit);
                additionalVisits = storedVisits.delete(visit.id)
            });
            additionalIds = additionalVisits.keySeq().sort().reverse().toArray();


            let ids = OrderedSet([...tmpIds, ...action.payload.result, ...additionalIds]).sort().reverse().take(limit).toArray();
            const _needSync = state.entities.offline ? _.keys(state.entities.offline).length : 0;
            let newVisits = OrderedMap().concat(tmpVisits).concat(refreshVisits).concat(additionalVisits);

            return {
                ...state,
                refresh: false,
                error: null,
                isFetch: false,
                result: [...ids],
                needSync: (_needSync > 0),
                entities: {visit: {...newVisits.toObject()}, offline: tmpVisits},
                count: action.payload.count,
                page: action.payload.page,
                storedVisits,
                hasMore: action.payload.hasMore
            };

        case GET_VISIT_DETAILS_RESPONSE:
            storedVisits = state.storedVisits.update(action.payload.id, _ => action.payload);
            return {...state, storedVisits};

        case CREATE_VISIT_REQUEST:
            return {...state, isCreateFetch: true, error: null};

        case CREATE_VISIT_ERROR:
            return {...state, isCreateFetch: false, error: action.payload};

        case CREATE_VISIT_RESPONSE:
            let offline = {...state.entities.offline};
            if (action.offline === true) {
                offline = {...offline, [action.payload.id]: action.payload}
            }

            if (!action.payload.local_started_date) {
                action.payload.local_started_date = (new Date()).toJSON();
            }

            let visitMap = Map(state.entities.visit).update(action.payload.id, _ => action.payload);
            return {
                ...state,
                isFetch: false,
                error: null,
                isCreateFetch: false,
                lastCreatedId: action.payload.id,
                entities: {visit: {...visitMap.toObject()}, offline},
                needSync: (action.offline === true),
                storedVisits: state.storedVisits.update(action.payload.id, _ => action.payload),
                result: [action.payload.id, ...state.result],
            };

        case DELETE_OFFLINE_VISIT:
            let newOffline = {...state.entities.offline};
            delete newOffline[action.payload];
            return {
                ...state,
                entities: {visit: {...state.entities.visit}, offline: {...newOffline}},
                storedVisits: state.storedVisits.delete(action.payload)
            };

        case SYNC_VISIT_REQUEST:
            return {...state, isSync: true};

        case SYNC_VISIT_RESPONSE:

            const needSync = (0 > 0);

            const visit = _.cloneDeep(state.entities.visit);
            visit[action.payload.id] = action.payload;
            delete visit[action.syncId];

            return {
                ...state,
                isFetch: false,
                error: null,
                entities: {visit, offline: {...state.entities.offline}},
                sync: {...state.sync, [action.syncId]: action.payload.id},
                needSync,
                result: List(state.result).delete(action.syncId).toArray(),
                storedVisits: state.storedVisits.update(action.payload.id, _ => action.payload).delete(action.syncId),
                syncVisitError: null
            };

        case SET_SYNC_VISIT:
            return {...state, sync: action.payload};

        case "SYNC_PHOTO_END":
            return {...state, isSync: false};

        case SYNC_VISIT_START:
            return {...state, syncProcess: true, syncVisitId: action.payload, syncVisitError: null};

        case SYNC_VISIT_END:
            return {...state, syncProcess: false, syncVisitId: null};

        case CHANGE_VISIT_ID_RESPONSE:
            const entities = _.cloneDeep(state.entities);
            entities.visit[action.payload.id] = action.payload;
            return {
                ...state,
                entities,
                storedVisits: state.storedVisits.update(action.payload.id, _ => action.payload)
            };

        case SET_STORED_VISITS:
            const _state = _.cloneDeep(state);
            _state.storedVisits = OrderedMap(action.payload);
            return _state;
        case SET_QUESTIONS:
            const [uuid, questions] = action.payload;
            return {...state, questions: state.questions.set(uuid, questions)};
        case SET_UUID_VALUES:
            return {...state, uuidValues: state.uuidValues.merge(action.payload)};
        case ADD_FEEDBACK_OFFLINE:
            return {...state, feedbackOffline: state.feedbackOffline.set(action.payload.key, action.payload.data)};
        case SET_FEEDBACK_SYNC:
            return {...state, isFeedbackSync: action.payload};
        case DELETE_FEEDBACK_OFFLINE:
            return {
                ...state,
                feedbackOffline: state.feedbackOffline.delete(action.payload),
                feedbackError: null,
                feedbackRequest: null
            };
        case INIT_FEEDBACK_OFFLINE:
            return {...state, feedbackOffline: Map(action.payload)};
        case SET_FEEDBACK_ERROR:
            return {...state, feedbackError: action.payload, feedbackRequest: action.meta};

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