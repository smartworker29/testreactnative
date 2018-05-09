import {AppNavigator} from '../navigators/AppNavigator';
import {Platform, StatusBar} from "react-native";

const secondAction = AppNavigator.router.getActionForPathAndParams('Pin');

const initialNavState = AppNavigator.router.getStateForAction(
    secondAction,
    // tempNavState
);

export default (state = initialNavState, action) => {
    let nextState;
    switch (action.type) {
        case "Navigation/NAVIGATE" :
            if (Platform.OS !== 'ios') {
                const color = (action.routeName === "Results") ? "#5CBE3A" : "#757575";
                StatusBar.setBackgroundColor(color);
            }
        default:
            nextState = AppNavigator.router.getStateForAction(action, state);
            break;
    }

    // Simply return the original `state` if `nextState` is null or undefined.
    return nextState || state;
}
