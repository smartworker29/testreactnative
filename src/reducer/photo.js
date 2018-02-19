import * as types from '../actions/photo'

export const init = {
    isFetch: false,
    error: null,
    uri: null,
    /**
     * {
     *    uri:{isUpload, isFetch}
     * }
     */
    urisByVisit: {},

}

export default (state = init, action) => {
    switch (action.type) {
        case types.UPLOAD_PHOTO_REQUEST:
            return {...state, isFetch: true, error: null}

        //
        // {
        //     "id": 31,
        //     "duplicate": true,
        //     "status": 30,
        //     "ir_job_id": null,
        //     "moderated_date": null,
        //     "moderation_time": null,
        //     "annotations_count_cached": 0,
        //     "created_date": "2018-02-17T16:01:23.742685Z",
        //     "ir_started_date": null,
        //     "ir_response_date": null,
        //     "media": 17662,
        //     "annotated_image": null,
        //     "visit": 10,
        //     "scene": 6,
        //     "primary_category": null,
        //     "moderated_by": null,
        //     "low_res_hq": 17663,
        //     "low_res_lq": 17664
        // }
        case types.UPLOAD_PHOTO_RESPONSE:
            return {
                ...state,
                isFetch: false,
                error: null,
                urisByVisit:{
                    ...state.urisByVisit,
                    [action.payload.visit]:{
                        ...state.urisByVisit[action.payload.visit],
                        [action.payload.uri]:{isUpload:true, isFetch:false, ...action.payload}

                    }
                }
            }
        case types.UPLOAD_PHOTO_ERROR:
            return {...state, isFetch: false, error: action.payload}

        case types.SYNC_PHOTO:
            return {...state, urisByVisit:{...action.payload}}
        case types.ADD_PHOTO:
            return {
                ...state,
                urisByVisit:{
                    ...state.urisByVisit,
                    [action.payload.id]:{
                        ...state.urisByVisit[action.payload.id],
                        [action.payload.uri]:{isUpload:false, isFetch:false, uri:action.payload.uri}

                    }
                }

            }
        // case
        // types.CLEAR_PHOTO
        // :
        //     return {...init}
        default:
            return state
    }
}