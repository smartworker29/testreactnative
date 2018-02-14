import {normalize, schema} from 'normalizr'
import {base_url, Schemas, getParameterByName} from '../utils/api'
import {NavigationActions} from 'react-navigation'
import {visitDetails} from './navigation'

export const CREATE_VISIT_REQUEST = 'CREATE_VISIT_REQUEST'
export const CREATE_VISIT_RESPONSE = 'CREATE_VISIT_RESPONSE'
export const CREATE_VISIT_ERROR = 'CREATE_VISIT_ERROR'

export const createVisit = (shop) => (dispatch, getState) => {

    dispatch({type: CREATE_VISIT_REQUEST})

    fetch(`${base_url}/visits/`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Token ${getState().auth.token}`,
                // 'Content-Type':'multipart/form-data',
            },
        }
    ).then(response => {
        response.json().then(json => {
            console.log("response", response)
            if (response.ok) {
                dispatch({type: CREATE_VISIT_RESPONSE, payload: json})
                dispatch(visitDetails(json.id))
            } else {
                dispatch({type: CREATE_VISIT_ERROR, payload: {error: json, code: response.status}})
            }
        })

    }).catch((error) => dispatch({type: CREATE_VISIT_ERROR, payload: error}))
}

export const GET_VISIT_REQUEST = 'GET_VISIT_REQUEST'
export const GET_VISIT_RESPONSE = 'GET_VISIT_RESPONSE'
export const GET_VISIT_ERROR = 'GET_VISIT_ERROR'

export const getVisitsList = () => (dispatch, getState) => {
    if (!getState().visits.isFetch) {
        dispatch({type: GET_VISIT_REQUEST})

        // fetch(`${base_url}/visits/?page=1`,
        fetch(`${base_url}/visits/?page=${getState().visits.page}`,
            {
                headers: {
                    'Authorization': `Token ${getState().auth.token}`,
                    'Content-Type': 'application/json',
                },
            }
        ).then(response => {
            console.log("response", response)
            if (response.ok) {
                response.json().then(json => {
                    let page = 1
                    let hasMore = false;
                    if (json.next != null) {
                        page = getParameterByName('page', json.next)
                        hasMore = true
                    }
                    console.log(json)
                    let payload = normalize(json.results, Schemas.VISIT_ARRAY)
                    payload.page = page
                    payload.count = json.count
                    payload.hasMore = hasMore
                    dispatch({type: GET_VISIT_RESPONSE, payload})

                })

            } else {
                dispatch({type: GET_VISIT_ERROR})
            }
        }).catch((error) => dispatch({type: GET_VISIT_ERROR, payload: error}))
    }
}


export const REFRESH_VISIT_REQUEST = 'REFRESH_VISIT_REQUEST'
export const REFRESH_VISIT_RESPONSE = 'REFRESH_VISIT_RESPONSE'
export const REFRESH_VISIT_ERROR = 'REFRESH_VISIT_ERROR'

export const refreshVisitsList = (isInit) => (dispatch, getState) => {
    if (!getState().visits.isFetch) {

        dispatch({type: REFRESH_VISIT_REQUEST, payload: {isInit: isInit === undefined ? false : isInit}})

        fetch(`${base_url}/visits/?page=1`,
            {
                headers: {
                    'Authorization': `Token ${getState().auth.token}`,
                    'Content-Type': 'application/json',
                },
            }
        ).then(response => {
            console.log("response", response)
            if (response.ok) {
                response.json().then(json => {
                    let page = 1
                    let hasMore = false;
                    if (json.next != null) {
                        page = getParameterByName('page', json.next)
                        hasMore = true
                    }
                    console.log(json)
                    let payload = normalize(json.results, Schemas.VISIT_ARRAY)
                    payload.page = page
                    payload.count = json.count
                    payload.hasMore = hasMore
                    dispatch({type: REFRESH_VISIT_RESPONSE, payload})

                })

            } else {
                dispatch({type: REFRESH_VISIT_ERROR})
            }
        }).catch((error) => dispatch({type: REFRESH_VISIT_ERROR, payload: error}))
    }
}


export const GET_VISIT_DETAILS_REQUEST = 'GET_VISIT_DETAILS_REQUEST'
export const GET_VISIT_DETAILS_RESPONSE = 'GET_VISIT_DETAILS_RESPONSE'
export const GET_VISIT_DETAILS_ERROR = 'GET_VISIT_DETAILS_ERROR'

export const getVisitDetails = (id) => (dispatch, getState) => {
    dispatch({type: GET_VISIT_REQUEST,})

    console.log('token', getState().auth.token)
    fetch(`${base_url}/visits/${id}/`,
        {
            headers: {
                'Authorization': `Token ${getState().auth.token}`,
                'Content-Type': 'application/json',
            },
        }
    ).then(response => {
        console.log("response", response)

        response.json().then(json => {
            console.log(json)
            if (response.ok) {
                dispatch({type: GET_VISIT_DETAILS_RESPONSE, payload: json})

            } else {
                dispatch({type: GET_VISIT_DETAILS_ERROR, payload: {error: json, code: response.status}})

            }

        })


    }).catch((error) => {
        console.log('catch', error)
        dispatch({type: GET_VISIT_DETAILS_ERROR, payload: error})
    })
}


