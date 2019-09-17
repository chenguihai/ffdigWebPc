import React, {Component, Fragment} from 'react';
import ProductClassItem from './ProductClassItem'
import ScreenListCpn from "../../components/ScreenListCpn";
import ProductClassList from './ProductClassList'
import {axiosCookieHttp, axiosHttp} from "../../utils/ajax";
import {connect} from "react-redux";
import {
    getHomePageData,
    otherScreeningActive,
    getHomePageSearch,
    getHomePageSearchLoading,
    listSortTypeActive
} from "../../actions/listPageAction";
import {
    getNameCatActive, globalBreadCrumbActive, globalCat1FlagActive, searchTitleActive
} from "../../actions/searchPageAction";
import Header from "../../components/Header";
import Head from "../../components/head";
import {withRouter} from "next/router";
import '../dig-products/index.less'
import {getClassifyMsgHttp} from "../../utils/exportFun";
import {Button, Select} from "antd";
import {sortConst} from "../../config/labelData";
import './index.less'

const Option = Select.Option;
const CONTAINER_WIDTH = 1670, CONTAINER_ITEM_WIDTH = 280;

class SearchPage extends Component {
    static async getInitialProps({query, reduxStore}) {
        let cmi_cat = [];
        try {
            const resp = await axiosHttp("api/WebSite/Classify/GetClassifyMsg", '', "GET");
            cmi_cat = resp.data
        } catch (e) {
            console.error(e)
        }
        let cmi_catData = getClassifyMsgHttp(cmi_cat);
        await reduxStore.dispatch(getHomePageData(cmi_catData));
        return {cmi_cat: cmi_catData}
    }

    state = {
        drawerFlag: false,
        newFlag: false,
        labelFlag: false,
        isScreenFlag: false,
        isProductClass: false,
        containerWidth: CONTAINER_WIDTH,
        fixedLeft: 0
    };
    pageInfo = {
        "page": 1,
        "limit": 10,
        "keyword": "",
        "site": "",
        "price_max": 0,
        "sort": "", //默认按照美金:list_price_usd(价格),ondateOnline(上架时间),cmtStar(评论星级),cmtCount(评论数)
        "sort_type": "",  //升序:asc 倒序:desc
        "source_brand": "",//	string 品牌(需支持多个)
        "designer": "",//设计师(需支持多个)
        "cat_id": '0',
        "price_min": 0,
        "cmtStar": 0,//评论星级
        "start_time": 0,//上架时间开始时间(传时间戳)
        "end_time": 0,//上架时间结束时间(传时间戳)
        "currency": (this.props.currencyType && this.props.currencyType.toLowerCase()) || 'cny',//币种(默认人民币:cny,美元传:usd)
    };
    timer = null;
    isSendFlag = false;
    count = 0;

    componentDidMount() {
        let clientWidth = (document.body.clientWidth || document.documentElement.clientWidth),
            fixedLeft = clientWidth > CONTAINER_WIDTH ? CONTAINER_WIDTH : (Math.floor(clientWidth / CONTAINER_ITEM_WIDTH) * CONTAINER_ITEM_WIDTH) - 10;
        this.setState({
            containerWidth: fixedLeft,
            fixedLeft: (clientWidth - fixedLeft) / 2
        });
        this.initCommonFun();
        window.addEventListener('scroll', this.scrollEvent);
    }

    initCommonFun = () => {
        this.clearListDataCommon();
        let nickName = window.sessionStorage.getItem('nickName');
        if (nickName) {
            this.checkIsCollectHttp();
        }
        this.setSearchTitle();
        this.pageInfo = {...this.pageInfo, ...this.props.router.query};
        this.homePageSearchHttp();
    };
    setSearchTitle = () => {
        let {cat_id = "0", keyword = '', site = '', name = '', source_brand = '', designer = ''} = this.props.router.query,
            searchTitle = '';
        // 点击首页站点执行
        // 品牌:1,设计师:2,站点:3
        if (site) {
            searchTitle = site.toUpperCase();
            this.getNameCatHttp(site, 3);
        } else if (source_brand) {
            searchTitle = source_brand.toUpperCase();
            this.getNameCatHttp(source_brand, 1);
        } else if (designer) {
            searchTitle = designer.toUpperCase();
            this.getNameCatHttp(designer, 2);
        } else if (cat_id !== '0') {
            searchTitle = name;
        } else if (keyword) {
            searchTitle = keyword;
        }
        if (!searchTitle) {
            this.props.router.push({pathname: '/'});
            return;
        }
        this.props.dispatch(searchTitleActive(searchTitle));
    };
    scrollEvent = (evt) => {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            let scrollTop = document.body.scrollTop || document.documentElement.scrollTop,
                clientHeight = document.body.clientHeight || document.documentElement.clientHeight,
                scrollHeight = document.body.scrollHeight || document.documentElement.scrollHeight;
            if (scrollTop + clientHeight + 200 >= scrollHeight) {
                if (this.pageInfo.page % 10 === 0 || this.isSendFlag === true || this.count === 1) {
                    return
                }
                const {searchData, userInfo} = this.props;
                if (searchData.count <= this.pageInfo.page * 10) {
                    return
                }
                ++this.pageInfo.page;
                if (userInfo.nickName === '' && this.pageInfo.page > 10) {
                    this.pageInfo.page = 1;
                    this.homePageSearchHttpStart();
                } else {
                    this.homePageSearchHttp();
                }
            }
            clearTimeout(this.timer)
        }, 100)
    };

    checkIsCollectHttp = () => { //检查商品是否已收藏
        let nickName = window.sessionStorage.getItem('nickName');
        if (nickName) {
            const {data, count, currentPage} = this.props.searchData;
            if (!data) { //data 为null 返回
                return
            }
            let productIdArr = [];
            let isLoginFlag = data.some((item) => item.isCollect === true);
            for (let i = 0; i < data.length; i++) {
                if (isLoginFlag) {
                    // 第一次以后的收藏
                    if (data[i].isCollect === undefined) {
                        productIdArr.push(data[i].object_id);
                    }
                } else {
                    // if (!data[i].isCollect) {
                    // 第一次收藏
                    productIdArr.push(data[i].object_id);
                    // }
                }
            }
            if (productIdArr.length === 0) {
                return
            }
            axiosCookieHttp('api/WebSite/HomePage/CheckIsCollect', {products: productIdArr.toString()}).then((res) => {
                if (res.code === 200) {
                    let collectData = res.data;
                    for (let i = 0; i < data.length; i++) {
                        for (let j = 0; j < collectData.length; j++) {
                            if (data[i].object_id === collectData[j].id) {
                                data[i].isCollect = collectData[j].isCollect;
                                data[i].lable = collectData[j].lable;
                            }
                        }
                    }
                    this.props.dispatch(getHomePageSearch({
                        data: data,
                        count: count,
                        currentPage: currentPage
                    }));
                }
            }).catch((e) => {
                console.log(e);
            })
        }
    };

    getNameCatHttp = (name = "", type) => { //获取名称分类信息  品牌:1,设计师:2,站点:3
        axiosCookieHttp(`api/WebSite/Classify/GetNameCat?name=${name}&type=${type}`, '', "GET").then((res) => {
            if (res.code === 200) {
                const {id, name, type, value} = res.data;
                let parse = [];
                try {
                    parse = JSON.parse(value);
                } catch (e) {

                }
                this.props.dispatch(getNameCatActive({id, name, type, value: parse} || {}));
            }
        }).catch((e) => {
            console.log(e);
        })
    };
    homePageSearchHttp = () => { //首页搜索--已登录
        this.count = 1;
        this.props.dispatch(getHomePageSearchLoading());
        axiosCookieHttp("api/WebServices/Search/HomePageSearch", this.pageInfo).then(res => {
            if (res.code === 0) {
                const {data, count, currentPage} = this.props.searchData;
                if (res.data) {
                    this.props.dispatch(getHomePageSearch({
                        data: data.concat(res.data),
                        count: res.count,
                        currentPage: currentPage
                    }));
                    this.checkIsCollectHttp();
                } else {
                    if (this.pageInfo.page === 1) {
                        this.clearListDataCommon();
                    }
                }
            } else {
                this.clearListDataCommon();
            }
            this.count = 0;
            this.isSendFlag = false;
        }).catch(res => {
            this.count = 0;
            this.clearListDataCommon();
        });
    };
    homePageSearchHttpStart = (page = 1) => { //首页搜索--已登录
        this.clearListDataCommon();
        this.cancelPopup();
        this.props.dispatch(getHomePageSearchLoading());
        axiosCookieHttp("api/WebServices/Search/HomePageSearch", this.pageInfo).then(res => {
                if (res.code === 0) {
                    if (res.data) {
                        this.props.dispatch(getHomePageSearch({
                            data: res.data,
                            count: res.count,
                            currentPage: page
                        }));
                        window.scroll(0, 0);
                        this.checkIsCollectHttp();
                    } else {
                        this.clearListDataCommon();
                    }
                    this.isSendFlag = false;
                }
            }
        ).catch(res => {
            this.clearListDataCommon();
        });
    };
    clearListDataCommon = () => { //清除列表页面的公共函数
        this.props.dispatch(getHomePageSearch({
            data: [],
            count: 0,
            currentPage: 1
        }));
    };
    _handleHeadSearch = (params) => {
        const {currencyType} = this.props;
        this.isSendFlag = true;
        this.pageInfo = {...this.pageInfo, ...params, currency: currencyType.toLowerCase(), page: 1};
        // this.cancelPopup();
        this.homePageSearchHttpStart();
    };
    // handleGoBack = () => {
    //     window.history.back();
    // };
    _handleClearSearchValueLeft = () => { //清除搜索的值  搜索页面
        let {cat_id = "0", keyword = '', site = '', name = '', source_brand = '', designer = ''} = this.props.router.query;
        this.pageInfo = {
            cat_id: cat_id,
            keyword: keyword,
            site: site,
            source_brand: source_brand,
            designer: designer,
            page: 1,
            "limit": 10,
            "price_max": 0,
            "sort": '', //默认按照美金:list_price_usd(价格),ondateOnline(上架时间),cmtStar(评论星级),cmtCount(评论数)
            "sort_type": '',  //升序:asc 倒序:desc
            "price_min": 0,
            "cmtStar": 0,//评论星级
            "start_time": 0,//上架时间开始时间(传时间戳)
            "end_time": 0,//上架时间结束时间(传时间戳)
            "currency": (this.props.currencyType && this.props.currencyType.toLowerCase()) || 'cny',//币种(默认人民币:cny,美元传:usd)
        };
        this.homePageSearchHttpStart();
    };
    _handleClearPriceSearch = () => { //清理价格
        this.pageInfo = {...this.pageInfo, price_min: 0, price_max: 0, page: 1};
        this.homePageSearchHttpStart();
    };
    _handleClearSearchValue = () => { //清除搜索的值
        this.pageInfo = {...this.pageInfo, keyword: '', site: '', source_brand: '', designer: '', page: 1};
        this.homePageSearchHttpStart();
    };
    onChangePagination = (page) => {
        this.pageInfo.page = (page - 1) * 10 + 1;
        this.homePageSearchHttpStart(page);
    };
    _handleShowProductClass = () => {
        this.setState({
            isProductClass: !this.state.isProductClass,
            isScreenFlag: false
        })
    };
    _handleShowSearch = () => {
        this.setState({
            isScreenFlag: !this.state.isScreenFlag,
            isProductClass: false
        })
    };
    _handleBreadcrumb = (item, index, breadNum) => { //点击面包屑
        const {globalBreadCrumb} = this.props, obj = {id: '', name: '', index: 0};
        if (index < breadNum - 1) {
            if (index === 0) {
                this.props.dispatch(globalCat1FlagActive(true));
                globalBreadCrumb[1] = obj;
                globalBreadCrumb[2] = obj;
            } else if (index === 1) {
                globalBreadCrumb[2] = obj;
            }
            // this.props.onHeadSearch({cat_id: item.id});
            // this.pageInfo = {...this.pageInfo, cat_id: item.id, page: 1};
            // this.homePageSearchHttpStart();
            this._handleHeadSearch({cat_id: item.id});
            this.props.dispatch(globalBreadCrumbActive(globalBreadCrumb));
        }
    };
    _handleAllBreadcrumb = () => {
        const {dispatch} = this.props;
        let obj = {id: '', name: '', index: 0};
        // this.props.onHeadSearch();
        let param = {
            "cat_id": '0',
            "price_max": 0,
            "sort": '',
            "sort_type": '',
            "price_min": 0,
            "cmtStar": 0,
            "start_time": 0,
            "end_time": 0
        };
        // this.pageInfo = {...this.pageInfo, ...param, page: 1};
        // this.homePageSearchHttpStart();
        this._handleHeadSearch(param);
        dispatch(globalBreadCrumbActive([obj, obj, obj]));
        dispatch(otherScreeningActive({selectStarNum: 0, selectTime: -1}));
        dispatch(globalCat1FlagActive(true));
    };
    _handleCloseLabel = () => { //清空label标签
        const {dispatch} = this.props, obj = {id: '', name: '', index: 0};
        dispatch(globalBreadCrumbActive([obj, obj, obj]));
        dispatch(otherScreeningActive({selectStarNum: 0, selectTime: -1}));
        dispatch(globalCat1FlagActive(true));
        dispatch(listSortTypeActive('')); //清除排序
        // this.props.form.setFieldsValue({
        //     price_min: '',
        //     price_max: '',
        // });
        // this.props.onClearSearch();
        this._handleClearSearchValueLeft();
    };
    handleChange = (param) => { //选择排序方式
        const [name, value] = param.split('=');
        this.props.dispatch(listSortTypeActive(param));
        // this.props.onHeadSearch({sort: name, sort_type: value});
        this._handleHeadSearch({sort: name, sort_type: value});
    };
    cancelPopup = () => {
        this.setState({
            isScreenFlag: false,
            isProductClass: false
        })
    };

    componentWillUnmount() {
        const {dispatch} = this.props;
        clearTimeout(this.timer);
        window.removeEventListener('scroll', this.scrollEvent);
        dispatch(getNameCatActive({}));
        dispatch(listSortTypeActive('')); //清除排序
        this.clearListDataCommon(); //清除页面的数据
        dispatch(otherScreeningActive({selectStarNum: 0, selectTime: -1}));
    }

    render() {
        const {searchData, globalBreadCrumb, searchTitle, sortType, nameCat} = this.props;
        const {labelFlag, isScreenFlag, isProductClass, containerWidth, fixedLeft} = this.state;
        const {keyword, designer, source_brand, site, price_min, cmtStar, sort, start_time} = this.pageInfo;
        let {data = [], count = 0} = searchData;
        let [item1, item2, item3] = globalBreadCrumb;
        let breadNum = item3.id ? 3 : item2.id ? 2 : item1.id ? 1 : 0,
            bool = designer || source_brand || keyword || start_time || sort || cmtStar || price_min;
        return (
            <Fragment>
                <Head title={searchTitle + '-产品搜索-火联FFDIG'}/>
                <Header onHeadSearch={this._handleHeadSearch} onHeadClearSearch={this._handleHeadSearch}/>
                <section id="productWrapId" className={`productWrap pr ${breadNum === 1 ? '' : ''}`}>
                    <div className="rightList pr">
                        {/*筛选条件*/}
                        <div id="searchCdtId" className="headFixed">
                            <div className="searchCondition" style={{width: containerWidth, margin: '0 auto'}}>
                                <ul className="screenUl">
                                    {
                                        nameCat.name && <li className={`screenLi ${isProductClass ? 'active' : ''}`}
                                                            onClick={this._handleShowProductClass}><i
                                            className="productIcon"
                                            style={{backgroundImage: `url('../../static/list/${isProductClass ? 'productWhite' : 'productBlack'}.png')`}}/><span>产品分类</span>
                                        </li>
                                    }
                                    <li className={`screenLi ${isScreenFlag ? 'active' : ''}`}
                                        onClick={this._handleShowSearch}><i className="screenIcon"
                                                                            style={{backgroundImage: `url('../../static/list/${isScreenFlag ? 'screenWhite' : 'screenBlack'}.png')`}}/><span>条件筛选</span>
                                    </li>
                                </ul>

                                <div className="labelAbsWrap">
                                    <div className={`labelWrap ${labelFlag ? 'active' : ''}`}>
                                        <div className="labelBox">
                                            <div className="labelItem">
                                                <span onClick={this._handleAllBreadcrumb}
                                                      className={`active pointer`}><span
                                                    className="site">{searchTitle}&nbsp;</span><span
                                                    className="productNum">({count}个产品)</span></span>
                                            </div>
                                            {
                                                globalBreadCrumb.map((item, index) => {
                                                    if (index < breadNum - 1) {
                                                        return (
                                                            <div className="labelItem pointer"
                                                                 key={index}>
                                                                {item.name ? <span>&nbsp;&gt;&nbsp;</span> : ''}

                                                                <span
                                                                    onClick={this._handleBreadcrumb.bind(this, item, index, breadNum)}
                                                                    className={`active pointer}`}>{item.name}</span>
                                                            </div>
                                                        )
                                                    } else {
                                                        return (
                                                            <div className="labelItem"
                                                                 key={index}>
                                                                {item.name ?
                                                                    <span>&nbsp;&gt;&nbsp;</span> : ''}
                                                                <span className="catName">{item.name}</span>
                                                            </div>
                                                        )
                                                    }
                                                })
                                            }
                                        </div>
                                    </div>
                                </div>
                                {/*清除全部*/}
                                {
                                    bool || breadNum > 0 ?
                                        <div className="clearAllBox pointer" onClick={this._handleCloseLabel}>
                                            <span className="text">清除全部</span>
                                            <i className="iconfont iconlb-cle clearIcon"/>
                                        </div> : null
                                }

                                {/*返回上一个页面
                                <i className="returnPageIcon pointer"
                                   style={{background: "url('../../static/denglu-iconguanbi@2x.png') no-repeat 0 0"}}
                                   onClick={this.handleGoBack}/>
                                   */}
                                <Button className="btn" type="primary"
                                        onClick={this._handleCollectAll}>收藏当前页面</Button>
                                {/*产品排序功能*/}
                                <Select value={sortType || '默认排序'} style={{width: 120, height: 30}}
                                        onChange={this.handleChange}>
                                    <Option value=""><span className="sortBox">默认排序</span></Option>
                                    {
                                        sortConst.map((item, index) => {
                                            return (<Option key={index} value={item.value}><span
                                                className={`sortBox ${sortType === item.value ? 'active' : ''} ${item.type === 'rise' ? 'up' : ''}`}>{item.name}
                                                <i
                                                    className={`iconfont iconsx-xl sortIcon ${sortType === item.value ? 'active' : ''}`}/></span></Option>)
                                        })
                                    }
                                </Select>
                            </div>
                        </div>
                        {/*瀑布流*/}
                        <ProductClassList containerWidth={containerWidth} onClearSearch={this._handleClearSearchValue}
                                          onHeadSearch={this._handleHeadSearch} onBanner={this._handleBanner}
                                          onChangePag={this.onChangePagination}/>
                        {
                            data.length > 0 && count <= this.pageInfo.page * 10 &&
                            <div className="noData">Ծ‸Ծ没有更多了~~</div>
                        }
                    </div>
                    <div className={`fixedBox ${isProductClass || isScreenFlag ? 'active' : ''}`}
                         onClick={this.cancelPopup}/>
                    {
                        <div style={{left: fixedLeft}}
                             className={`productCatItem ${isProductClass || isScreenFlag ? 'active' : ''}`}>
                            {/*产品分类*/}
                            <ProductClassItem visible={isProductClass} onClearSearch={this._handleClearSearchValueLeft}
                                              onClearPriceSearch={this._handleClearPriceSearch}
                                              onHeadSearch={this._handleHeadSearch}/>
                            {/*条件筛选*/}
                            <ScreenListCpn visible={isScreenFlag} onClearPriceSearch={this._handleClearPriceSearch}
                                           onHeadSearch={this._handleHeadSearch}/>
                        </div>
                    }
                </section>
            </Fragment>
        );
    }
}

const mapStateToProps = ({listPageReducer, searchPage, headerReducer, account}) => {
    return {
        searchData: listPageReducer.searchData,
        globalBreadCrumb: searchPage.globalBreadCrumb,
        searchTitle: searchPage.searchTitle,
        currencyType: headerReducer.rate,
        userInfo: account.userInfo,
        sortType: listPageReducer.sortType,
        nameCat: searchPage.nameCat,
    }
};
export default connect(mapStateToProps)(withRouter(SearchPage))
