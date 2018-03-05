import { SET_AUTH_ID } from '../utils/constants'

const init = {
  token: '5969cde32ee95eaa406baffefe9f6f899c2a8eec',
  id: null
}

export default (state = init, action) => {
  switch (action.type) {
    case SET_AUTH_ID :
      return {...state, id: action.payload}
    default:
      return state
  }
}
