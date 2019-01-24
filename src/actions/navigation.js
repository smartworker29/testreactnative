import {NavigationActions} from 'react-navigation'
import visits from "../reducer/visits";

export const back = () => dispatch => dispatch(NavigationActions.back({key: ""}));
export const backToList = () => dispatch => dispatch(NavigationActions.back({key: 'list'}));
export const backToDetails = () => dispatch => dispatch(NavigationActions.back({key: 'details'}));
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

export const visitDetailsAndReset = (id, tmp, openCamera, shop, favorites) => NavigationActions.reset({
    index: 2,
    actions: [
        NavigationActions.navigate({routeName: 'VisitList', params: {shop, favorites}}),
        NavigationActions.navigate({routeName: 'Tasks', params: {shop, favorites}}),
        NavigationActions.navigate({routeName: 'VisitDetails', params: {id, tmp, openCamera}})
    ]
});
/**
 * Go to visit's details
 * @param id visit's id
 * @param isOffline visit created offline
 */
export const goToVisitDetails = (id, isOffline) => dispatch => dispatch(visitDetails(id, isOffline));

export const goToPhoto = (id, backHandler, photoUUID = null, photoIndex = null) => dispatch => dispatch(NavigationActions.navigate({
    routeName: 'Photo',
    params: {
        id,
        backHandler,
        photoUUID,
        photoIndex
    }
}));

export const goToFeedback = (visitId, category) => dispatch => dispatch(NavigationActions.navigate({
    routeName: 'Feedback',
    params: {
        id: visitId,
        category
    }
}));

export const goToFeedbackCategories = (visitId) => dispatch => dispatch(NavigationActions.navigate({
    routeName: 'Categories',
    params: {
        id: visitId
    }
}));

export const goToQuestionnaire = (questions, uuid) => dispatch => dispatch(NavigationActions.navigate({
    routeName: 'Questionnaire',
    params: {questions, visitUuid: uuid}
}));

export const gotToPhotoView = (uri) => NavigationActions.navigate({
    routeName: 'PhotoView',
    params: {uri}
});