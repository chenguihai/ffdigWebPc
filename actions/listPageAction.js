export const GET_HOME_PAGE_DATA = 'GET_HOME_PAGE_DATA';
export const GET_HOME_PAGE_SEARCH_LOADING = 'GET_HOME_PAGE_SEARCH_LOADING';
export const GET_HOME_PAGE_SEARCH = 'GET_HOME_PAGE_SEARCH';
export const GET_USER_MARK_LABEL = 'GET_USER_MARK_LABEL';
export const GET_CLASSIFY_BANNER = 'GET_CLASSIFY_BANNER';
export const SET_SELECTION_LABEL = 'SET_SELECTION_LABEL';
export const SET_SELECT_DESIGNER_BY = 'SET_SELECT_DESIGNER_BY';
export const SET_SELECT_DESIGNER = 'SET_SELECT_DESIGNER';
export const SET_SELECT_STYLE = 'SET_SELECT_STYLE';
export const SET_SELECT_COLOR = 'SET_SELECT_COLOR';
export const SET_SELECT_TEXTURE = 'SET_SELECT_TEXTURE';
export const GLOBAL_SEARCH = 'GLOBAL_SEARCH';
export const LIST_SORT_TYPE = 'LIST_SORT_TYPE';
export const OTHER_SCREENING = 'OTHER_SCREENING';
export const GET_HOME_PAGE_TYPE_CONFIG = 'GET_HOME_PAGE_TYPE_CONFIG';


export const getHomePageData = (data = {}) =>
    dispatch => {
        return dispatch({type: GET_HOME_PAGE_DATA, cmi_cat: data,});
    };

export const getHomePageSearchLoading = () =>
    dispatch => {
        return dispatch({type: GET_HOME_PAGE_SEARCH_LOADING});
    };
export const getHomePageSearch = (data = {}) =>
    dispatch => {
        return dispatch({type: GET_HOME_PAGE_SEARCH, searchData: data,});
    };
export const getUserMarkLabel = (data = {}) =>
    dispatch => {
        return dispatch({type: GET_USER_MARK_LABEL, markLabel: data});
    };
export const getClassifyBanner = (data = []) =>
    dispatch => {
        return dispatch({type: GET_CLASSIFY_BANNER, banner: data});
    };
export const setSelectionLabelActive = (data = {}) =>
    dispatch => {
        return dispatch({type: SET_SELECTION_LABEL, selectLabel: data});
    };
export const setSelectDesignerByActive = (data = {}) => //设计师
    dispatch => {
        return dispatch({type: SET_SELECT_DESIGNER_BY, selectDesignerBy: data});
    };
export const setSelectDesignerActive = (data = {}) => //品牌
    dispatch => {
        return dispatch({type: SET_SELECT_DESIGNER, selectDesigner: data});
    };
export const setSelectStyleActive = (data = {}) => //款式
    dispatch => {
        return dispatch({type: SET_SELECT_STYLE, selectStyle: data});
    };
export const setSelectColorActive = (data = {}) => //颜色
    dispatch => {
        return dispatch({type: SET_SELECT_COLOR, selectColor: data});
    };
export const setSelectTextureActive = (data = {}) => //材质
    dispatch => {
        return dispatch({type: SET_SELECT_TEXTURE, selectTexture: data});
    };
export const globalSearchActive = (data = {}) => //全局搜索
    dispatch => {
        return dispatch({type: GLOBAL_SEARCH, globalSearch: data});
    };
export const listSortTypeActive = (data = '') => //列表排序的方式
    dispatch => {
        return dispatch({type: LIST_SORT_TYPE, sortType: data});
    };
export const otherScreeningActive = (data = {}) => //其他筛选
    dispatch => {
        return dispatch({type: OTHER_SCREENING, otherScreening: data});
    };
export const getHomePageTypeConfigActive = (data = {}) => //获取首页列表的配置
    dispatch => {
        return dispatch({type: GET_HOME_PAGE_TYPE_CONFIG, homeList: data});
    };
