import * as API from "../api";
import { SET_STATISTICS } from "../utils/constants";

export const getStatistics = () => async (dispatch, getStore) => {
    const agentId = getStore().auth.id;
    const response = await API.getStats(agentId);
    if (response === null) {
        return
    }
    dispatch({type: SET_STATISTICS, payload: response.data});
}