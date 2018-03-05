import { normalize } from 'normalizr'
import { base_url, Schemas, getParameterByName } from '../utils/api'
import { visitDetailsAndReset } from './navigation'
import { AsyncStorage } from 'react-native'
import axios from 'axios'
import API from '../api/index'
import {
    CREATE_VISIT_ERROR, CREATE_VISIT_REQUEST, CREATE_VISIT_RESPONSE, GET_VISIT_ERROR, GET_VISIT_RESPONSE,
    REFRESH_VISIT_ERROR,
    REFRESH_VISIT_REQUEST, REFRESH_VISIT_RESPONSE, SET_APP_DATA, SET_SYNC_VISIT,
    SET_VISIT_OFFLINE, SYNC_VISIT_REQUEST, SYNC_VISIT_RESPONSE
} from '../utils/constants'

export const createVisit = (shop) => async (dispatch, getState) => {

    dispatch({type: CREATE_VISIT_REQUEST})

    let coordinates = {}

    try {
        const {longitude, latitude} = await getCoordinates()
        coordinates.longitude = longitude;
        coordinates.latitude = latitude;
    } catch (error) {
        console.log(error)
    }

    // const data = {...coordinates, route: "PSHD12", customer_id: 12345};
    const data = {...coordinates, route: getState().profile.pathNumber, customer_id: shop}

    try {

        const response = await API.makeVisit(getState().auth.id, data)

        if (response.status !== 200) {
            return dispatch({type: CREATE_VISIT_ERROR})
        }

        await AsyncStorage.setItem('@visits', JSON.stringify({
            entities: {visit: {...getState().visits.entities.visit, [response.data.id]: response.data}},
            result: [response.data.id, ...getState().visits.result]
        }))

        dispatch({type: CREATE_VISIT_RESPONSE, payload: response.data})
        dispatch(visitDetailsAndReset(response.data.id))

    } catch (error) {

        if (error.status !== undefined) {
            return dispatch({type: CREATE_VISIT_ERROR, payload: error})
        }

        const id = new Date().getTime()

        const local_date = new Date().toJSON();
        const payload = {id, tmp: true, shop, results: false, moderation: false, local_date, data}

        await AsyncStorage.setItem('@visits_offline', JSON.stringify({
            ...getState().visits.entities.offline,
            [payload.id]: payload
        }))

        dispatch({type: CREATE_VISIT_RESPONSE, payload, offline: true})
        dispatch(visitDetailsAndReset(payload.id, true))
    }
}

const getCoordinates = async () => {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(data => {
            resolve(data.coords)
        }, error => reject(error))
    })
}

export const initVisits = () => async (dispatch) => {
    const offline = JSON.parse(await AsyncStorage.getItem('@visits_offline')) || {}
    dispatch({type: SET_VISIT_OFFLINE, payload: offline})
}

export const getVisitsList = () => async (dispatch, getState) => {

    if (getState().visits.isFetch) {
        return
    }

    try {
        let response = await axios({
            method: 'get',
            timeout: 2000,
            url: `${base_url}/visits/?page=${getState().visits.page}`,
            headers: {
                'Authorization': `Token ${getState().auth.token}`,
                'Content-Type': 'application/json'
            },
        })

        let page = 1
        let hasMore = false
        if (response.data.next != null) {
            page = getParameterByName('page', response.data.next)
            hasMore = true
        }

        let payload = normalize(response.data.results, Schemas.VISIT_ARRAY)
        payload.page = page
        payload.count = response.data.length
        payload.hasMore = hasMore

        await AsyncStorage.setItem('@visits', JSON.stringify({
            result: [...getState().visits.result, ...payload.result],
            entities: {visit: {...getState().visits.entities.visit, ...payload.entities.visit}},
            count: payload.count,
            page: payload.page,
            hasMore: payload.hasMore
        }))

        dispatch({type: GET_VISIT_RESPONSE, payload})

    } catch (error) {

        console.log(error)
        dispatch({type: GET_VISIT_ERROR, payload: error})
    }
}

export const refreshVisitsList = (isInit) => async (dispatch, getState) => {

    if (getState().visits.isFetch) {
        return
    }

    dispatch({type: REFRESH_VISIT_REQUEST, payload: {isInit: isInit === undefined ? false : isInit}})

    try {

        const response = await API.getVisitsByAgent(getState().auth.id)

        if (response.status !== 200) {
            return dispatch({type: REFRESH_VISIT_ERROR})
        }

        /*let page = 1;
        let hasMore = false;
        if (response.data.next != null) {
            page = getParameterByName('page', response.data.next);
            hasMore = true
        }*/

        let payload = normalize(response.data, Schemas.VISIT_ARRAY)
        payload.page = 1
        payload.count = response.data.length
        payload.hasMore = false

        await AsyncStorage.setItem('@visits', JSON.stringify(payload))
        dispatch({type: REFRESH_VISIT_RESPONSE, payload: payload})

    } catch (error) {

        console.log(error)

        if (error.message.indexOf('403') !== -1) {
            return dispatch({type: 'SHOW_TOAST', payload: 'Ошибка авторизации'})
        }

        //dispatch({type: "SHOW_TOAST", payload: "Данные из кэша"});
        const cash = JSON.parse(await AsyncStorage.getItem('@visits')) || {}
        dispatch({type: REFRESH_VISIT_RESPONSE, payload: cash})

        if (error.status === undefined) {
            return dispatch({type: REFRESH_VISIT_ERROR, payload: {connection: false}})
        } else return dispatch({type: REFRESH_VISIT_ERROR, payload: error})
    }
}

export const syncVisitList = () => async (dispatch, getState) => {
    dispatch({type: SYNC_VISIT_REQUEST})
    const offline = JSON.parse(await AsyncStorage.getItem('@visits_offline')) || {}
    const sync = JSON.parse(await AsyncStorage.getItem('@visits_sync')) || {}
    let beenSyncVisit = false

    for (const item of Object.values(offline)) {
        if (await API.getVisitDetail(item.id) === null) {
            const created = await API.makeVisit(getState().auth.id, item.data)
            if (created !== null) {
                sync[item.id] = created.data.id
                delete offline[item.id]
                beenSyncVisit = true
                dispatch({type: SYNC_VISIT_RESPONSE, payload: created.data, syncId: item.id, offline})
            }
        }
    }

    dispatch({type: SET_APP_DATA, payload: {beenSyncVisit}})
    await AsyncStorage.setItem('@visits_offline', JSON.stringify(offline))
    await AsyncStorage.setItem('@visits_sync', JSON.stringify(sync))

    if (Object.keys(sync) > 0) {
        //dispatch({type: "SHOW_TOAST", payload: "Синхронизированно"});
    }

    //console.log(offline);
    //return dispatch({type: REFRESH_VISIT_RESPONSE, payload: JSON.parse(visit)})
}