import {
    GET_HOME_PAGE_DATA,
    GET_HOME_PAGE_SEARCH,
    GET_HOME_PAGE_SEARCH_LOADING,
    GET_USER_MARK_LABEL,
    GET_CLASSIFY_BANNER,
    SET_SELECTION_LABEL,
    SET_SELECT_DESIGNER_BY,
    SET_SELECT_DESIGNER,
    SET_SELECT_STYLE,
    SET_SELECT_COLOR,
    SET_SELECT_TEXTURE,
    GLOBAL_SEARCH,
    LIST_SORT_TYPE,
    OTHER_SCREENING,
    GET_HOME_PAGE_TYPE_CONFIG
} from '../actions/listPageAction'

const initialState = {
    cmi_cat: [],
    searchData: {
        data: [], count: 0, currentPage: 1
    },
    markLabel: [],
    isLoading: true,
    banner: [],
    selectLabel: [],
    selectDesignerBy: [],
    selectDesigner: [],
    selectStyle: [],
    selectColor: [],
    selectTexture: [],
    globalSearch: '',
    sortType: '',
    otherScreening: {
        selectStarNum: 0,
        selectTime: -1
    }, //其他筛选的条件
    homeList: []
};

export default (state = initialState, action = {}) => {
    const {type, ...payload} = action;
    // Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);
    switch (type) {
        case GET_HOME_PAGE_DATA:
            return Object.assign({...state}, payload);
        case GET_HOME_PAGE_SEARCH:
            return Object.assign({...state}, payload, {isLoading: false});
        case GET_HOME_PAGE_SEARCH_LOADING:
            return Object.assign({...state}, {isLoading: true});
        case GET_USER_MARK_LABEL:
            return Object.assign({...state}, payload);
        case GET_CLASSIFY_BANNER:
            return Object.assign({...state}, payload);
        case SET_SELECTION_LABEL:
            return Object.assign({...state}, payload);
        case SET_SELECT_DESIGNER_BY:
            return Object.assign({...state}, payload);
        case SET_SELECT_DESIGNER:
            return Object.assign({...state}, payload);
        case SET_SELECT_STYLE:
            return Object.assign({...state}, payload);
        case SET_SELECT_COLOR:
            return Object.assign({...state}, payload);
        case SET_SELECT_TEXTURE:
            return Object.assign({...state}, payload);
        case GLOBAL_SEARCH:
            return Object.assign({...state}, payload);
        case LIST_SORT_TYPE:
            return Object.assign({...state}, payload);
        case OTHER_SCREENING:
            return Object.assign({...state}, payload);
        case GET_HOME_PAGE_TYPE_CONFIG:
            return Object.assign({...state}, payload);
        default:
            return state
    }
}