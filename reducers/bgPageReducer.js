import {
    GET_PRODUCT_COLLECT, GET_PRODUCT_COLLECT_LOADING, GET_PRODUCT_COLLECT_SITE_AND_CAT
} from '../actions/bgPageAction'

const initialState = {
    collectData: {
        list: [],
        totalCount: 0,
        totalPages: 0
    },
    siteCatTag: {
        SiteList: [], CatList: [], TagList: []
    },
    isLoading: true
};

export default (state = initialState, action = {}) => {
    const {type, ...payload} = action;
    // Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);
    switch (type) {
        case GET_PRODUCT_COLLECT:
            return Object.assign({...state}, payload, {isLoading: false});
        case GET_PRODUCT_COLLECT_LOADING:
            return Object.assign({...state}, {isLoading: true});
        case GET_PRODUCT_COLLECT_SITE_AND_CAT:
            return Object.assign({...state}, payload);
        default:
            return state
    }
}