import {axiosCookieHttp} from "../utils/ajax";

export const GET_EXCHANGE_RATE = 'GET_EXCHANGE_RATE';
export const GET_USER_COLLECT_COUNT = 'GET_USER_COLLECT_COUNT';
export const BREAD_CRUMB = 'BREAD_CRUMB';
export const GET_CAT_RELATION = 'GET_CAT_RELATION';
export const IS_LOGIN_FLAG = 'IS_LOGIN_FLAG';
export const IS_REGISTER_FLAG = 'IS_REGISTER_FLAG';


export const getUserCollectCount = (data) => {
    return {
        type: GET_USER_COLLECT_COUNT,
        collectCount: data,
    }
};
//获取用户收藏已收藏数量
export const getUserCollectCountAction = () =>
    dispatch => {
        return axiosCookieHttp('api/WebSite/HomePage/GetUserCollectCount', '', 'GET')
            .then(async resp => {
                await dispatch({
                    type: GET_USER_COLLECT_COUNT,
                    collectCount: (resp.data && resp.data.count) || 0
                });
                return resp
            })
    };
export const getExchangeRateAction = (params) =>
    dispatch => {
        return dispatch({type: GET_EXCHANGE_RATE, rate: params})
    };
export const breadCrumbActive = (param) => dispatch => {
    window.sessionStorage.setItem('breadCrumbs', JSON.stringify(param));
    return dispatch({type: BREAD_CRUMB, breadCrumb: param})
};
export const getCatRelationActive = (param = {}) => dispatch => {
    return dispatch({type: GET_CAT_RELATION, catRelation: param})
};
export const isLoginFlagActive = (param) => dispatch => { //弹出登录弹框
    return dispatch({type: IS_LOGIN_FLAG, isLoginFlag: param})
};
export const isRegisterFlagActive = (param) => dispatch => { //弹出注册弹框
    return dispatch({type: IS_REGISTER_FLAG, isRegisterFlag: param})
};

