import {base_url} from '../utils/api'
import axios from 'axios'

export const GET_VISIT_DETAILS_REQUEST = 'GET_VISIT_DETAILS_REQUEST'
export const GET_VISIT_DETAILS_RESPONSE = 'GET_VISIT_DETAILS_RESPONSE'
export const GET_VISIT_DETAILS_ERROR = 'GET_VISIT_DETAILS_ERROR'

export const getVisitDetails = (id) => (dispatch, getState) => {
    dispatch({type: GET_VISIT_DETAILS_REQUEST,})

    // console.log('token', getState().auth.token)
    // fetch(`${base_url}/visits/${id}/`,
    //     {
    //         headers: {
    //             'Authorization': `Token ${getState().auth.token}`,
    //             'Content-Type': 'application/json',
    //         },
    //     }
    // )
    axios({
        method: 'get',
        url: `${base_url}/visits/${id}/`,
        timeout:2000,
        headers: {
            'Authorization': `Token ${getState().auth.token}`,
            // 'Content-Type':'multipart/form-data',
        },
    })
        .then(response => {
        console.log("response", response)

            if (response.status ===200) {
                dispatch({type: GET_VISIT_DETAILS_RESPONSE, payload: response.data})

            } else {
                dispatch({type: GET_VISIT_DETAILS_ERROR, payload: {error: response.data,}})

            }



    }).catch((error) => {
        console.log('catch', error)
        dispatch({type: GET_VISIT_DETAILS_ERROR, payload: error})
    })
}


