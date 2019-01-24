import {Dimensions, Platform, Clipboard, ToastAndroid} from 'react-native';
import {photoDir} from "./constants";
import {basename} from 'react-native-path';
import DeviceInfo from 'react-native-device-info';
import {readDir} from "react-native-fs";
import Geolocation from "react-native-geolocation-service";
import I18n from "react-native-i18n";
import striptags from "striptags";
let Snackbar;
if (Platform.OS === "ios") {
    Snackbar = require('react-native-snackbar');
}
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

export const getFileSize = async (uri) => {
    const files = await readDir(photoDir);
    for (const file of files) {
        if (file.path === getPhotoPath(uri)) {
            return file.size;
        }
    }
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
    try {
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
    } catch (error) {
        return {}
    }
};

export const distance = (lat1, lon1, lat2, lon2) => {
    let R = 6371;
    let dLat = (lat2 - lat1) * Math.PI / 180;
    let dLon = (lon2 - lon1) * Math.PI / 180;
    let a = 0.5 - Math.cos(dLat) / 2 + Math.cos(lat1 * Math.PI / 180)
        * Math.cos(lat2 * Math.PI / 180) * (1 - Math.cos(dLon)) / 2;

    const distance = (R * 2 * Math.asin(Math.sqrt(a))).toFixed(3);
    const [, meter] = String(distance).split(".");
    return (distance > 1) ? Math.round(distance) + ` ${I18n.t("shops.km")}` : meter + ` ${I18n.t("shops.m")}`;
};

export const distanceM = (lat1, lon1, lat2, lon2) => {
    let R = 6371;
    let dLat = (lat2 - lat1) * Math.PI / 180;
    let dLon = (lon2 - lon1) * Math.PI / 180;
    let a = 0.5 - Math.cos(dLat) / 2 + Math.cos(lat1 * Math.PI / 180)
        * Math.cos(lat2 * Math.PI / 180) * (1 - Math.cos(dLon)) / 2;
    const distance = (R * 2 * Math.asin(Math.sqrt(a))).toFixed(3);
    const [km, meter] = String(distance).split(".");
    return parseInt(km) * 1000 + parseInt(meter);
};

export const getCoordinates = async () => {
    return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
            position => {
                resolve(position.coords)
            },
            error => {
                reject(error)
            },
            {enableHighAccuracy: true, timeout: 15000, maximumAge: 0}
        );
    })
};

export const getPhotoFromVisit = (id, photos, sync)  => {
    return photos.filter(photo => {
        return photo.visit === id || photo.tmpId === id || sync[photo.visit] === id;
    }).sort((a, b) => {
        if (a.index < b.index) {
            return -1;
        }
        if (a.index > b.index) {
            return 1;
        }
        if (a.index === b.index) {
            return 0;
        }
    }).toList();
};

export const copyToClipboard = (value) => {
    Clipboard.setString(striptags(value));
    if (Platform.OS === "android") {
        ToastAndroid.show('Скопированно в буфер обмена', ToastAndroid.SHORT);
    } else {
        Snackbar.default.show({title: "Скопированно в буфер обмена"})
    }
};