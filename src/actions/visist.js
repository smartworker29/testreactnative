import {normalize, schema} from 'normalizr'
import {base_url, Schemas, getParameterByName} from '../utils/api'
import {NavigationActions} from 'react-navigation'
import {visitDetails} from './navigation'
import {AsyncStorage} from 'react-native'
import axios from 'axios'

export const CREATE_VISIT_REQUEST = 'CREATE_VISIT_REQUEST'
export const CREATE_VISIT_RESPONSE = 'CREATE_VISIT_RESPONSE'
export const CREATE_VISIT_ERROR = 'CREATE_VISIT_ERROR'

export const createVisit = (shop) => (dispatch, getState) => {

    dispatch({type: CREATE_VISIT_REQUEST})
    axios({
        method: 'post',
        url: `${base_url}/visits/`,
        headers: {
            'Authorization': `Token ${getState().auth.token}`,
            // 'Content-Type':'multipart/form-data',
        },
    })
    // fetch(`${base_url}/visits/`,
    //     {
    //         method: 'POST',
    //         headers: {
    //             'Authorization': `Token ${getState().auth.token}`,
    //             // 'Content-Type':'multipart/form-data',
    //         },
    //     }
    // )
        .then(response => {
            console.log("response", response)

            if (response.status === 200) {
                // dispatch({type: CREATE_VISIT_RESPONSE, payload: json})
                // dispatch(visitDetails(json.id))
                AsyncStorage.setItem('@visits', JSON.stringify({
                    entities: {visit: {...getState().visits.entities.visit, [response.data.id]: response.data}},
                    result: [response.data.id, ...getState().visits.result],

                })).then(() => {
                    dispatch({type: CREATE_VISIT_RESPONSE, payload: response.data})
                    dispatch(visitDetails(response.data.id))

                })


            } else {
                dispatch({type: CREATE_VISIT_ERROR})
                // dispatch({type: CREATE_VISIT_ERROR, payload: {error: json, code: response.status}})
            }

        }).catch(error => {
        console.log('catch',error)
        if (error.status == undefined) {
            let payload = {id: new Date().getTime(), tmp: true, shop: shop, local_date: new Date()}
            console.log(payload)

            AsyncStorage.setItem('@visits', JSON.stringify({
                entities: {visit: {...getState().visits.entities.visit, [payload.id]: payload}},
                result: [payload.id, ...getState().visits.result],

            })).then(() => {
                dispatch({type: CREATE_VISIT_RESPONSE, payload})
                dispatch(visitDetails(payload.id))

            })

        } else {
            return dispatch({type: CREATE_VISIT_ERROR, payload: error})
        }
    })
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


                    AsyncStorage.setItem('@visits', JSON.stringify({
                        result: [...getState().visits.result, ...payload.result],
                        entities: {visit: {...getState().visits.entities.visit, ...payload.entities.visit}},
                        count: payload.count,
                        page: payload.page,
                        hasMore: payload.hasMore
                    }))
                        .then(a => dispatch({type: GET_VISIT_RESPONSE, payload}));

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
        //
        // fetch(`${base_url}/visits/?page=1`,
        //     {
        //         headers: {
        //             'Authorization': `Token ${getState().auth.token}`,
        //             'Content-Type': 'application/json',
        //         },
        //     }
        // )
        axios({
            method: 'get',
            url: `${base_url}/visits/?page=1`,
            timeout:2000,
            headers: {
                'Authorization': `Token ${getState().auth.token}`,
                'Content-Type': 'application/json',
                // 'Content-Type':'multipart/form-data',
            },
        }).then(response => {
            console.log("response", response)
            console.log("response", response.status)
            if (response.status ===200) {
                console.log("response", response)

                let page = 1
                    let hasMore = false;
                    if (response.data.next != null) {
                        page = getParameterByName('page', response.data.next)
                        hasMore = true
                    }
                    let payload = normalize(response.data.results, Schemas.VISIT_ARRAY)
                    payload.page = page
                    payload.count = response.data.count
                    payload.hasMore = hasMore
                console.log("payload", payload)

                AsyncStorage.setItem('@visits', JSON.stringify(payload))
                        .then(() => dispatch({type: REFRESH_VISIT_RESPONSE, payload:payload})).catch(e=>console.log(e));



            } else {
                dispatch({type: REFRESH_VISIT_ERROR})
            }
        }).catch(error => {
            console.log('catch', error)
            if (error.status == undefined)
                return dispatch({type: REFRESH_VISIT_ERROR, payload: {connection: false}})
            else return dispatch({type: REFRESH_VISIT_ERROR, payload: error})
        })

    }
}

export const syncVisitList = () => (dispatch, getState) => {
    dispatch({type: 'REFRESH_VISIT_REquest' })
    AsyncStorage.getItem('@visits')
        .then(visit => dispatch({type: REFRESH_VISIT_RESPONSE, payload: JSON.parse(visit)}));
}