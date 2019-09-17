import {
    GET_NAME_CAT,
    GLOBAL_BREAD_CRUMB,
    SEARCH_TITLE,
    GLOBAL_CAT1_FLAG
} from '../actions/searchPageAction'

const item = {id: '', name: '', index: 0};

const initialState = {
    nameCat: {},
    globalBreadCrumb: [item, item, item], //面包屑
    searchTitle: '',//搜索标题
    globalCat1Flag: true,//全局搜索 true 显示一级类名  false 显示二级类名
};

export default (state = initialState, action = {}) => {
    const {type, ...payload} = action;
    switch (type) {
        case GET_NAME_CAT:
            return Object.assign({...state}, payload); //坐标产品分类
        case GLOBAL_BREAD_CRUMB:
            return Object.assign({...state}, payload);  //searchPage 面包屑
        case SEARCH_TITLE:
            return Object.assign({...state}, payload);//搜索标题
        case GLOBAL_CAT1_FLAG:
            return Object.assign({...state}, payload);//是否展示一级类名
        default:
            return state
    }
}