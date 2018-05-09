import {NavigationActions} from 'react-navigation'
import visits from "../reducer/visits";

export const back = () => dispatch => dispatch(NavigationActions.back({key: ""}));
export const backToList = () => dispatch => dispatch(NavigationActions.back({key: 'list'}));

export const backTo = (scene) => dispatch => dispatch(NavigationActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({routeName: scene})]
}));

export const goToCreateVisit = () => dispatch => dispatch(NavigationActions.navigate({routeName: 'CreateVisit'}));
export const goToProfile = () => dispatch => dispatch(NavigationActions.navigate({routeName: 'Profile'}));

export const goToVisitList = () => dispatch => dispatch(NavigationActions.navigate({routeName: 'VisitList'}));

export const visitDetails = (id, tmp) => NavigationActions.navigate({
    routeName: 'VisitDetails',
    params: {id, tmp}
});

export const resetToList = () => NavigationActions.reset({
    index: 0,
    actions: [
        NavigationActions.navigate({routeName: 'VisitList'})
    ]
});

export const resetToPin = () => NavigationActions.reset({
    index: 0,
    actions: [
        NavigationActions.navigate({routeName: 'Pin'})
    ]
});

export const resetToProfile = () => NavigationActions.reset({
    index: 0,
    actions: [
        NavigationActions.navigate({routeName: 'Profile', params: {lock: true}})
    ]
});

export const visitDetailsAndReset = (id, tmp, openCamera) => NavigationActions.reset({
    index: 1,
    actions: [
        NavigationActions.navigate({routeName: 'VisitList'}),
        NavigationActions.navigate({routeName: 'VisitDetails', params: {id, tmp, openCamera}})
    ]
});
/**
 * Go to visit's details
 * @param id visit's id
 * @param isOffline visit created offline
 */
export const goToVisitDetails = (id, isOffline) => dispatch => dispatch(visitDetails(id, isOffline));

/**
 * Got to photo scene
 * @param id visit's id
 */
export const goToPhoto = (id, backHandler) => dispatch => dispatch(NavigationActions.navigate({
    routeName: 'Photo',
    params: {
        id,
        backHandler
    }
}));

export const goToFeedback = (visitId) => dispatch => dispatch(NavigationActions.navigate({
    routeName: 'Feedback',
    params: {
        id: visitId
    }
}));

export const gotToPhotoView = (uri) => NavigationActions.navigate({
    routeName: 'PhotoView',
    params: {uri}
});