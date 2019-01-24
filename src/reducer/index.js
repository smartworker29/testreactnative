import {combineReducers} from 'redux';
import auth from './auth'
import photo from './photo'
import visits from './visits'
import visitDetails from './visitDetails'
import nav from './navigator'
import app from "./app";
import profile from "./profile";
import tasks from "./tasks";
import stats from "./stats";
import feedback from "./feedback";
import shops from "./shops";
import questions from "./questions";

export default combineReducers({
    app,
    nav,
    auth,
    tasks,
    stats,
    photo,
    visits,
    shops,
    feedback,
    profile,
    visitDetails,
    questions
});