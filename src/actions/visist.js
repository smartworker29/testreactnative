import {base_url} from '../utils/const'
export const CREATE_VISIT_REQUEST = 'CREATE_VISIT_REQUEST'
export const CREATE_VISIT_RESPONSE = 'CREATE_VISIT_RESPONSE'
export const CREATE_VISIT_ERROR= 'CREATE_VISIT_ERROR'

export const createVisit = () =>(dispatch, getState) => {
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
        let json = response.json()
        console.log("response", response)
        if (response.ok) {
            dispatch({type: CREATE_VISIT_RESPONSE, payload:json})

        } else {
            dispatch({type: CREATE_VISIT_ERROR})
        }
    }).catch((error) => dispatch({type: CREATE_VISIT_ERROR, payload: error}))
}

export const GET_VISIT_REQUEST = 'GET_VISIT_REQUEST'
export const GET_VISIT_RESPONSE = 'GET_VISIT_RESPONSE'
export const GET_VISIT_ERROR= 'GET_VISIT_ERROR'

export const getVisitsList = () =>(dispatch, getState) => {
    dispatch({type: GET_VISIT_REQUEST})

    fetch(`${base_url}/visits/`,
        {
            headers: {
                'Authorization': `Token ${getState().auth.token}`,
                // 'Content-Type':'multipart/form-data',
            },
        }
    ).then(response => {
        let json = response.json()
        console.log("response", response)
        if (response.ok) {
            dispatch({type: GET_VISIT_RESPONSE, payload:json})

        } else {
            dispatch({type: GET_VISIT_ERROR})
        }
    }).catch((error) => dispatch({type: GET_VISIT_ERROR, payload: error}))
}