export const UPLOAD_PHOTO_REQUEST = 'UPLOAD_PHOTO_REQUEST'
export const UPLOAD_PHOTO_RESPONSE = 'UPLOAD_PHOTO_RESPONSE'
export const UPLOAD_PHOTO_ERROR = 'UPLOAD_PHOTO_ERROR'

export const uploadPhoto = (uri) => (dispatch, getState) => {
    dispatch({type: UPLOAD_PHOTO_REQUEST, })
    var formData = new FormData();
    console.log('photo', uri)
    formData.append('datafile', {uri:uri, type: 'image/jpg', name:uri.replace(/^.*[\\\/]/, '')})

    fetch('https://app.inspector-cloud-staging.ru/api/v1.5/uploads/',
        {
            method: 'POST',
            headers: {
                'Authorization': `Token ${getState().auth.token}`,
                'Content-Type':'multipart/form-data',


            },
            body: formData
        }
    ).then(response => {
        let json = response.json()
        console.log("response", response)
        if (response.ok) {
            dispatch({type: UPLOAD_PHOTO_RESPONSE})

        } else {
            dispatch({type: UPLOAD_PHOTO_ERROR})
        }
    }).catch((error) => dispatch({type: UPLOAD_PHOTO_ERROR, payload: error}))

}

export const ADD_PHOTO = 'ADD_PHOTO'
export const addPhoto = (uri) => (dispatch, getState) => dispatch({type: ADD_PHOTO, payload: {uri}})

