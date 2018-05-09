import {Dimensions, Platform} from 'react-native';
import {photoDir} from "./constants";
import {basename} from 'react-native-path';
import DeviceInfo from 'react-native-device-info';

const dimen = Dimensions.get('window');

export const isIphoneX = () => Platform.OS === 'ios' && !Platform.isPad && !Platform.isTVOS && (dimen.height === 812 || dimen.width === 812);

const lockMap = new Map();
export const allowAction = (action, ms) => {

    if (lockMap.has(action)) {
        return false;
    }

    ms = ms || 2000;

    const timer = setTimeout(() => {
        lockMap.delete(action);
    }, ms);

    lockMap.set(action, timer);

    return true;
};

export const getPhotoPathWithPrefix = (path) => {
    const fileName = basename(path);
    return "file://" + photoDir + fileName;
};

export const getPhotoPath = (path) => {
    const fileName = basename(path);
    return photoDir + fileName;
};

export const getDeviceInfo = async () => {
    return {
        battery_level: String(await DeviceInfo.getBatteryLevel()),
        brand: DeviceInfo.getBrand(),
        model: DeviceInfo.getModel(),
        build_number: DeviceInfo.getBuildNumber(),
        carrier: DeviceInfo.getCarrier(),
        uid: DeviceInfo.getUniqueID(),
        manufacturer: DeviceInfo.getManufacturer(),
        device_id: DeviceInfo.getDeviceId(),
        system_name: DeviceInfo.getSystemName(),
        system_version: DeviceInfo.getSystemVersion(),
        version: DeviceInfo.getVersion(),
        bundle_id: DeviceInfo.getBundleId(),
        device_name: DeviceInfo.getDeviceName(),
        user_agent: DeviceInfo.getUserAgent(),
        device_location: DeviceInfo.getDeviceLocale(),
        device_country: DeviceInfo.getDeviceCountry(),
        timezone: DeviceInfo.getTimezone(),
        total_memory: String(DeviceInfo.getTotalMemory())
    };
};