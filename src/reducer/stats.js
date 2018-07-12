import { SET_STATISTICS } from '../utils/constants'

export const init = {
    date: "",
    failedVisits: 0,
    moderationSuccess: 0,
    moderationNew: 0,
    successVisits: 0,
    moderationFailed: 0
};

export default (state = init, action) => {
    switch (action.type) {
        case SET_STATISTICS: {
            return {
                ...state,
                date: action.payload.date,
                failedVisits: action.payload.failed_visits,
                moderationSuccess: action.payload.moderation_success,
                moderationNew: action.payload.moderation_new,
                successVisits: action.payload.success_visits,
                moderationFailed: action.payload.moderation_failed,
            }
        }
        default:
            return state
    }
}
