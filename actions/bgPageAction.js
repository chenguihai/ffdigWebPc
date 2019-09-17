export const GET_PRODUCT_COLLECT_LOADING = 'GET_PRODUCT_COLLECT_LOADING';
export const GET_PRODUCT_COLLECT = 'GET_PRODUCT_COLLECT';
export const GET_PRODUCT_COLLECT_SITE_AND_CAT = 'GET_PRODUCT_COLLECT_SITE_AND_CAT';

export const getProductCollectActiveLoading = (data = {}) =>
    dispatch => {
        return dispatch({type: GET_PRODUCT_COLLECT_LOADING});
    };
export const getProductCollectActive = (data = {}) =>
    dispatch => {
        return dispatch({type: GET_PRODUCT_COLLECT, collectData: data});
    };
export const getProductCollectSiteAndCatActive = (data = {}) =>
    dispatch => {
        return dispatch({type: GET_PRODUCT_COLLECT_SITE_AND_CAT, siteCatTag: data});
    };
