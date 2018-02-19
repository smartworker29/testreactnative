import {base_url} from "../utils/api";
import {NavigationActions} from 'react-navigation'
import axios from 'axios'
import {AsyncStorage} from 'react-native'

export const ADD_PHOTO = 'ADD_PHOTO'
/**
 * Add photo to store
 * @param uri photo's uri
 * @param id visit's id
 */
export const addPhoto = (uri, id) => (dispatch, getState) => {
    const payload = {uri, id}
    let urisByVisit = {
        ...getState().photo.urisByVisit,
        [payload.id]: {
            ...getState().photo.urisByVisit[payload.id],
            [payload.uri]: {isUpload: false, isFetch: false, uri: payload.uri}

        }
    }

    AsyncStorage.setItem('@photo', JSON.stringify(urisByVisit))
        .then(() => dispatch({type: ADD_PHOTO, payload}));
}

export const CLEAR_PHOTO = 'CLEAR_PHOTO'
export const clearPhoto = () => (dispatch, getState) => dispatch({type: CLEAR_PHOTO})


export const UPLOAD_PHOTO_REQUEST = 'UPLOAD_PHOTO_REQUEST'
export const UPLOAD_PHOTO_RESPONSE = 'UPLOAD_PHOTO_RESPONSE'
export const UPLOAD_PHOTO_ERROR = 'UPLOAD_PHOTO_ERROR'
/**
 * Upload photo to server
 * @param uri photo's uri
 * @param id visit's id
 */
export const uploadPhoto = (uri, id) => (dispatch, getState) => {
    dispatch({type: UPLOAD_PHOTO_REQUEST,})
    var data = new FormData();
    console.log('photo', uri)
    data.append('datafile', {uri: uri, type: 'image/jpg', name: uri.replace(/^.*[\\\/]/, '')})
    axios({
        method: 'post',
        url: `${base_url}/visits/${id}/scene/0/upload/`,
        headers: {
            'Authorization': `Token ${getState().auth.token}`,
            // 'Content-Type':'multipart/form-data',
        }, data
    })
    // fetch(`${base_url}/visits/${id}/scene/0/upload/`,
    //     // fetch('https://app.inspector-cloud-staging.ru/api/v1.5/uploads/',
    //     {
    //         method: 'POST',
    //         headers: {
    //             'Authorization': `Token ${getState().auth.token}`,
    //             'Content-Type': 'multipart/form-data',
    //
    //
    //         },
    //         body: formData
    //     }
    // )
        .then(response => {
            console.log("response", response)
            if (response.status === 201) {
                let payload = {...response.data, visitId: id, uri: uri}
                let urisByVisit = {
                    ...getState().photo.urisByVisit,
                    [payload.visit]: {
                        ...getState().photo.urisByVisit[payload.visit],
                        [payload.uri]: {isUpload: true, ...payload}

                    }
                }
                AsyncStorage.setItem('@photo', JSON.stringify(urisByVisit))
                    .then(() => {
                        dispatch({type: UPLOAD_PHOTO_RESPONSE, payload})
                        dispatch(NavigationActions.back({key: null}))

                    });


            } else {
                dispatch({type: UPLOAD_PHOTO_ERROR, payload: {error: response.data,}})
            }

        }).catch((error) => {
        dispatch(NavigationActions.back({key: null}))

        return dispatch({type: UPLOAD_PHOTO_ERROR, payload: error})

    })
}

export const SYNC_PHOTO = 'SYNC_PHOTO'
export  const  syncPhoto = () => (dispatch, getState) => {
    AsyncStorage.getItem('@photo')
        .then(photo => dispatch({type: SYNC_PHOTO, payload: JSON.parse(photo)}));

}