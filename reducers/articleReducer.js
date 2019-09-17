import {
    GET_LAST_PUBLISH_ARTICLE_LIST,
    GET_ARTICLE_LIST_PAGE,
    GET_ARTICLE_LIST_PAGE_LOADING,
    GET_SIMILAR_ARTICLE_BY_ID,
    GET_ARTICLE_BY_ID,
    ARTICLE_CATEGORY_NAV_SHOW_STATE,
    ARTICLE_LABEL_NAV_SHOW_STATE,
    GET_ARTICLE_CATEGORY_LIST,
    GET_HOT_LABEL,
    GET_ARTICLE_LIST_SINGLE_ID
} from '../actions/articleAction'

const initialState = {
    publishArticle: [],
    articleList: {
        list: [], totalCount: 0, totalPages: 1
    },
    isLoading: true,
    similarArticle: [],
    articleDetail: {},
    sArticleCategory: [],
    sArticleLabel: [],
    articleCategory: [],
    articleLabel: [],
    articleListAll: []
};
export default (state = initialState, action = {}) => {
    const {type, ...payload} = action;
    // Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);
    switch (type) {
        case GET_LAST_PUBLISH_ARTICLE_LIST:
            return Object.assign({...state}, payload);
        case GET_ARTICLE_LIST_PAGE_LOADING:
            return Object.assign({...state}, payload, {isLoading: true});
        case GET_ARTICLE_LIST_PAGE:
            return Object.assign({...state}, payload, {isLoading: false});
        case GET_SIMILAR_ARTICLE_BY_ID:
            return Object.assign({...state}, payload);
        case GET_ARTICLE_BY_ID:
            return Object.assign({...state}, payload);
        case ARTICLE_CATEGORY_NAV_SHOW_STATE:
            return Object.assign({...state}, payload);
        case ARTICLE_LABEL_NAV_SHOW_STATE:
            return Object.assign({...state}, payload);
        case GET_ARTICLE_CATEGORY_LIST:
            return Object.assign({...state}, payload);
        case GET_HOT_LABEL:
            return Object.assign({...state}, payload);
        case GET_ARTICLE_LIST_SINGLE_ID:
            return Object.assign({...state}, payload, {isLoading: false});
        default:
            return state
    }
}