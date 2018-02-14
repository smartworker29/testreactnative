import * as types from '../actions/visist'

export const init = {
    isFetch: false,
    refresh: false,
    hasMore: false,
    error: null,
    count: 0,
    page: '1',
    result: [],
    entities: {
        visit: {}
    }

}

export default (state = init, action) => {
    switch (action.type) {
        case types.GET_VISIT_REQUEST:
            return {...state, isFetch: true, error: null}
        case types.GET_VISIT_RESPONSE:
            return {
                ...state, isFetch: false,
                error: null,
                result: [...state.result, ...action.payload.result],
                entities: {visit: {...state.entities.visit, ...action.payload.entities.visit}},
                count: action.payload.count,
                page: action.payload.page,
                hasMore: action.payload.hasMore
            }

        case types.REFRESH_VISIT_REQUEST:
            return {...state, isFetch:true, refresh: action.payload.isInit, error: null, page: 1, hasMore: false}

        case types.REFRESH_VISIT_RESPONSE:
            return {
                ...state,
                refresh: false,
                error: null,
                isFetch:false,
                result: [...action.payload.result],
                entities: {visit: {...action.payload.entities.visit}},
                count: action.payload.count,
                page: action.payload.page,
                hasMore: action.payload.hasMore

            }

        case types.CREATE_VISIT_REQUEST:
            return {...state, isFetch: true, error: null}

        case types.CREATE_VISIT_RESPONSE:
            console.log('action',action)
            return {...state,
                isFetch: false,
                error: null,
                // entities: { visit: {...state.entities.visit, [action.payload.id]: action.payload} },
                // result:[ action.payload.id, ...state.result],
            }

        case types.GET_VISIT_DETAILS_REQUEST:
            return {...state, isFetch: true, error: null}
        case types.GET_VISIT_DETAILS_RESPONSE:
            return {
                ...state, isFetch: false, error: null,
                entities: {
                    visit: {...state.entities.visit, [action.payload.id]: action.payload}
                }
            }
        default:
            state
    }

    return state
}