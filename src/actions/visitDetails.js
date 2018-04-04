import API from "../api"
import _ from "lodash";
import {
    CLEAR_VISIT_DETAILS, GET_VISIT_DETAILS_ERROR, GET_VISIT_DETAILS_REQUEST,
    GET_VISIT_DETAILS_RESPONSE, SHOW_TOAST
} from "../utils/constants";

export const getVisitDetails = (id) => async (dispatch, getState) => {
    dispatch({type: GET_VISIT_DETAILS_REQUEST});

    try {
        const response = await API.getVisitDetails(id);

        if (response.status !== 200) {
            return dispatch({type: GET_VISIT_DETAILS_ERROR, payload: {error: response.data,}})
        }

        const visit = response.data;

        let updates = await API.getAgentUpdates(getState().auth.id);
        updates = updates.data;

        let lastVisitUpdate = _.orderBy(_.filter(updates, {
            visit: id,
            update_type: "VISIT RESULTS"
        }), ['id'], ['ASC']).pop();
        let lastModerateUpdate = _.orderBy(_.filter(updates, {
            visit: id,
            update_type: "VISIT MODERATION"
        }), ['id'], ['ASC']).pop();
        if (lastVisitUpdate && lastVisitUpdate.message) {
            visit.detail = lastVisitUpdate.message;
            visit.detailTime = lastVisitUpdate.created_date;
        }
        if (lastModerateUpdate && lastModerateUpdate.message) {
            visit.lastModerationMessage = lastModerateUpdate.message;
            visit.lastModerationTime = lastModerateUpdate.created_date;
        }
        if (response.status === 200) {
            dispatch({type: GET_VISIT_DETAILS_RESPONSE, payload: visit})
        }

    } catch (error) {
        dispatch({type: GET_VISIT_DETAILS_ERROR, payload: error})
    }
};

export const clearVisitDetails = () => async (dispatch) => {
    dispatch({type: CLEAR_VISIT_DETAILS});
}


