import {NavigationActions} from 'react-navigation'
import visits from "../reducer/visits";
export const back = () => dispatch => dispatch(NavigationActions.back({key: null}))

export const goToCreateVisit = () => dispatch => dispatch(NavigationActions.navigate({routeName: 'CreateVisit'}));

export const goToSettings = () => dispatch => dispatch(NavigationActions.navigate({routeName: 'Settings'}));

export const goToVisitList = () => dispatch => dispatch(NavigationActions.navigate({routeName: 'VisitList'}));

export const visitDetails=(id)=>NavigationActions.navigate({
    routeName: 'VisitDetails',
    params: {id}
})
/**
 * Go to visit's details
 * @param id visit's id
 */
export const goToVisitDetails = (id) => dispatch => dispatch(visitDetails(id));

/**
 * Got to photo scene
 * @param id visit's id
 */
export const goToPhoto = (id) => dispatch => dispatch(NavigationActions.navigate({
        routeName: 'Photo',
        params: {id}
    }));