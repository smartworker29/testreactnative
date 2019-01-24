import * as API from "../api";
import {
    DEL_FAVORITE,
    SELECT_FAVORITES,
    SELECT_NEAREST, SET_FAVORITE,
    SET_FAVORITE_FETCH,
    SET_FAVORITES, SET_GEO_DATA, SET_GEO_ERROR, SET_GEO_FETCH, SHOP_REQUEST, SHOP_RESPONSE,
    SHOPS_ERROR,
    SHOPS_REQUEST, SHOPS_REQUEST_END, SHOPS_REQUEST_NEXT,
    SHOPS_RESPONSE
} from "../utils/constants";
import {is} from "immutable";
import {AsyncStorage} from "react-native";
import {getCoordinates} from "../utils/util";
import I18n from "react-native-i18n";
import ErrorLogging from "../utils/Errors";
import AsyncStorageQueue from "../utils/AsyncStorageQueue";
import moment from "moment";

const wait = (timeout) => new Promise(resolve => {
    setTimeout(() => {
        resolve();
    }, timeout)
});

export const getShops = (next) => async (dispatch, getState) => {
    dispatch({type: SHOPS_REQUEST});
    if (next !== null) {
        dispatch({type: SHOPS_REQUEST_NEXT});
    }
    const [response, error] = await API.getShops(next);
    if (error !== null) {
        return;
    }
    dispatch({type: SHOPS_RESPONSE, payload: response.data.results, next: response.data.next, append: !!next});
};

export const getShopsNearest = () => async (dispatch, getState) => {

    if (getState().shops.geo === null) {
        return;
    }

    const id = getState().auth.id;
    const {longitude, latitude} = getState().shops.geo;
    dispatch({type: SHOPS_REQUEST});
    await wait(500);
    const response = await API.getNearestShops(id, latitude, longitude);

    if (response === null) {
        return dispatch({type: SHOPS_REQUEST_END});
    }
    dispatch({type: SHOPS_RESPONSE, payload: response.data, next: false});
};

export const getFavorites = () => async (dispatch, getState) => {
    const id = getState().auth.id;
    const response = await API.getFavoriteShop(id);
    if (!response) {
        return;
    }

    const pin = getState().auth.pin;
    if (!is(getState().shops.favorites, response.data)) {
        dispatch({type: SET_FAVORITES, payload: response.data});
        await AsyncStorage.setItem(`@${pin}_favorites`, JSON.stringify(response.data));
    }
};

export const initFavorites = () => async (dispatch, getState) => {
    const pin = getState().auth.pin;
    try {
        const favorites = JSON.parse(await AsyncStorage.getItem(`@${pin}_favorites`));
        dispatch({type: SET_FAVORITES, payload: favorites});
    } catch (error) {
        ErrorLogging.push("initFavorites parse error", error);
    }
};

export const selectNearest = () => (dispatch, getState) => {
    dispatch({type: SELECT_NEAREST});
};

export const selectFavorites = () => (dispatch, getState) => {
    dispatch({type: SELECT_FAVORITES});
};

export const setFavorite = (shopId) => async (dispatch, getState) => {
    const id = getState().auth.id;
    dispatch({type: SET_FAVORITE_FETCH, payload: true});
    const favShop = getState().shops.favorites.find(fav => fav.gps_shop.id === shopId);
    if (favShop) {
        const response = await API.deleteFavoriteShop(id, favShop.id);
        if (response !== null) {
            await getFavorites()(dispatch, getState);
        }
    } else {
        const response = await API.postFavoriteShop(id, shopId);
        if (response !== null) {
            await getFavorites()(dispatch, getState);
        }
    }
    dispatch({type: SET_FAVORITE_FETCH, payload: false});
};

export const updateGeo = (accur) => async (dispatch, getState) => {

    if (getState().shops.geoIsFetch === true) {
        return;
    }
    try {
        const coords = await getCoordinates(accur);
        dispatch({type: SET_GEO_DATA, payload: coords});
    } catch (error) {
        dispatch({type: SET_GEO_FETCH, payload: false});
        if (error.code) {
            dispatch({type: SET_GEO_ERROR, payload: error.code});
        }
        console.log(error);
    }
};

export const setGeo = (coords) => async (dispatch) => {
    dispatch({type: SET_GEO_DATA, payload: coords});
};

export const requestShopById = (id) => async (dispatch, getState) => {
    dispatch({type: SHOP_REQUEST});
    const shop = await API.getShop(id);
    console.log("shop", shop);
    dispatch({type: SHOP_RESPONSE});
    return (shop !== null) ? shop.data.results : null;
};

export const SET_LAST_CUSTOMER = 'SET_LAST_CUSTOMER';
export const setLastCustomer = (id) => (dispatch, getState) => {
    dispatch({type: SET_LAST_CUSTOMER, payload: id});
    const pin = getState().auth.pin;

};