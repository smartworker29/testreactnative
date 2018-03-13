import { Dimensions, Platform } from 'react-native';

const dimen = Dimensions.get('window');

export const isIphoneX = () => Platform.OS === 'ios' && !Platform.isPad && !Platform.isTVOS && (dimen.height === 812 || dimen.width === 812)

const lockMap = new Map();
export const allowAction = (action, ms) => {

    if (lockMap.has(action)) {
        return false;
    }

    ms = ms || 2000;

    const timer = setTimeout(() => {
        lockMap.delete(action);
    }, ms)

    lockMap.set(action, timer);

    return true;
}