export const GET_LAST_PUBLISH_ARTICLE_LIST = 'GET_LAST_PUBLISH_ARTICLE_LIST';
export const GET_ARTICLE_LIST_PAGE = 'GET_ARTICLE_LIST_PAGE';
export const GET_ARTICLE_LIST_PAGE_LOADING = 'GET_ARTICLE_LIST_PAGE_LOADING';
export const GET_SIMILAR_ARTICLE_BY_ID = 'GET_SIMILAR_ARTICLE_BY_ID';
export const GET_ARTICLE_BY_ID = 'GET_ARTICLE_BY_ID';
export const ARTICLE_CATEGORY_NAV_SHOW_STATE = 'ARTICLE_CATEGORY_NAV_SHOW_STATE';
export const ARTICLE_LABEL_NAV_SHOW_STATE = 'ARTICLE_LABEL_NAV_SHOW_STATE';
export const GET_ARTICLE_CATEGORY_LIST = 'GET_ARTICLE_CATEGORY_LIST';
export const GET_HOT_LABEL = 'GET_HOT_LABEL';
export const GET_ARTICLE_LIST_SINGLE_ID = 'GET_ARTICLE_LIST_SINGLE_ID';

export const getLastPublishArticleListActive = (param) => dispatch => {
    return dispatch({type: GET_LAST_PUBLISH_ARTICLE_LIST, publishArticle: param})
};
export const getArticleListPageLoadingActive = (param) => dispatch => {
    return dispatch({type: GET_ARTICLE_LIST_PAGE_LOADING})
};
export const getArticleListPageActive = (param) => dispatch => {
    return dispatch({type: GET_ARTICLE_LIST_PAGE, articleList: param})
};
export const getSimilarArticleByIdActive = (param=[]) => dispatch => {
    return dispatch({type: GET_SIMILAR_ARTICLE_BY_ID, similarArticle: param})
};
export const getArticleByIdActive = (param) => dispatch => {
    return dispatch({type: GET_ARTICLE_BY_ID, articleDetail: param})
};
export const articleCategoryNavShowStateActive = (param=[]) => dispatch => { //保存文章导航栏 文章类型 的数组
    window.sessionStorage.setItem('sArtCategory', JSON.stringify(param));
    return dispatch({type: ARTICLE_CATEGORY_NAV_SHOW_STATE, sArticleCategory: param})
};
export const articleLabelNavShowStateActive = (param=[]) => dispatch => { //保存文章导航栏 文章标签 的数组
    window.sessionStorage.setItem('sArtLabel', JSON.stringify(param));
    return dispatch({type: ARTICLE_LABEL_NAV_SHOW_STATE, sArticleLabel: param})
};
export const getArticleCategoryActive = (param) => dispatch => { //获取文章分类列表
    return dispatch({type: GET_ARTICLE_CATEGORY_LIST, articleCategory: param})
};
export const getHotLabelActive = (param) => dispatch => { //获取文章热门标签
    return dispatch({type: GET_HOT_LABEL, articleLabel: param})
};
export const getArticleListSingleIdActive = (param) => dispatch => { //获取文章热门标签
    return dispatch({type: GET_ARTICLE_LIST_SINGLE_ID, articleListAll: param})
};