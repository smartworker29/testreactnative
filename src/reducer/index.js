import {combineReducers} from 'redux';
import auth from './auth'
import photo from './photo'

export default combineReducers({
    auth,
    photo
});