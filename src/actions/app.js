export const CHANGE_CONNECTION_STATUS = 'CHANGE_CONNECTION_STATUS'

export default changeConnectionStatus = (connected) => (dispatch, getState) => (dispatch({
    type: CHANGE_CONNECTION_STATUS,
    payload: connected
}))

