import {combineReducers} from 'redux';
import auth from './auth'
import photo from './photo'
import visits from './visits'
import visitDetails from './visitDetails'
import nav from './navigator'
import app from "./app";
import profile from "./profile";

export default combineReducers({
    app,
    nav,
    auth,
    photo,
    visits,
    profile,
    visitDetails
});