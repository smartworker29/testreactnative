import API, {updateId, updateVisit} from "../api"
import _ from "lodash";
import {
    CHANGE_VISIT_ID_REQUEST, CHANGE_VISIT_ID_RESPONSE, CHANGE_VISIT_ROUTE_REQUEST, CHANGE_VISIT_ROUTE_RESPONSE,
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
};


export const changeId = (id, data) => async (dispatch) => {
    dispatch({type: CHANGE_VISIT_ID_REQUEST});
    const result = await updateId(id, data);
    if (result === null) {
        return;
    }
    dispatch({type: CHANGE_VISIT_ID_RESPONSE, payload: result.data});
};

export const changeRoute = (id, route) => async (dispatch) => {
    dispatch({type: CHANGE_VISIT_ROUTE_REQUEST});
    const result = await updateVisit(id, {current_agent_route: route});
    console.log(result);
    if (result === null) {
        return;
    }
    dispatch({type: CHANGE_VISIT_ID_RESPONSE, payload: result.data});
};

