export const GET_NAME_CAT = 'GET_NAME_CAT';
export const GLOBAL_BREAD_CRUMB = 'GLOBAL_BREAD_CRUMB';
export const SEARCH_TITLE = 'SEARCH_TITLE';
export const GLOBAL_CAT1_FLAG = 'GLOBAL_CAT1_FLAG';
export const getNameCatActive = (data = {}) => //获取名称分类信息
    dispatch => {
        return dispatch({type: GET_NAME_CAT, nameCat: data});
    };
export const globalBreadCrumbActive = (data = []) => //获取名称分类信息
    dispatch => {
        return dispatch({type: GLOBAL_BREAD_CRUMB, globalBreadCrumb: data});
    };
export const searchTitleActive = (data = {}) =>
    dispatch => {
        return dispatch({type: SEARCH_TITLE, searchTitle: data});
    };
export const globalCat1FlagActive = (data=false) =>
    dispatch => {
        return dispatch({type: GLOBAL_CAT1_FLAG, globalCat1Flag: data});
    };