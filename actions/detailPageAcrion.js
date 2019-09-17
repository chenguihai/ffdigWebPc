export const GET_PRODUCT_DETAIL = 'GET_PRODUCT_DETAIL';

export const getProductDetail = (data = {}) =>
    dispatch => {
        return dispatch({type: GET_PRODUCT_DETAIL, productDetail: data});
    };
export const GET_SIMILAR_PRODUCTS = 'GET_SIMILAR_PRODUCTS';

export const getSimilarProducts = (data = {}) =>
    dispatch => {
        return dispatch({type: GET_SIMILAR_PRODUCTS, similarData: data});
    };