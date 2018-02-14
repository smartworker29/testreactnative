import {base_url} from "../utils/api";
import {NavigationActions} from 'react-navigation'


export const ADD_PHOTO = 'ADD_PHOTO'
export const addPhoto = (uri) => (dispatch, getState) => dispatch({type: ADD_PHOTO, payload: {uri}})

export const CLEAR_PHOTO = 'CLEAR_PHOTO'
export const clearPhoto = () => (dispatch, getState) => dispatch({type: CLEAR_PHOTO})


export const UPLOAD_PHOTO_REQUEST = 'UPLOAD_PHOTO_REQUEST'
export const UPLOAD_PHOTO_RESPONSE = 'UPLOAD_PHOTO_RESPONSE'
export const UPLOAD_PHOTO_ERROR = 'UPLOAD_PHOTO_ERROR'

export const uploadPhoto = (uri, visitId) => (dispatch, getState) => {
    dispatch({type: UPLOAD_PHOTO_REQUEST,})
    var formData = new FormData();
    console.log('photo', uri)
    formData.append('datafile', {uri: uri, type: 'image/jpg', name: uri.replace(/^.*[\\\/]/, '')})

    fetch(`${base_url}/visits/${visitId}/scene/0/upload/`,
        // fetch('https://app.inspector-cloud-staging.ru/api/v1.5/uploads/',
        {
            method: 'POST',
            headers: {
                'Authorization': `Token ${getState().auth.token}`,
                'Content-Type': 'multipart/form-data',


            },
            body: formData
        }
    ).then(response => {
        console.log("response", response)
        response.json().then(json => {
            if (response.ok) {
                dispatch({type: UPLOAD_PHOTO_RESPONSE, payload:json})
                dispatch({type: CLEAR_PHOTO})
                dispatch(NavigationActions.back({key: null}))

            } else {
                dispatch({type: UPLOAD_PHOTO_ERROR, payload:{error:json, code:status}})
            }
        })

    }).catch((error) => dispatch({type: UPLOAD_PHOTO_ERROR, payload: error}))

}

