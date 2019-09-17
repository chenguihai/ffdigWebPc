import {GET_PRODUCT_DETAIL, GET_SIMILAR_PRODUCTS} from '../actions/detailPageAcrion'

const initialState = {
    productDetail: {
        // cmiCat: [],
        // product: {}
    },
    similarData: []
};

export default (state = initialState, action = {}) => {
    const {type, ...payload} = action;
    // Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);
    switch (type) {
        case GET_PRODUCT_DETAIL:
            return Object.assign({...state}, payload);
        case GET_SIMILAR_PRODUCTS:
            return Object.assign({...state}, payload);
        default:
            return state
    }
}