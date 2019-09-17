import React, {Component, Fragment} from 'react';
import {Spin} from 'antd';
import Head from "../../components/head";
import Header from "../../components/Header";
import ArticleNavCpn from "../../components/ArticleNavCpn";
import {axiosHttp} from "../../utils/ajax";
import Utils from "../../utils/utils";
import {connect} from 'react-redux'
import {
    getLastPublishArticleListActive,
    getArticleListPageLoadingActive,
    getArticleListSingleIdActive
} from "../../actions/articleAction";
import Link from "next/link";
import {withRouter} from "next/router";
import './index.less'

const POPULAR_TRENDS = '流行趋势';

class TrendTheme extends Component {
    state = {
        isRefresh: false
    };
    pageInfo = {
        "page": 1,
        "limit": 12,
        "category_id": '',
        "keyword": "",
        "plat": 2,
        "publish_pc": 1,
        "catId": ''
        // "last_edit_id": "string",
        // "fileId": "string",
        // "order": "string"
    };
    timer = null;
    isArticleLabel = false;
    isArticleLabelIndex = 0;

    componentDidMount() {
        const {query: {keyword = '', categoryId = ''}} = this.props.router;
        const {articleCategory} = this.props;
        if (articleCategory.length === 0) {
            this.getLastPublishArticleListHttp();
            this.getArticleListPageHttp();
        } else {
            if (keyword && !categoryId) { //文章标签
                this.pageInfo.keyword = decodeURIComponent({keyword: decodeURIComponent(keyword)});
                this.getLastPublishArticleListHttp();
                this.getArticleListPageHttp();
            } else if (!keyword && categoryId) { //文章类型
                const {articleCategory} = this.props;
                let articleName = '', id = decodeURIComponent(categoryId).split(',')[0];
                for (let i = 0; i < articleCategory.length; i++) {
                    if (articleCategory[i].category_id === +id) {
                        articleName = articleCategory[i].category_name;
                        break;
                    }
                }
                let param = {
                    category_id: '' + id,
                    name: articleName,
                    catId: decodeURIComponent(categoryId),
                    keyword: ''
                };
                this._handleArticleStartHttp(param);
            } else if (keyword && categoryId) { //有两个参数
                const {articleCategory} = this.props;
                let articleName = '', id = decodeURIComponent(categoryId).split(',')[0];
                for (let i = 0; i < articleCategory.length; i++) {
                    if (articleCategory[i].category_id === +id) {
                        articleName = articleCategory[i].category_name;
                        break;
                    }
                }
                let param = {
                    category_id: '' + id,
                    name: articleName,
                    catId: decodeURIComponent(categoryId),
                    keyword: decodeURIComponent(keyword)
                };
                this._handleArticleStartHttp(param);
            } else if (!keyword && !categoryId) { //没有参数,默认请求
                this.getLastPublishArticleListHttp();
                this.getArticleListPageHttp();
            }
        }
        window.scrollTo(0, 0);
        window.addEventListener('scroll', this.commonHeadScroll);
    }

    commonHeadScroll = () => {
        if (this.timer) {
            clearTimeout(this.timer);
        }
        this.timer = setTimeout(() => {
            const {sArticleCategory, isLoading} = this.props;
            if (!this.isArticleLabel || isLoading) {
                return
            }
            if (this.isArticleLabelIndex + 1 === sArticleCategory.length) {
                this.isArticleLabel = false;
            }
            if (sArticleCategory.length > 1 && (sArticleCategory.length >= this.isArticleLabelIndex + 1)) {
                this.pageInfo = {
                    ...this.pageInfo,
                    category_id: '' + sArticleCategory[this.isArticleLabelIndex],
                    page: 1
                };
                this.getArticleListPageAboutLabelHttp();
            }
            clearTimeout(this.timer)
        }, 100);
    };
    _handleMoreArticleList = (index) => {
        this.getArticleListPageSeeMoreHttp(index);
    };
    getArticleListPageSeeMoreHttp = (index) => { //点击查看更多的事件
        const {articleListAll} = this.props;
        this.pageInfo.page = Math.ceil(articleListAll[index].list.length / this.pageInfo.limit) + 1;
        this.pageInfo.category_id = articleListAll[index].id;
        this.props.dispatch(getArticleListPageLoadingActive());
        axiosHttp('api/WebSite/Article/GetArticleListPageForFront', this.pageInfo).then((res) => {
            if (res.code === 200) {
                const {list, totalCount, totalPages} = res.data;
                articleListAll[index].list = articleListAll[index].list.concat(list);
                articleListAll[index].totalCount = totalCount;
                articleListAll[index].totalPages = totalPages;
                this.props.dispatch(getArticleListSingleIdActive(articleListAll));
            }
        }).catch(e => {
            this.resetArticleListData();
        });
    };

    getArticleListPageAboutLabelHttp = () => { //点击文章标签的事件
        this.props.dispatch(getArticleListPageLoadingActive());
        const {articleCategory = []} = this.props;
        axiosHttp('api/WebSite/Article/GetArticleListPageForFront', this.pageInfo).then((res) => {
            if (res.code === 200) {
                const {list, totalCount, totalPages} = res.data;
                let catId = this.pageInfo.catId.split(',')[this.isArticleLabelIndex];
                let categoryName = POPULAR_TRENDS;
                for (let i = 0; i < articleCategory.length; i++) {
                    if (articleCategory[i].category_id === +catId) {
                        categoryName = articleCategory[i].category_name;
                        break;
                    }
                }
                if (this.isArticleLabelIndex === 0) {
                    let data = [{
                        list: list,
                        totalCount,
                        totalPages,
                        id: catId || '',
                        title: categoryName || ''
                    }];
                    this.props.dispatch(getArticleListSingleIdActive(data));
                } else {
                    const {articleListAll} = this.props;
                    articleListAll.push({
                        list: list,
                        totalCount,
                        totalPages,
                        id: catId || '',
                        title: categoryName || ''
                    });
                    this.props.dispatch(getArticleListSingleIdActive(articleListAll));
                }
            }
            this.isArticleLabelIndex++;
        }).catch((e) => {
            this.resetArticleListData();
        })
    };


    returnCategoryName = () => {
        const {articleCategory} = this.props;
        let categoryName = '';
        for (let i = 0; i < articleCategory.length; i++) {
            if (articleCategory[i].category_id === this.pageInfo.category_id) {
                categoryName = articleCategory[i].category_name;
                break;
            }
        }
        return categoryName;
    };
    // plat 1:pc 2:m 全平台传0或不传都行
    getLastPublishArticleListHttp = () => { //获取最近pc/m平台发布的n篇文章
        const {catId = '', keyword = ''} = this.pageInfo;
        axiosHttp(`api/WebSite/Article/GetLastPublishArticleList?n=5&plat=1&category_ids=${catId}&keywokd=${keyword}`, '', 'get').then((res) => {
            if (res.code === 200) {
                this.props.dispatch(getLastPublishArticleListActive(res.data));
            }
        }).catch((e) => {
            console.log(e);
        })
    };

    getArticleListPageHttp = () => { //根据条件获取文章列表分页数据
        this.props.dispatch(getArticleListPageLoadingActive());
        axiosHttp('api/WebSite/Article/GetArticleListPageForFront', this.pageInfo).then((res) => {
            if (res.code === 200) {
                let trendTheme = [];
                const {list, totalCount, totalPages} = res.data;
                const {articleListAll} = this.props;
                let articleList = JSON.parse(JSON.stringify(articleListAll));
                let categoryId = '' + this.pageInfo.category_id;
                if (articleList.length > 0) {
                    if (articleList.length === 1 && articleList[0].title === POPULAR_TRENDS) {
                        trendTheme.push({
                            list: list,
                            totalCount,
                            totalPages,
                            id: categoryId,
                            title: this.pageInfo.name || ''
                        });
                        this.props.dispatch(getArticleListSingleIdActive(trendTheme));
                    } else {
                        for (let i = 0; i < articleList.length; i++) {
                            if (articleList.length !== 1 && articleList[i].id === categoryId) { //删除
                                articleList.splice(i, 1);
                                this.props.dispatch(getArticleListSingleIdActive(articleList));
                                break;
                            } else if (articleList.length === 1 && !categoryId) { //取消选中最后一项
                                trendTheme.push({
                                    list: list,
                                    totalCount,
                                    totalPages,
                                    id: categoryId,
                                    title: POPULAR_TRENDS
                                });
                                this.props.dispatch(getArticleListSingleIdActive(trendTheme));
                                break;
                            } else if (!!categoryId && articleList.length > 0 && i === articleList.length - 1) { //新增
                                articleList.push({
                                    list: list,
                                    totalCount,
                                    totalPages,
                                    id: categoryId,
                                    title: this.pageInfo.name || ''
                                });
                                this.props.dispatch(getArticleListSingleIdActive(articleList));
                                break;
                            }
                        }
                    }
                } else {
                    trendTheme.push({
                        list: list,
                        totalCount,
                        totalPages,
                        id: '',
                        title: POPULAR_TRENDS
                    });
                    this.props.dispatch(getArticleListSingleIdActive(trendTheme));
                }
            }
        }).catch((e) => {
            this.resetArticleListData();
        })
    };
    _handleArticleNav = (param) => {
        this.isArticleLabelIndex = 0;
        this.pageInfo = {...this.pageInfo, ...param, page: 1};
        this.getArticleListPageHttp();
        this.getLastPublishArticleListHttp();
        window.scrollTo(0, 0);
    };
    _handleDeleteArticleType = (catId) => {
        this.pageInfo.catId = catId;
        this.pageInfo.category_id = catId;
        this.getLastPublishArticleListHttp();
    };
    _handleArticleNavLabel = (param) => {
        const {catId = ''} = param;
        this.pageInfo = {
            ...this.pageInfo, ...param,
            category_id: catId.split(',')[0],
            page: 1
        };
        this.getLastPublishArticleListHttp();
        this.getArticleListPageAboutLabelClick();
    };
    _handleArticleStartHttp = (param) => {
        this.pageInfo = {...this.pageInfo, ...param, page: 1};
        this.getLastPublishArticleListHttp();
        this.getArticleListPageAboutLabelClick();
    };
    getArticleListPageAboutLabelClick = () => {
        this.isArticleLabelIndex = 0;
        this.getArticleListPageAboutLabelHttp();
        this.isArticleLabel = true;
        window.scrollTo(0, 0);
    };
    resetArticleListData = () => { //重置文章列表的置
        this.isArticleLabel = true;
        this.isArticleLabelIndex = 0;
        this.props.dispatch(getArticleListSingleIdActive([]));
    };

    componentWillUnmount() {
        let session = window.sessionStorage;
        session.removeItem('sArtCategory');
        session.removeItem('sArtLabel');
        clearTimeout(this.timer);
        window.removeEventListener('scroll', this.commonHeadScroll);
        this.resetArticleListData();

    }

    render() {
        const {articleList = {}, publishArticle, isLoading, articleListAll} = this.props;
        const {list} = articleList;
        const {img_url = '', title = '', keyword = '', article_id = 0} = publishArticle[0] || {};
        const articleRight = publishArticle.filter((item, index) => index > 0);
        return (
            <Spin spinning={isLoading}>
                <div className="articleContent">
                    <Head title="火联-网罗全球优品-洞察产品趋势"/>
                    <Header/>
                    <div className="trendThemeWrap">
                        <div className="left">
                            <ArticleNavCpn deleteType={this._handleDeleteArticleType} sure={this._handleArticleNav}
                                           labelSure={this._handleArticleNavLabel}/>
                        </div>
                        <section className="right">
                            <div className="poster">
                                {/*style={{backgroundImage: `url('${img_url}')`}}*/}
                                <div className="left">
                                    <Link prefetch href={{
                                        pathname: '/articleContent',
                                        query: {id: article_id}
                                    }}>
                                        {/*className="posterImg"*/}
                                        <a target="_blank">
                                            <img className="posterImg" src={img_url} alt={title}/>
                                        </a>
                                    </Link>
                                    <div className="posterAbs bigPoster"
                                         style={{background: `url("../../static/articleBg.png") no-repeat center bottom`}}>
                                        <ul className="label">
                                            {
                                                keyword.split(',').map((item, index) => {
                                                    return (
                                                        <li key={index} className="labelLi">{item}</li>
                                                    )
                                                })
                                            }
                                        </ul>
                                        <h3 className="title">{title}</h3>
                                    </div>
                                </div>
                                <ul className="right">
                                    {
                                        articleRight.length > 0 && <li><h2 className="rightNews">NEWS</h2></li>
                                    }
                                    {
                                        articleRight.map((item, index) => {
                                            return (
                                                <li key={index}>
                                                    <Link prefetch href={{
                                                        pathname: '/articleContent',
                                                        query: {id: item.article_id}
                                                    }}>
                                                        <a target="_blank" className="rightLi">
                                                            <img className="smallPoster" src={item.img_url}
                                                                 alt={item.title}/>
                                                            <div>
                                                                <h4 className="posterDesc">{item.title}</h4>
                                                                <p className="posterTimer">{Utils.momentFormat(item.last_publish_time, 'YYYY-MM-DD')}</p>
                                                            </div>
                                                        </a>
                                                    </Link>
                                                </li>
                                            )
                                        })
                                    }
                                </ul>
                            </div>
                            {/*列表内容*/}
                            {
                                articleListAll.map((mainItem, index) => {
                                    return (
                                        <Fragment key={index}>
                                            {
                                                mainItem.list.length > 0 &&
                                                <h2 className="recommendTitle">{mainItem.title}</h2>
                                            }

                                            <ul className="recommendArticle">
                                                {
                                                    mainItem.list.map((item, index) => {
                                                        return (
                                                            <li key={item.article_id} className="articleLi">
                                                                <Link prefetch href={{
                                                                    pathname: '/articleContent',
                                                                    query: {id: item.article_id}
                                                                }}>
                                                                    <a target="_blank">
                                                                        <div className="articleDiv">
                                                                            <div className="pr">
                                                                                <img className="img" src={item.img_url}
                                                                                     alt={item.title}/>
                                                                                <div className="posterAbs smallPoster">
                                                                                    <ul className="label">
                                                                                        {
                                                                                            item.keyword.split(',').map((item, index) => {
                                                                                                return (
                                                                                                    <li key={index}
                                                                                                        className="labelLi">{item}</li>
                                                                                                )
                                                                                            })
                                                                                        }
                                                                                    </ul>
                                                                                </div>
                                                                            </div>
                                                                            <div className="articleText">
                                                                                <div className="textHeight">
                                                                                    <h4 className="titleH4">{item.title}</h4>
                                                                                    <p className="desc">{item.summary}</p>
                                                                                </div>
                                                                                <div className="info">
                                                                                    <span>{Utils.momentFormat(item.last_publish_time, 'YYYY-MM-DD')}</span>
                                                                                    <span><i
                                                                                        className="iconfont iconchayuerenshu readerIcon font_14"/>{item.page_view_num_h5 + item.page_view_num_pc}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </a>
                                                                </Link>
                                                            </li>
                                                        )
                                                    })
                                                }
                                            </ul>
                                            {
                                                mainItem.list.length < mainItem.totalCount ? (isLoading ?
                                                    <div className="spinLoading">
                                                        <Spin spinning={isLoading} tip="Loading..."/>
                                                    </div> :
                                                    <div className="seeMore active_fff"
                                                         onClick={this._handleMoreArticleList.bind(this, index)}>查看更多</div>) : null
                                            }
                                        </Fragment>
                                    )
                                })
                            }
                            {
                                articleListAll.map((item, index) => {
                                    return (item.list.length === 0 && <div key={index} className="recommendTitle"/>)
                                })
                            }
                        </section>
                    </div>
                </div>
            </Spin>
        );
    }
}

const getUserInfo = ({article}) => {
    return {
        articleList: article.articleList,
        publishArticle: article.publishArticle,
        sArticleCategory: article.sArticleCategory,
        sArticleLabel: article.sArticleLabel,
        articleCategory: article.articleCategory,
        articleListAll: article.articleListAll,
        isLoading: article.isLoading,
    }
};
export default connect(getUserInfo)(withRouter(TrendTheme));