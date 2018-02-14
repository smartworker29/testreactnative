import {combineReducers} from 'redux';
import auth from './auth'
import photo from './photo'
import visits from './visits'
import nav from './navigator'

export default combineReducers({
    nav,
    auth,
    photo,
    visits
});