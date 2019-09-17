import React, {Component} from 'react';
import {Collapse, Checkbox} from "antd";
import {
    articleCategoryNavShowStateActive,
    articleLabelNavShowStateActive,
    getArticleCategoryActive, getArticleListSingleIdActive,
    getHotLabelActive
} from "../../actions/articleAction";
import {connect} from "react-redux";
import {axiosHttp} from "../../utils/ajax";
import {withRouter} from "next/router";
import './index.less'

const {Panel} = Collapse;
const REQUEST_NUMBER_10 = 10;

class ArticleNavCpn extends Component {
    pathname = '';

    componentDidMount() {
        this.pathname = this.props.router.pathname;
        this.getArticleCategoryListHttp();
        this.getHotLabelHttp();
    }

    articleCategoryChange = (checkedValues) => {
        const {sArticleCategory, sArticleLabel, articleCategory, articleListAll, dispatch} = this.props;
        let categoryId = checkedValues.toString();
        if (this.pathname === '/articleContent') {
            this.props.router.push({
                pathname: '/trendTheme',
                query: {categoryId: encodeURIComponent(categoryId)}
            })
        } else {
            let {category_id = '', delId = ''} = this.returnArticleChangeId(sArticleCategory, checkedValues);
            if (checkedValues.length === 0) { //取消选择最后一个文章类型
                this.props.sure({
                    category_id: '',
                    catId: '',
                    keyword: ''
                });
            } else if (delId) { //删除
                if (sArticleLabel.length > 0) { //之前选择了文章标签
                    this.props.labelSure({keyword: '', catId: categoryId});
                } else { //之前没有选择了文章标签
                    for (let i = 0; i < articleListAll.length; i++) {
                        if (+articleListAll[i].id === delId) {
                            articleListAll.splice(i, 1);
                            this.props.dispatch(getArticleListSingleIdActive(articleListAll));
                            this.props.deleteType(categoryId);
                            break;
                        }
                    }
                }
            } else if (category_id) { //新增
                if (sArticleLabel.length > 0) { //之前选择了文章标签
                    this.props.labelSure({keyword: '', catId: categoryId});
                } else {
                    let articleName = '';
                    this.getHotLabelHttp(categoryId);
                    for (let i = 0; i < articleCategory.length; i++) {
                        if (articleCategory[i].category_id === category_id) {
                            articleName = articleCategory[i].category_name;
                            break;
                        }
                    }
                    this.props.sure({
                        category_id: '' + category_id,
                        name: articleName,
                        catId: checkedValues.toString(),
                        keyword: ''
                    });
                }

            }
        }
        dispatch(articleCategoryNavShowStateActive(checkedValues));
        dispatch(articleLabelNavShowStateActive([]));
    };
    returnArticleChangeId = (data, checkedValues) => {
        let returnId = {category_id: '', delId: ''};
        if (data.length === 0) { //第一次新增
            returnId.category_id = checkedValues[0];
        } else if (checkedValues.length === 0) {
            returnId.delId = checkedValues[0];
        } else if (data.length > checkedValues.length) { //取消
            for (let i = 0; i < data.length; i++) {
                for (let j = 0; j < checkedValues.length; j++) {
                    if (data[i] === checkedValues[j]) {
                        break;
                    } else if (j === checkedValues.length - 1 && data[i] !== checkedValues[j]) {
                        returnId.delId = data[i];
                        break;
                    }
                }
            }
        } else {//增加
            for (let i = 0; i < checkedValues.length; i++) {
                for (let j = 0; j < data.length; j++) {
                    if (checkedValues[i] === data[j]) {
                        break;
                    } else if (j === data.length - 1 && checkedValues[i] !== data[j]) {
                        returnId.category_id = checkedValues[i];
                        break;
                    }
                }
            }
            // returnId.category_id = checkedValues[checkedValues.length - 1];
        }
        return returnId || {};
    };
    articleLabelChange = (checkedValues) => {
        const {sArticleCategory} = this.props;
        this.props.dispatch(articleLabelNavShowStateActive(checkedValues));
        let keywordStr = checkedValues.toString();
        if (this.pathname === '/articleContent') {
            this.props.router.push({
                pathname: '/trendTheme',
                query: {categoryId: this.props.sArticleCategory.toString(), keyword: encodeURIComponent(keywordStr)}
            })
        } else {
            this.props.labelSure({keyword: checkedValues.toString(), catId: sArticleCategory.toString()});
        }
    };
    clearAllCondition = () => {
        const {dispatch, sure} = this.props;
        dispatch(articleCategoryNavShowStateActive([]));
        dispatch(articleLabelNavShowStateActive([]));
        dispatch(getArticleListSingleIdActive([]));
        sure({"category_id": '', "keyword": "", "catId": ''})
    };
    getArticleCategoryListHttp = () => { //获取文章分类列表
        axiosHttp('api/WebSite/Article/GetArticleCategoryListForFront', {n: REQUEST_NUMBER_10}).then((res) => {
            if (res.code === 200) {
                let item = res.data;
                for (let i = 0; i < item.length; i++) {
                    item[i].label = item[i].category_name;
                    item[i].value = item[i].category_id;
                }
                this.props.dispatch(getArticleCategoryActive(item));
            }
        }).catch((e) => {
            console.log(e);
        })
    };


    getHotLabelHttp = (categoryId = '') => { //获取热门标签
        axiosHttp(`api/WebSite/Article/GetHotLabel?n=${REQUEST_NUMBER_10}&category_ids=${categoryId}`, '', 'get').then((res) => {
            if (res.code === 200) {
                this.props.dispatch(getHotLabelActive(res.data));
            }
        }).catch((e) => {
            console.log(e);
        })
    };

    render() {
        const {articleCategory, sArticleCategory, articleLabel, sArticleLabel} = this.props;
        return (
            <div id="articleNavId" className="collapseArticle active">
                {
                    sArticleCategory.length > 0 || sArticleLabel.length > 0 ?
                        <div className="clearAll" onClick={this.clearAllCondition}><span>清除全部</span><i
                            className="iconfont iconlb-cle clearIcon"/></div> : null
                }
                <Collapse accordion bordered={false} defaultActiveKey={['1']}>
                    <Panel header="文章类型" key="1">
                        <div className="checkboxArticle">
                            <Checkbox.Group options={articleCategory} value={sArticleCategory}
                                            onChange={this.articleCategoryChange}/>
                        </div>
                    </Panel>
                    <Panel header="文章标签" key="2">
                        <div className="checkboxArticle">

                            <Checkbox.Group options={articleLabel} value={sArticleLabel}
                                            onChange={this.articleLabelChange}/>
                        </div>
                    </Panel>
                </Collapse>
            </div>
        );
    }
}

const getUserInfo = ({article}) => {
    return {
        sArticleCategory: article.sArticleCategory,
        sArticleLabel: article.sArticleLabel,
        articleCategory: article.articleCategory,
        articleLabel: article.articleLabel,
        articleListAll: article.articleListAll,
    }
};
export default connect(getUserInfo)(withRouter(ArticleNavCpn));