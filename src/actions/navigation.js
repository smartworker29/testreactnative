import {NavigationActions} from 'react-navigation'

export const back = () => dispatch => dispatch(NavigationActions.back({key: null}))

export const goToCreateVisit = () => dispatch => dispatch(NavigationActions.navigate({routeName: 'CreateVisit'}));

export const goToSettings = () => dispatch => dispatch(NavigationActions.navigate({routeName: 'Settings'}));