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
import {List} from "immutable";
import {SET_LAST_CUSTOMER} from "../actions/shops";

export const NEAREST = "nearest";
export const FAVORITES = "favorites";

export const init = {
    isFetch: false,
    isFetchNext: false,
    list: List(),
    next: null,
    error: null,
    favorites: List(),
    favoritePostRequest: false,
    type: NEAREST,
    geo: null,
    geoErrorCode: 0,
    geoIsFetch: false,
    shopIsFetch: false,
    lastCustomer: null
};

export default (state = init, action) => {
    switch (action.type) {
        case SHOPS_REQUEST:
            return {...state, isFetch: true};
        case SHOPS_REQUEST_END:
            return {...state, isFetch: false};
        case SHOPS_REQUEST_NEXT:
            return {...state, isFetchNext: true};
        case SHOPS_RESPONSE:
            return {...state, list: List(action.payload), isFetch: false, isFetchNext: false, next: action.next};
        case SET_FAVORITES:
            return {...state, favorites: List(action.payload)};
        case SET_FAVORITE_FETCH:
            return {...state, favoritePostRequest: action.payload};
        case SET_FAVORITE:
            const favorites = state.favorites.push({shop: action.payload});
            return {...state, favorites};
        case DEL_FAVORITE:
            return {...state, favorites: state.favorites.filter(fav => fav.shop !== action.payload)};
        case SET_GEO_FETCH:
            return {...state, geoIsFetch: action.payload};
        case SET_GEO_DATA:
            const {longitude, latitude} = action.payload;
            const geo = {longitude, latitude};
            return {...state, geoIsFetch: false, geo, geoErrorCode: 0};
        case SET_GEO_ERROR:
            return {...state, geoErrorCode: action.payload};
        case SELECT_NEAREST:
            return {...state, type: NEAREST};
        case SELECT_FAVORITES:
            return {...state, type: FAVORITES};
        case SHOPS_ERROR:
            return {...state, isFetch: false, isFetchNext: false, error: action.payload};
        case SHOP_REQUEST:
            return {...state, shopIsFetch: true};
        case SHOP_RESPONSE:
            return {...state, shopIsFetch: false};
        case SET_LAST_CUSTOMER:
            return {...state, lastCustomer: action.payload};
        default:
            return state;
    }
}