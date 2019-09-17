import React, {Component, Fragment} from 'react';
import CarouselCpn from '../../components/CarouselCpn'
import ProductClassItem from './ProductClassItem'
import ScreenListCpn from "../../components/ScreenListCpn";
import ProductClassList from './ProductClassList'
import {axiosCookieHttp, axiosHttp} from "../../utils/ajax";
import {catData, catNameData, sortConst} from '../../config/labelData'
import {connect} from "react-redux";
import {
    getClassifyBanner,
    getHomePageData,
    getHomePageSearch,
    getHomePageSearchLoading,
    listSortTypeActive,
    otherScreeningActive,
    setSelectColorActive,
    setSelectDesignerActive,
    setSelectDesignerByActive,
    setSelectionLabelActive,
    setSelectStyleActive,
    setSelectTextureActive
} from "../../actions/listPageAction";
import {breadCrumbActive, getCatRelationActive, isLoginFlagActive} from "../../actions";
import Header from "../../components/Header";
import Head from "../../components/head";
import {withRouter} from "next/router";
import Utils from "../../utils/utils";
import {getClassifyMsgHttp} from "../../utils/exportFun";
import {Button, Select} from "antd";
import './index.less'

const Option = Select.Option;
const CONTAINER_WIDTH = 1670, CONTAINER_ITEM_WIDTH = 280, SCROLL_TOP_500 = 500;
let saveScrollTop = 0;

class ListPage extends Component {

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
        // let params = {
        //     "page": 1,
        //     "limit": 10,
        //     "keyword": "",
        //     "site": "",
        //     "price_max": 0,
        //     "sort": "", //默认按照美金:list_price_usd(价格),ondateOnline(上架时间),cmtStar(评论星级),cmtCount(评论数)
        //     "sort_type": "",  //升序:asc 倒序:desc
        //     "source_brand": "",//	string 品牌(需支持多个)
        //     "designer": "",//设计师(需支持多个)
        //     "cat_id": 0,
        //     "price_min": 0,
        //     "cmtStar": 0,//评论星级
        //     "start_time": 0,//上架时间开始时间(传时间戳)
        //     "end_time": 0,//上架时间结束时间(传时间戳)
        //     "currency": query.rate
        // };
        // const res2 = await axiosHttp("api/WebServices/Search/HomePageSearch", {...params, ...query});
        // await reduxStore.dispatch(getHomePageSearch({data: res2.data, count: res2.count}));
        // return {cmi_cat: cmi_catData, searchData: {data: res2.data, count: res2.count}}
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

    // isNoScroll = true;// 为true可以滚动,false不可以滚动
    componentDidMount() {
        let clientWidth = (document.body.clientWidth || document.documentElement.clientWidth),
            fixedLeft = clientWidth > CONTAINER_WIDTH ? CONTAINER_WIDTH : (Math.floor(clientWidth / CONTAINER_ITEM_WIDTH) * CONTAINER_ITEM_WIDTH) - 10;
        this.setState({
            containerWidth: fixedLeft,
            fixedLeft: (clientWidth - fixedLeft) / 2
        });
        const {cmi_cat, router, breadCrumb} = this.props;
        let storage = window.sessionStorage;
        storage.setItem('cmi_cat', JSON.stringify(cmi_cat));
        let {cat_id = "0", keyword = '', site = ''} = router.query;
        if (!cat_id) {
            this.props.router.push({pathname: '/'});
            return
        }
        this.clearListDataCommon();
        if (cat_id.indexOf('1') === 0) {  //一级目录才有banner
            this.getClassifyBannerHttp(cat_id);
        }
        if (isNaN(parseInt(cat_id))) {
            let id = '', obj = {id: '', name: '', index: 0}, i = 0;
            for (; i < catNameData.length; i++) {
                if (catNameData[i].name === cat_id) {
                    id = catData[i].data;
                    break;
                }
            }
            breadCrumb[0] = {id: catData[i].data, name: catData[i].name, index: i};
            breadCrumb[1] = obj;
            breadCrumb[2] = obj;
            this.props.dispatch(breadCrumbActive(breadCrumb));
            this.pageInfo = {...this.pageInfo, cat_id: id};
            this.getCatRelationHttp(id);
            this.getClassifyBannerHttp(id);
        } else {
            this.pageInfo = {...this.pageInfo, ...router.query};
        }
        this.homePageSearchHttp();
        let nickName = storage.getItem('nickName');
        if (nickName) {
            this.checkIsCollectHttp();
        }
        window.addEventListener('scroll', this.scrollEvent);
        window.scroll(0, 0);
    }

    scrollEvent = () => {
        clearTimeout(this.timer);
        const {breadCrumb, userInfo} = this.props;
        const [item1, item2, item3] = breadCrumb;
        let breadNum = item3.id ? 3 : item2.id ? 2 : item1.id ? 1 : 0;
        this.timer = setTimeout(() => {
            let searchCdtId = document.getElementById('searchCdtId'),
                productListWrapId = document.getElementById('productListWrapId');
            let scrollTop = document.body.scrollTop || document.documentElement.scrollTop,
                clientHeight = document.body.clientHeight || document.documentElement.clientHeight,
                scrollHeight = document.body.scrollHeight || document.documentElement.scrollHeight;

            // const {isScreenFlag, isProductClass} = this.state;
            // if (!this.isNoScroll) {
            //     this.isNoScroll = true;
            //     return
            // }
            // this.setState({
            //     isScreenFlag: false,
            //     isProductClass: false
            // });
            // if (Math.abs(saveScrollTop - scrollTop) > 300) {
            // if (isProductClass || isScreenFlag) {

            // }
            // }
            if (scrollTop + clientHeight + 200 >= scrollHeight) {
                if (this.pageInfo.page % 10 === 0 || this.isSendFlag === true) {
                    return
                }
                const {count} = this.props.searchData;
                if (count <= this.pageInfo.page * 10) {
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
            let flag = searchCdtId.className.indexOf('searchCdt') >= 0;
            if (breadNum === 1) {
                let productWrapId = document.getElementById('productWrapId');
                if (scrollTop + 100 >= productWrapId.offsetTop && !flag) {
                    searchCdtId.classList.add('searchCdt');
                    productListWrapId.style.paddingTop = '68px';
                } else if (scrollTop <= productWrapId.offsetTop) { //120
                    if (searchCdtId.className.indexOf('searchCdt') >= 0) {
                        searchCdtId.classList.remove('searchCdt');//
                        productListWrapId.style.paddingTop = '8px';
                    }
                }
            } else {
                if (flag && scrollTop <= 50) {
                    searchCdtId.classList.remove('searchCdt');//
                    productListWrapId.style.paddingTop = '8px';
                    return
                }
                searchCdtId.classList.add('searchCdt');
                productListWrapId.style.paddingTop = '68px';
            }
            saveScrollTop = scrollTop;
            clearTimeout(this.timer)
        }, 100);
    };
    //     根据分类id获取分类映射信息
    getCatRelationHttp = (cat_id) => { //首页搜索--已登录
        axiosHttp(`api/WebSite/Classify/GetCatRelation?catid=${cat_id}`, '', 'get').then((res) => {
            if (res.code === 200) {
                let relation = {};
                if (res.data) {
                    const {designerBy, designer, site, style, texture, color} = res.data;
                    relation = {
                        designerBy: Utils.bouncer(designerBy),
                        designer: Utils.bouncer(designer),
                        site: site,
                        style: Utils.bouncer(style),
                        texture: Utils.bouncer(texture),
                        color: Utils.bouncer(color)
                    }
                }
                this.props.dispatch(getCatRelationActive(relation));
            }
        }).catch(e => {
            console.log(e);
        })
    };
    getClassifyBannerHttp = (catId) => { //分类Banner图
        axiosCookieHttp(`api/WebSite/Classify/GetClassifyBanner?catid=${catId}`, '', 'GET').then((res) => {
            if (res.code === 200) {
                if (res.data) {
                    this.props.dispatch(getClassifyBanner(res.data.data || []));
                }
            }
        }).catch((e) => {
            console.log(e);
        })
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
                    let collectData = res.data, newData = {};
                    for (let i = 0; i < data.length; i++) {
                        for (let j = 0; j < collectData.length; j++) {
                            newData = collectData[j];
                            if (data[i].object_id === newData.id) {
                                data[i].isCollect = newData.isCollect;
                                data[i].lable = newData.lable;
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

    homePageSearchHttp = () => { //首页搜索--已登录
        this.props.dispatch(getHomePageSearchLoading());
        axiosCookieHttp("api/WebServices/Search/HomePageSearch", this.pageInfo).then(res => {
            if (res.code === 0) {
                const {data, count, currentPage} = this.props.searchData;
                if (res.data) {
                    this.props.dispatch(getHomePageSearch({
                        data: data.concat(res.data),
                        count: res.count,
                        currentPage
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
            this.isSendFlag = false;
        }).catch(res => {
            this.clearListDataCommon();
        });
    };
    homePageSearchHttpStart = (page = 1) => { //首页搜索--已登录
        this.clearListDataCommon();
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
                } else {
                    this.clearListDataCommon();
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
        if (params.cat_id) {
            this.replaceStateUtils(encodeURIComponent(params.cat_id))
        }
        this.cancelPopup();
        this.homePageSearchHttpStart();
    };
    _handleHeadClearSearch = (id = '') => {
        const {currencyType} = this.props;
        this.isSendFlag = true;
        let {cat_id = "0", keyword = '', site = '', name = ''} = this.props.router.query;
        this.pageInfo = {
            cat_id: id || cat_id,
            keyword: keyword,
            site: site,
            source_brand: '',
            designer: '',
            page: 1,
            "limit": 10,
            "price_max": 0,
            "sort": '', //默认按照美金:list_price_usd(价格),ondateOnline(上架时间),cmtStar(评论星级),cmtCount(评论数)
            "sort_type": '',  //升序:asc 倒序:desc
            "price_min": 0,
            "cmtStar": 0,//评论星级
            "start_time": 0,//上架时间开始时间(传时间戳)
            "end_time": 0,//上架时间结束时间(传时间戳)
            "currency": (currencyType && currencyType.toLowerCase()) || 'cny',//币种(默认人民币:cny,美元传:usd)
        };
        this.homePageSearchHttpStart();
    };
    _handleClearPriceSearch = () => { //清理价格
        this.pageInfo = {...this.pageInfo, price_min: 0, price_max: 0, page: 1};
        this.homePageSearchHttpStart();
    };
    _handleBanner = (cat1Id) => { //处理banner请求
        this.pageInfo = {...this.pageInfo, cat_id: cat1Id, page: 1};
        // this.homePageSearchHttpStart();
        this.getClassifyBannerHttp(cat1Id);
    };
    _handleClearSearchValue = () => { //清除搜索的值
        this.pageInfo = {...this.pageInfo, keyword: '', site: '', source_brand: '', designer: '', page: 1};
        this.homePageSearchHttpStart();
    };
    onChangePagination = (page) => {
        this.pageInfo.page = (page - 1) * 10 + 1;
        this.homePageSearchHttpStart(page);
    };
    handleChange = (param) => { //选择排序方式
        const [name, value] = param.split('=');
        this.props.dispatch(listSortTypeActive(param));
        this._handleHeadSearch({sort: name, sort_type: value});
    };
    _handleShowProductClass = () => {
        // this.isNoScroll = false;
        this.setState({
            isProductClass: !this.state.isProductClass,
            isScreenFlag: false
        });
        this.scrollToCommonFun();
    };
    _handleShowSearch = () => {
        // this.isNoScroll = false;
        this.setState({
            isScreenFlag: !this.state.isScreenFlag,
            isProductClass: false
        });
        this.scrollToCommonFun();
    };
    scrollToCommonFun = () => {
        let searchCdtId = document.getElementById('searchCdtId');
        if (!searchCdtId.className.indexOf('searchCdt') >= 0) {
            window.scrollTo(0, SCROLL_TOP_500);
        }
    };
    _handleBreadcrumb = (item, index, breadNum) => { //点击面包屑
        const {breadCrumb} = this.props, obj = {id: '', name: '', index: 0};
        if (index < breadNum - 1) {
            if (index === 0) {
                breadCrumb[1] = obj;
                breadCrumb[2] = obj;
                let searchCdtId = document.getElementById('searchCdtId');
                searchCdtId.classList.remove('searchCdt');
                this.replaceStateUtils(item.id);
                this.getClassifyBannerHttp(item.id);
                this._handleHeadClearSearch(item.id);
            } else if (index === 1) {
                breadCrumb[2] = obj;
                this._handleHeadSearch({cat_id: item.id});
            }
            this.props.dispatch(breadCrumbActive(breadCrumb));
        }
    };
    _handleDeleteStyle = (index) => { //删除单个款式标签
        const {selectStyle, selectColor, selectTexture, dispatch} = this.props;
        selectStyle.splice(index, 1);
        this._handleHeadSearch({keyword: selectStyle.concat(selectColor, selectTexture).toString()});
        dispatch(setSelectStyleActive(selectStyle));
    };
    _handleDeleteColor = (index) => { //删除单个颜色标签
        const {selectStyle, selectColor, selectTexture, dispatch} = this.props;
        selectColor.splice(index, 1);
        this._handleHeadSearch({keyword: selectStyle.concat(selectColor, selectTexture).toString()});
        dispatch(setSelectColorActive(selectColor));
    };
    _handleDeleteTexture = (index) => { //删除单个材质标签
        const {selectStyle, selectColor, selectTexture, dispatch} = this.props;
        selectTexture.splice(index, 1);
        this._handleHeadSearch({keyword: selectStyle.concat(selectColor, selectTexture).toString()});
        dispatch(setSelectTextureActive(selectTexture));
    };
    _handleDeleteLabel = (index) => { //删除单个站点标签
        const {selectLabel} = this.props;
        selectLabel.splice(index, 1);
        this._handleHeadSearch({site: selectLabel.toString()});
        this.props.dispatch(setSelectionLabelActive(selectLabel));
    };
    _handleDeleteDesigner = (index) => { //删除单个品牌标签
        const {selectDesigner} = this.props;
        selectDesigner.splice(index, 1);
        this._handleHeadSearch({source_brand: selectDesigner.toString()});
        this.props.dispatch(setSelectDesignerActive(selectDesigner));
    };
    _handleDeleteDesignerBy = (index) => { //删除单个设计师标签
        const {selectDesignerBy} = this.props;
        selectDesignerBy.splice(index, 1);
        this._handleHeadSearch({designer: selectDesignerBy.toString()});
        this.props.dispatch(setSelectDesignerByActive(selectDesignerBy));
    };
    _handleCloseLabel = () => { //清空label标签
        const {dispatch, breadCrumb} = this.props;
        breadCrumb[1] = {id: '', name: '', index: 0};
        breadCrumb[2] = {id: '', name: '', index: 0};
        dispatch(setSelectionLabelActive([]));
        dispatch(setSelectDesignerActive([]));
        dispatch(setSelectDesignerByActive([]));
        dispatch(setSelectStyleActive([]));
        dispatch(setSelectColorActive([]));
        dispatch(setSelectTextureActive([]));
        dispatch(listSortTypeActive('')); //清除排序
        let catId = breadCrumb[0].id;
        this.replaceStateUtils(catId);
        dispatch(otherScreeningActive({selectStarNum: 0, selectTime: -1}));
        if (breadCrumb[1].id) {
            this.getClassifyBannerHttp(catId);
        }
        this._handleHeadClearSearch(catId);
        dispatch(breadCrumbActive(breadCrumb));
        this.setState({
            labelFlag: false,
            isProductClass: false,
            isScreenFlag: false,
        });
    };
    _handleOpenLabel = () => { //打开/关闭下拉框label标签
        this.setState({
            labelFlag: !this.state.labelFlag
        })
    };
    _handleCollectAll = () => {
        let nickName = window.sessionStorage.getItem('nickName');
        if (nickName) {
            this.setState({
                drawerFlag: true,
            });
        } else {
            this.props.dispatch(isLoginFlagActive(true));
        }
    };
    replaceStateUtils = (catId) => {
        window.history.replaceState(null, null, '/dig-products?cat_id=' + catId);
    };
    cancelPopup = () => {
        this.setState({
            isScreenFlag: false,
            isProductClass: false
        })
    };

    componentWillUnmount() {
        const {dispatch} = this.props;
        this.clearListDataCommon(); // 清除列表数据
        dispatch(getClassifyBanner()); //清除banner数据 []
        dispatch(otherScreeningActive({selectStarNum: 0, selectTime: -1}));
        dispatch(listSortTypeActive()); //清除排序 ''
        dispatch(getCatRelationActive()); //{}
        clearTimeout(this.timer);
        window.removeEventListener('scroll', this.scrollEvent);
    }

    render() {
        const {banner, breadCrumb, searchData: {data = [], count = 0, currentPage = 1}, selectLabel = [], selectDesigner = [], selectDesignerBy = [], selectStyle = [], selectColor = [], selectTexture = [], sortType} = this.props;
        const {labelFlag, isScreenFlag, isProductClass, containerWidth, fixedLeft} = this.state;
        const {keyword, designer, source_brand, site, price_min, cmtStar, sort, start_time} = this.pageInfo;
        let [item1, item2, item3] = breadCrumb;
        let breadNum = item3.id ? 3 : item2.id ? 2 : item1.id ? 1 : 0,
            headTitle = item3.id ? item3.name + '-' + item2.name + '-' + item1.name : item2.id ? item2.name + '-' + item1.name : item1.name,
            bool = designer || source_brand || site || keyword || start_time || sort || cmtStar || price_min;
        let conditionFlag = selectLabel.length > 0 || selectDesigner.length > 0 || selectDesignerBy.length > 0 || selectStyle.length > 0 || selectColor.length > 0 || selectTexture.length > 0;
        return (
            <Fragment>
                <Head
                    title={breadNum === 1 ? catNameData[item1.index].title : `${headTitle}_【全球 新品 热销 时尚 品牌】-火联FFDIG`}/>
                <Header onHeadSearch={this._handleHeadSearch} onHeadClearSearch={this._handleHeadClearSearch}
                        onBanner={this._handleBanner}/>
                {
                    (breadNum === 1 && banner.length > 0 && !bool) && <CarouselCpn banner={banner}/>
                }
                <section id="productWrapId" className={`productWrap pr ${breadNum === 1 ? '' : ''}`}>
                    <div className="rightList pr">
                        {/*筛选条件*/}
                        <div id="searchCdtId" className="listFixed">
                            <div className="searchCondition"
                                 style={{width: containerWidth, margin: '0 auto'}}>
                                <ul className="screenUl">
                                    <li className={`screenLi ${isProductClass ? 'active' : ''}`}
                                        onClick={this._handleShowProductClass}>
                                        <i className="productIcon"
                                           style={{backgroundImage: `url('../../static/list/${isProductClass ? 'productWhite' : 'productBlack'}.png')`}}/><span>产品分类</span>
                                    </li>
                                    <li className={`screenLi ${isScreenFlag ? 'active' : ''}`}
                                        onClick={this._handleShowSearch}><i className="screenIcon"
                                                                            style={{backgroundImage: `url('../../static/list/${isScreenFlag ? 'screenWhite' : 'screenBlack'}.png')`}}/><span>条件筛选</span>
                                    </li>
                                </ul>

                                <div className="labelAbsWrap">
                                    <div className={`labelWrap ${labelFlag ? 'active' : ''}`}>
                                        <div className="labelBox">
                                            {
                                                breadCrumb.map((item, index) => {
                                                    if (index < breadNum - 1) {
                                                        return (
                                                            <div className="labelItem"
                                                                 key={index}>{item.name && index !== 0 ?
                                                                <span>&nbsp;&gt;&nbsp;</span> : ''}
                                                                <span
                                                                    onClick={this._handleBreadcrumb.bind(this, item, index, breadNum)}
                                                                    className={`active pointer`}>{item.name}</span>
                                                            </div>
                                                        )
                                                    } else {
                                                        return (
                                                            <div className="labelItem"
                                                                 key={index}>{item.name && index !== 0 ?
                                                                <span>&nbsp;&gt;&nbsp;</span> : ''}
                                                                <span className="catName">{item.name}</span>
                                                            </div>
                                                        )
                                                    }
                                                })
                                            }
                                        </div>
                                        {
                                            conditionFlag ?
                                                <div className={`popupWrap pr ${labelFlag ? 'active' : ''}`}>
                                                    {
                                                        selectStyle.map((item, index) => { //款式
                                                            return (
                                                                <div key={index} className="popup"><span
                                                                    className="labelText">{item}</span><i
                                                                    className="iconfont iconlb-biaoqianx deleteIcon pointer"
                                                                    onClick={this._handleDeleteStyle.bind(this, index)}/>
                                                                </div>)
                                                        })
                                                    }
                                                    {
                                                        selectColor.map((item, index) => { //颜色
                                                            return (
                                                                <div key={index} className="popup"><span
                                                                    className="labelText">{item}</span><i
                                                                    className="iconfont iconlb-biaoqianx deleteIcon pointer"
                                                                    onClick={this._handleDeleteColor.bind(this, index)}/>
                                                                </div>)
                                                        })
                                                    }
                                                    {
                                                        selectTexture.map((item, index) => { //材质
                                                            return (
                                                                <div key={index} className="popup"><span
                                                                    className="labelText">{item}</span><i
                                                                    className="iconfont iconlb-biaoqianx deleteIcon pointer"
                                                                    onClick={this._handleDeleteTexture.bind(this, index)}/>
                                                                </div>)
                                                        })
                                                    }
                                                    {
                                                        selectLabel.map((item, index) => { //站点
                                                            return (
                                                                <div key={index} className="popup"><span
                                                                    className="labelText">{item}</span><i
                                                                    className="iconfont iconlb-biaoqianx deleteIcon pointer"
                                                                    onClick={this._handleDeleteLabel.bind(this, index)}/>
                                                                </div>)
                                                        })
                                                    }
                                                    {
                                                        selectDesigner.map((item, index) => { //品牌
                                                            return (
                                                                <div key={index} className="popup"><span
                                                                    className="labelText">{item}</span><i
                                                                    className="iconfont iconlb-biaoqianx deleteIcon pointer"
                                                                    onClick={this._handleDeleteDesigner.bind(this, index)}/>
                                                                </div>)
                                                        })
                                                    }
                                                    {
                                                        selectDesignerBy.map((item, index) => { //设计师
                                                            return (
                                                                <div key={index} className="popup"><span
                                                                    className="labelText">{item}</span><i
                                                                    className="iconfont iconlb-biaoqianx deleteIcon pointer"
                                                                    onClick={this._handleDeleteDesignerBy.bind(this, index)}/>
                                                                </div>)
                                                        })
                                                    }
                                                    {/*关闭下拉框*/}
                                                    {/*
                                                    <div className="clearLabel">
                                                        <div className="pointer" onClick={this._handleCloseLabel}>
                                                            <span className="text">清除全部</span>
                                                            <i className="iconfont iconlb-cle clearIcon"/>
                                                        </div>
                                                    </div>
                                                    */}
                                                    {/*打开下拉框*/}
                                                    <i className={`iconfont iconlb-more
 openIcon ${labelFlag ? 'active' : ''}`} onClick={this._handleOpenLabel}/>
                                                </div> : null
                                        }
                                    </div>
                                </div>
                                {/*清除全部*/}
                                {
                                    bool || breadNum > 1 ?
                                        <div className="clearAllBox pointer" onClick={this._handleCloseLabel}>
                                            <span className="text">清除全部</span>
                                            <i className="iconfont iconlb-cle clearIcon"/>
                                        </div> : null
                                }

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
                                                    className={`iconfont iconsx-xl sortIcon`}/></span></Option>)
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
                            <ProductClassItem visible={isProductClass}
                                              onClearSearch={this._handleHeadClearSearch}
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

const
    mapStateToProps = ({listPageReducer, headerReducer, account}) => {
        return {
            searchData: listPageReducer.searchData,
            banner: listPageReducer.banner,
            cmi_cat: listPageReducer.cmi_cat,
            cat1Id: headerReducer.cat1Id,
            breadCrumb: headerReducer.breadCrumb,
            currencyType: headerReducer.rate,
            userInfo: account.userInfo,

            selectLabel: listPageReducer.selectLabel,
            selectDesigner: listPageReducer.selectDesigner,
            selectDesignerBy: listPageReducer.selectDesignerBy,
            selectStyle: listPageReducer.selectStyle,
            selectColor: listPageReducer.selectColor,
            selectTexture: listPageReducer.selectTexture,
            sortType: listPageReducer.sortType,
        }
    };
export default connect(mapStateToProps)(withRouter(ListPage))
