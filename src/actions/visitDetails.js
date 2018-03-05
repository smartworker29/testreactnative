import API from "../api"
import _ from "lodash";
import {
    CLEAR_VISIT_DETAILS, GET_VISIT_DETAILS_ERROR, GET_VISIT_DETAILS_REQUEST,
    GET_VISIT_DETAILS_RESPONSE, SHOW_TOAST
} from "../utils/constants";

export const getVisitDetails = (id) => async (dispatch) => {
    dispatch({type: GET_VISIT_DETAILS_REQUEST});

    try {
        const response = await API.getVisitDetails(id);

        if (response.status !== 200) {
            return dispatch({type: GET_VISIT_DETAILS_ERROR, payload: {error: response.data,}})
        }

        const visit = response.data;

        let updates = await API.getAgentUpdates();
        updates = updates.data;

        let lastVisitUpdate = _.orderBy(_.filter(updates, {visit: id}), ['id'], ['desc']).pop();
        if (lastVisitUpdate && lastVisitUpdate.message) {
            visit.detail = lastVisitUpdate.message;
        }

        if (response.status === 200) {
            dispatch({type: GET_VISIT_DETAILS_RESPONSE, payload: visit})
        }

    } catch (error) {
        dispatch({type: SHOW_TOAST, payload: "Проверьте соедениение"});
        dispatch({type: GET_VISIT_DETAILS_ERROR, payload: error})
    }
};

export const clearVisitDetails = () => async (dispatch) => {
    dispatch({type: CLEAR_VISIT_DETAILS});
}


