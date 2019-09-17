import React, {Component, Fragment} from 'react';
import {withRouter} from "next/router";
import Head from "../../components/head";
import {axiosHttp} from "../../utils/ajax";
import Utils from "../../utils/utils";
import Header from "../../components/Header";
import {connect} from 'react-redux'
import {
    getSimilarArticleByIdActive,
    getArticleByIdActive,
    articleCategoryNavShowStateActive,
    articleLabelNavShowStateActive
} from "../../actions/articleAction";
import ArticleNavCpn from "../../components/ArticleNavCpn";
import commonFun from "../../utils/commonFun";
import './index.less'

class articleContent extends Component {
    static async getInitialProps({query, reduxStore}) {
        let articleDetail = {};
        try {
            const res = await axiosHttp(`api/WebSite/Article/GetArticleByIdForFront?article_id=${query.id}`, '', 'get');
            if (res.code === 200) {
                articleDetail = res.data;
            }
        } catch (e) {
            articleDetail = {}
        }
        await reduxStore.dispatch(getArticleByIdActive(articleDetail));
        return {articleDetail: articleDetail}
    }

    componentDidMount() {
        const {router: {query = {}}, articleDetail = {}, dispatch} = this.props;
        if (query.id) {
            let session = window.sessionStorage,
                sArtCategoryStr = session.getItem('sArtCategory'),
                sArtLabelStr = session.getItem('sArtLabel');
            if (sArtLabelStr) {
                dispatch(articleLabelNavShowStateActive(JSON.parse(sArtLabelStr)));
            }
            if (sArtCategoryStr) {
                dispatch(articleCategoryNavShowStateActive(JSON.parse(sArtCategoryStr)));
            }
            commonFun.setMetaAboutSeoFun(articleDetail);
            // this.getArticleByIdHttp(id);
            this.getSimilarActicleByIdHttp(query.id);
            this.saveVisitorViewInfoHttp(query.id);
        } else {
            this.props.router.push({pathname: '/'})
        }
    }

    reloadArticleContent = (id) => {
        this.getArticleByIdHttp(id);
        this.getSimilarActicleByIdHttp(id);
        window.scrollTo(0, 0);
    };

    getSimilarActicleByIdHttp = (categoryId = 0) => { //获取某篇文章相似的文章
        axiosHttp(`api/WebSite/Article/GetSimilarActicleById?n=6&article_id=${categoryId}`, '', 'get').then((res) => {
            if (res.code === 200) {
                this.props.dispatch(getSimilarArticleByIdActive(res.data ? res.data : []));
            } else {
                this.props.dispatch(getSimilarArticleByIdActive());
            }
        }).catch((e) => {
            console.log(e);
            this.props.dispatch(getSimilarArticleByIdActive());
        })
    };


    saveVisitorViewInfoHttp = (articleId = 0) => { //保存访客访问文章的浏览信息
        let param = {
            article_id: articleId,
            plat: 1,//平台 1:pc 2:m
            user_id: window.sessionStorage.getItem('userId') || '',
            visit_id: window.localStorage.getItem('visitId') || '',
        };
        axiosHttp('api/WebSite/Article/SaveVisitorViewInfo', Utils.obj2FormData(param)).then((res) => {
        }).catch((e) => {
            console.log(e);
        })
    };


    getArticleByIdHttp = (articleId = '') => { //通过id获取文章详细信息
        axiosHttp(`api/WebSite/Article/GetArticleByIdForFront?article_id=${articleId}`, '', 'get').then((res) => {
            if (res.code === 200) {
                this.props.dispatch(getArticleByIdActive(res.data));
            }
        }).catch((e) => {
            console.log(e);
        })
    };

    render() {
        const {articleDetail = {}, similarArticle = []} = this.props;
        const {img_url = '', title = '', keyword = ''} = articleDetail;
        return (
            <div className="articleContent">
                <Head title="火联-网罗全球优品-洞察产品趋势"/>
                <Header/>
                <div className="articleWrap">
                    <div className="left mr_30">
                        <ArticleNavCpn/>
                    </div>
                    <div className="content">
                        <div className="articleHead">
                            <h2 className="title">{title}</h2>
                            <p className="info"><span>{articleDetail.author}</span>{
                                articleDetail.author_translate &&
                                <Fragment>&nbsp;/&nbsp;<span> {articleDetail.author_translate}</span>&nbsp;译
                                </Fragment>
                            }
                                <span
                                    className="timer">{Utils.momentFormat(articleDetail.last_publish_time, 'YYYY-MM-DD')}</span>
                                <span className="comment"><i
                                    className="iconfont iconchayuerenshu eyeIcon"/>&nbsp;{articleDetail.page_view_num_h5 + articleDetail.page_view_num_pc}</span>
                            </p>
                            <p className="label"><span>标签：</span>
                                {
                                    keyword.split(',').map((item, index) => {
                                        return (
                                            <span key={index}>{index > 0 ? ' / ' : ''}{item}</span>
                                        )
                                    })
                                }
                            </p>
                            <p className="abstract">{articleDetail.summary}</p>
                        </div>
                        <div className="articleDetail"
                             dangerouslySetInnerHTML={{__html: articleDetail.content_hrml_pc}}/>
                        {
                            similarArticle && similarArticle.length > 0 ? <Fragment>
                                <h2 className="catTitleH2">更多相关文章</h2>
                                <ul className="recommendArticle active">
                                    {
                                        similarArticle.map((item) => {
                                            return (
                                                <li key={item.img_url} className="articleLi">
                                                    <div className="articleDiv"
                                                         onClick={this.reloadArticleContent.bind(this, item.article_id)}>
                                                        <img className="img" src={item.img_url} alt={item.title}/>
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
                                                </li>
                                            )
                                        })
                                    }
                                </ul>
                            </Fragment> : null
                        }
                    </div>
                    <div className="left ml_30"/>
                </div>
            </div>
        );
    }
}

const getUserInfo = ({article}) => {
    return {
        articleDetail: article.articleDetail,
        similarArticle: article.similarArticle,
    }
};

export default connect(getUserInfo)(withRouter(articleContent));