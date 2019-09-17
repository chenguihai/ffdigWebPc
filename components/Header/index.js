import React, {Component, Fragment} from 'react';
import {Icon, Input, Select, Avatar, Popover, Modal, Button} from "antd";
import Link from "next/link";
import {withRouter} from "next/router";
import LoginModal from '../LoginModal'
import RegisterCpn from '../RegisterCpn'
import WeChatLogin from '../weChatLogin'
import {connect} from 'react-redux'
import {catData, catNameData, labelMark} from '../../config/labelData'
import config from '../../config/config'
import {
    getNameCatActive,
    getUserCollectCount,
    isLoginFlagActive,
    isRegisterFlagActive, searchTitleActive,
    setAccountInfoAction
} from '../../actions'
import {
    getExchangeRateAction,
    getUserCollectCountAction,
    breadCrumbActive,
    getCatRelationActive,
} from "../../actions/headerAction";
import FindPwdCPn from "../FindPwdCpn";
import {
    getClassifyBanner,
    getHomePageData,
    globalSearchActive,
    listSortTypeActive, otherScreeningActive, setSelectColorActive,
    setSelectDesignerActive,
    setSelectDesignerByActive,
    setSelectionLabelActive,
    setSelectStyleActive, setSelectTextureActive
} from "../../actions/listPageAction";
import {
    globalBreadCrumbActive,
} from "../../actions/searchPageAction";
import {axiosHttp} from "../../utils/ajax";
import SvglogoBai from '../../static/svglogobai.svg'
import commonFun from "../../utils/commonFun";
import Utils from "../../utils/utils";
import './index.less'

const Option = Select.Option;

class Header extends Component {
    state = {
        loginFlag: false,
        registerFlag: false,
        cat1Data: [],
        cat2Data: [],
        cat3Data: [],
        closeDropdown: false, //false
        findPwdFlag: false,
        weChatFlag: false,
        weChatSuccessFlag: false, // false
        retryFlag: false,
        weChatData: {},
        headBottomFlag: false,
        isChangeCat: false,
        defaultValue: '全部',
        isSearchDrawer: false,
        isCloseSecondNav: false,
        pageType: '',
        hoverCat1: -1,
        hoverCat2: -1,
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
        "cat_id": 0,
        "price_min": 0,
        "cmtStar": 0,//评论星级
        "start_time": 0,//上架时间开始时间(传时间戳)
        "end_time": 0,//上架时间结束时间(传时间戳)
    };
    searchCatId = 0;
    timer = null;
    // encodeURIComponent
    // decodeURIComponent
    componentDidMount() {
        const {router, dispatch, breadCrumb, cmi_cat = [], globalSearch} = this.props;
        let search = window.location.search, storage = window.sessionStorage,
            headImgUrl = storage.getItem('headImgUrl') || '',
            authorization = storage.getItem('authorization') || '',
            nickName = storage.getItem('nickName') || '',
            breadCrumbs = storage.getItem('breadCrumbs');
        if (breadCrumbs) {
            dispatch(breadCrumbActive(JSON.parse(breadCrumbs)));
        }
        if (search.indexOf('&state=') >= 0) {
            storage.setItem("wcParams", search);
            let wcParams = storage.getItem("wcParams");
            if (wcParams) {
                this.webUserAuthHttp(wcParams);
            }
        }
        let {pathname, query = {}} = router;
        if (pathname === '/dig-products' && query.cat_id && !globalSearch) {
            this.getCatRelationHttp(query.cat_id);
        } else if (pathname === '/') {
            this.refs.headBottomRef.classList.add('active');
        }
        if (nickName) {
            dispatch(getUserCollectCountAction());
            dispatch(setAccountInfoAction(
                {
                    token: authorization,
                    nickName: nickName,
                    headImgurl: headImgUrl
                }));
        }
        let cmiCat = cmi_cat.length > 0 ? cmi_cat : (JSON.parse(window.sessionStorage.getItem('cmi_cat')) || []),
            index = breadCrumb[0].index;
        if (cmiCat.length > 0 && cmiCat[index].list.length > 0) {
            dispatch(getHomePageData(cmiCat));
            this.setState({
                cat1Data: cmiCat,
                cat2Data: cmiCat[index].list,
                cat3Data: cmiCat[index].list[0].list,
            })
        }
    }

    webUserAuthHttp = (wcParams) => {  //web微信用户授权
        axiosHttp('api/WeiXin/WeixinLogin/WebUserAuth' + wcParams, '', 'GET').then((res) => {
            if (res.code === 200) {
                let data = JSON.parse(res.data);
                if (data.errcode === 41001) {
                    this.setState({
                        retryFlag: true,
                    });
                } else {
                    this.setState({
                        weChatData: data,
                        weChatSuccessFlag: true
                    });
                }
            } else if (res.code === 210) {//已授权，直接扫码登录
                window.sessionStorage.removeItem("wcParams");
                this.loginCommonFun(res.data);
            }
        }).catch((e) => {
            console.log(e);
        });
    };
    loginCommonFun = (data) => {
        commonFun.storageLoginInfoFun(data);
        this.props.dispatch(setAccountInfoAction(data));
    };

    _handleShowLogin = () => {
        this.setState({
            loginFlag: true
        })
    };
    _handleShowRegister = () => {
        this.setState({
            registerFlag: true
        })
    };
    _handleCat1 = (index, item) => {  //一级分类点击  globalSearch
        const {breadCrumb, router, dispatch} = this.props, itemBread = {id: '', name: '', index: 0};
        this.setState({
            closeDropdown: false,
            defaultValue: item.cat1_name_cn
        });
        this.clearCatRelationCommon();
        let pathname = router.pathname;
        this.searchCatId = item.cat1_id;

        breadCrumb[0] = {id: item.cat1_id, name: item.cat1_name_cn, index: index};
        breadCrumb[1] = itemBread;
        breadCrumb[2] = itemBread;
        dispatch(listSortTypeActive(''));
        dispatch(breadCrumbActive(breadCrumb));

        this.props.dispatch(otherScreeningActive({selectStarNum: 0, selectTime: -1}));
        if (pathname === '/dig-products') {
            this.props.onBanner(item.cat1_id);
            this.getCatRelationHttp(item.cat1_id);
            // let param = {cat_id: item.cat1_id, sort_type: '', sort: '', keyword: ''};
            this.props.onHeadClearSearch(item.cat1_id);
        } else {
            // router.push({
            //     // pathname: `/dig-products?name=${catNameData[index]}`,
            //     pathname: `/dig-products`,
            //     query: {catName: catNameData[index], cat_id: item.cat1_id}
            // });
        }
        commonFun.setMetaAboutSeoFun(catNameData[index]);
        this.props.dispatch(globalSearchActive(''));
    };
    clearCatRelationCommon = () => {
        const {dispatch} = this.props;
        dispatch(setSelectionLabelActive([]));
        dispatch(setSelectDesignerActive([]));
        dispatch(setSelectDesignerByActive([]));
        dispatch(setSelectStyleActive([]));
        dispatch(setSelectColorActive([]));
        dispatch(setSelectTextureActive([]));
    };
    catNavCommonFun = (cat_id) => {
        this.setState({
            closeDropdown: false
        });
        const {router, dispatch} = this.props;
        let pathname = router.pathname;
        dispatch(globalSearchActive(''));
        dispatch(getClassifyBanner([]));
        this.clearCatRelationCommon();
        if (pathname === '/dig-products') {
            let param = {};
            if (this.props.globalSearch) {
                param = {...this.pageInfo, cat_id: cat_id};
            } else {
                param = {cat_id: cat_id};
            }
            window.history.replaceState(null, null, '/dig-products?cat_id=' + cat_id);
            this.getCatRelationHttp(cat_id);
            this.props.onHeadSearch(param);
        } else {
            router.push({
                pathname: '/dig-products',
                query: {cat_id: cat_id}
            });
        }
        this.closeHeadCat2Common();
    };
    closeHeadCat2Common = () => {
        this.refs.headBottomRef.classList.remove('active');
    };
    _handleCat2 = (cat_id) => {
        this.searchCatId = cat_id;
        const {cmi_cat, breadCrumb} = this.props;
        let cat2Data = [];
        for (let i = 0; i < cmi_cat.length; i++) {
            cat2Data = cmi_cat[i].list;
            for (let j = 0; j < cat2Data.length; j++) {
                if (cat_id === cat2Data[j].cat2_id) {
                    breadCrumb[0] = {id: cmi_cat[i].cat1_id, name: cmi_cat[i].cat1_name_cn, index: i};
                    breadCrumb[1] = {id: cat_id, name: cat2Data[j].cat2_name_cn, index: j};
                    breadCrumb[2] = '';
                    this.props.dispatch(breadCrumbActive(breadCrumb));
                    this.catNavCommonFun(cat_id);
                    break;
                }
            }
        }
    };
    _handleCat3 = (cat_id) => {
        this.searchCatId = cat_id;
        const {cmi_cat, breadCrumb} = this.props;
        let cat2Data = [], cat3Data = [];
        for (let i = 0; i < cmi_cat.length; i++) {
            cat2Data = cmi_cat[i].list;
            for (let j = 0; j < cat2Data.length; j++) {
                cat3Data = cat2Data[j].list;
                for (let m = 0; m < cat3Data.length; m++) {
                    if (cat_id === cat3Data[m].cat3_id) {
                        breadCrumb[0] = {id: cmi_cat[i].cat1_id, name: cmi_cat[i].cat1_name_cn, index: i};
                        breadCrumb[1] = {id: cat2Data[j].cat2_id, name: cat2Data[j].cat2_name_cn, index: j};
                        breadCrumb[2] = {id: cat_id, name: cat3Data[m].cat3_name_cn, index: m};
                        this.props.dispatch(breadCrumbActive(breadCrumb));
                        this.catNavCommonFun(cat_id);
                        break;
                    }
                }
            }
        }
    };

    _handleCurrency = () => {
        const {rate} = this.props.headInfo;
        let currencyType = 'CNY';
        if (rate === 'CNY') {
            currencyType = 'USD';
        }
        this.props.dispatch(getExchangeRateAction(currencyType)); //获取汇率信息
    };
    topRankingMouseOver = () => {
        this.setState({
            isCloseSecondNav: this.state.isCloseSecondNav,
            closeDropdown: false
        })
    };
    _handleMouseOver = (item, subscript) => {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            const {breadCrumb} = this.props;
            let index = 0;
            for (let i = 0; i < item.length; i++) {
                if (breadCrumb[1].id === item[i].cat2_id) {
                    index = i;
                    break;
                }
            }
            this.setState({
                closeDropdown: true,
                hoverCat1: subscript,
                hoverCat2: 0,
                cat2Data: item,
                cat3Data: item.length > 0 && item[index].list
            });
        }, 100);

    };
    _handleMouseOverCat2 = (item, index) => {
        this.setState({
            cat3Data: item,
            hoverCat2: index
        });
    };
    _handleMouseLeave = () => {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            this.setState({
                cat2Data: [],
                cat3Data: [],
                closeDropdown: false
            });
            clearTimeout(this.timer);
        }, 100);
    };
    _handleSureLogout = () => {
        window.sessionStorage.clear();
        const {dispatch, router} = this.props;
        dispatch(setAccountInfoAction(
            {
                token: '',
                nickName: '',
                headImgurl: ''
            }));
        dispatch(getUserCollectCount(0));
        if (router.pathname === '/bgPage' || router.pathname === '/accountManage') {
            router.push({
                pathname: '/'
            });
        }
    };
    _handleCollection = () => {
        let nickName = window.sessionStorage.getItem('nickName');
        if (nickName) {
            this.props.router.push({
                pathname: '/bgPage'
            })
        } else {
            this.setState({
                loginFlag: true
            });
        }
    };
    _handleRetryWeChatLogin = () => {
        this.setState({
            retryFlag: false,
        }, () => {
            this.wxLoginCommonFun();
        })
    };
    onShowRegister = () => {
        this.setState({
            registerFlag: true
        })
    };
    onShowLogin = () => {
        this.setState({
            loginFlag: true
        })
    };
    onShowFindWpd = () => {
        this.setState({
            findPwdFlag: true
        })
    };
    onShowWeChat = () => {
        this.setState({
            weChatFlag: true,
        }, () => {
            this.setState({
                retryFlag: false
            }, () => {
                this.wxLoginCommonFun();
            });
        })
    };
    wxLoginCommonFun = () => { //微信登录的公共函数
        var obj = new WxLogin({
            self_redirect: false,
            id: "login_container",
            appid: config.appID,
            scope: "snsapi_login",
            redirect_uri: config.serverUrl,
            state: "",
            style: "",
            href: ""
        });
    };
    searchCommonFun = (keyword) => {
        const {router, onHeadSearch, selectStyle = [], selectColor = [], selectTexture = [], breadCrumb, cmi_cat} = this.props;
        let obj = {id: '', name: '', index: 0}, obj2 = {}, param = {};
        if (!this.searchCatId) { //没有选择或者选择了全部
            this.props.dispatch(globalBreadCrumbActive([obj, obj, obj]));
            param = {keyword: keyword, cat_id: '0'};
            this.props.dispatch(searchTitleActive(keyword));
            if (router.pathname === '/searchPage') {
                this.props.dispatch(getNameCatActive({}));
                onHeadSearch({...param, site: ''});
            } else {
                router.push({
                    pathname: '/searchPage',
                    query: param,
                })
            }
        } else {
            if (this.searchCatId.substring(0, 1) === '2') {  //选择了二级类名
                let data = cmi_cat[breadCrumb[0].index].list;
                for (let i = 0; i < data.length; i++) {
                    if (data[i].cat2_id === this.searchCatId) {
                        obj2 = {id: data[i].cat2_id, name: data[i].cat2_name_cn, index: i};
                        breadCrumb[1] = obj2;
                        breadCrumb[2] = obj;
                        break;
                    }
                }
            } else {  //选了一级类名
                if (!breadCrumb[0].id) {
                    for (let i = 0; i < catData.length; i++) {
                        if (catData[i].data === this.searchCatId) {
                            obj2 = {id: catData[i].data, name: catData[i].name, index: i};
                            breadCrumb[0] = obj2;
                            break;
                        }
                    }
                }
                breadCrumb[1] = obj;
                breadCrumb[2] = obj;
            }
            window.history.replaceState(null, null, `/listPage?keyword=${keyword}&cat_id=${this.searchCatId}`);
            this.props.dispatch(breadCrumbActive(breadCrumb));
            let kwdArr = [keyword ? keyword : ''];
            let kwd = selectStyle.concat(selectColor, selectTexture, kwdArr).toString();
            param = {keyword: kwd, cat_id: this.searchCatId};
            if (router.pathname === '/dig-products') {
                this.clearCatRelationCommon();
                onHeadSearch(param);
            } else {
                router.push({
                    pathname: '/dig-products',
                    query: param,
                })
            }
        }
    };

    handleChange = (value) => {
        this.searchCatId = value;
        this.setState({
            defaultValue: value
        });
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
    cancelPopup = () => {
        this.setState({
            loginFlag: false,
            registerFlag: false,
            findPwdFlag: false,
            weChatFlag: false,
            weChatSuccessFlag: false
        });
        this.props.dispatch(isLoginFlagActive(false));
        this.props.dispatch(isRegisterFlagActive(false));
    };

    handlePressEnter = (e) => {
        this.showSearchDrawer();
        // console.log(e.target.value);
        this.searchCommonFun(e.target.value);
    };
    handleKeywordChange = (e) => {
        this.pageInfo.keyword = e.target.value;
    };
    handleKeywordSearch = () => {
        this.showSearchDrawer();
        this.searchCommonFun(this.pageInfo.keyword);
    };
    handleHotSearch = (item) => {
        this.showSearchDrawer();
        this.searchCommonFun(item);
    };

    showSearchDrawer = () => {
        this.setState({
            isSearchDrawer: !this.state.isSearchDrawer
        })
    };
    closeSecondLevelNav = () => {
        this.setState({
            isCloseSecondNav: !this.state.isCloseSecondNav
        });
    };
    headerMouseOver = () => {
        let {pathname} = this.props.router;
        if (pathname === '/trendTheme' || pathname === '/articleContent') {
            return;
        }
        this.refs.headBottomRef.classList.add('active');
        this.setState({
            isCloseSecondNav: true
        });
    };
    headerMouseLeave = () => {
        let {pathname} = this.props.router;
        this.setState({
            isCloseSecondNav: pathname === '/dig-products' || pathname === '/searchPage' ? false : this.state.isCloseSecondNav,
            isSearchDrawer: false,
            hoverCat1: -1,
            hoverCat2: -1,
        })
    };

    componentWillUnmount() {
        clearTimeout(this.timer);
    }

    render() {
        const {breadCrumb, isLoginFlag, isRegisterFlag, headInfo, userInfo, router, cmi_cat} = this.props;
        const {collectCount = 0, rate} = headInfo;
        const {headImgurl = '', nickName} = userInfo;
        const {loginFlag, registerFlag, findPwdFlag, weChatFlag, weChatSuccessFlag, closeDropdown, weChatData, cat1Data, cat2Data = [], cat3Data = [], retryFlag, defaultValue, isSearchDrawer, isCloseSecondNav, hoverCat1, hoverCat2} = this.state;
        const [item1, item2, item3] = breadCrumb;
        let breadNum = item3.id ? 3 : item2.id ? 2 : item1.id ? 1 : 0;
        const style = {
            modal: {
                top: 0, margin: 0,
                padding: '78px 60px 75px',
                fontSize: 18
            },
            displayNone: {display: 'none'}
        };
        let isTrendArticle = router.pathname === '/trendTheme' || router.pathname === '/articleContent';
        return (
            <header className="listHead" onMouseLeave={this.headerMouseLeave}>
                <section className="headerTop">
                    <div className="">
                        <Link prefetch href="/">
                            <a>
                                {/*<img className="logoImg" src="../../static/logoblack.png" alt="logo图片"/>*/}
                                <SvglogoBai className="logoImg"/>
                            </a>
                        </Link>
                    </div>
                    <div className="headerMiddle">
                        <Link prefetch href="/"><a><span
                            className={`${!isTrendArticle ? 'active' : ''} pointer`}
                            onMouseOver={this.headerMouseOver}
                        ><i id="dropDownIconId"
                            className={`iconfont ${isTrendArticle ? 'iconchanpin article' : 'iconxiala-black'}  dropDownIcon ${isCloseSecondNav ? 'active' : ''}`}/>产品精选</span></a></Link>

                        <Link prefetch href="/trendTheme"><a><span
                            className={`${isTrendArticle ? 'active' : ''}`}><i
                            className="iconfont iconqushi trendIcon"/>趋势专栏</span></a></Link>
                    </div>
                    <div className="headerRight">
                        <div className="collect pointer" onClick={this._handleCollection}>
                            <i className="iconfont iconxin-black"/><span
                            className="count">收藏 ({collectCount})</span>
                        </div>
                        {
                            nickName ?
                                (<Popover placement="bottom"
                                          trigger="hover"
                                    // visible={true}
                                          content={(
                                              <ul className="popoverUl">
                                                  {/*<li><i className="iconfont iconzuji1 icon"/> 我的足迹</li>*/}
                                                  <Link prefetch href="/bgPage">
                                                      <a>
                                                          <li>我的后台</li>
                                                      </a>
                                                  </Link>
                                                  <li onClick={this._handleSureLogout}>退出登录</li>
                                              </ul>
                                          )}
                                >
                                    <Avatar className="photo" icon="user"
                                            src={headImgurl || '../../static/avatar.png'}/>
                                </Popover>) :
                                <Fragment>
                                    <div className="login pointer" onClick={this._handleShowLogin}>登录</div>
                                    <div className="register pointer" onClick={this._handleShowRegister}>注册</div>
                                </Fragment>
                        }
                    </div>
                </section>
                {/*白色二级导航*/}
                {/*active*/}
                <section ref='headBottomRef' id="headBottomId"
                         className={`headBottom ${isCloseSecondNav ? 'active' : ''}`}>
                    <div className="headerBottom"
                        // onMouseLeave={this._handleMouseLeave}
                    >
                        {/*一级分类*/}
                        <ul className="catLeftWrap">
                            {/*<li className={`catItem topRanking ${router.pathname === '/' ? 'active' : ''}`}*/}
                            {/*onMouseOver={this.topRankingMouseOver}*/}
                            {/*><Link prefetch*/}
                            {/*href="/"*/}
                            {/*scroll={false}>*/}
                            {/*<a><span>精选热门排行</span> </a>*/}
                            {/*</Link>*/}
                            {/*<div className="dropDownNavTop">*/}
                            {/*<div className="innerTop">*/}
                            {/*<ul className="leftUl">*/}
                            {/*<li className="leftLi">时尚服饰热评排行TOP100</li>*/}
                            {/*<li className="leftLi">包包鞋子热评排行TOP100</li>*/}
                            {/*<li className="leftLi">珠宝配饰热评排行TOP100</li>*/}
                            {/*<li className="leftLi">家居生活热评排行TOP100</li>*/}
                            {/*</ul>*/}
                            {/*<ul className="rightUl">*/}
                            {/*{*/}
                            {/*[1, 2, 3, 4, 5].map((item, index) => {*/}
                            {/*return (<li className="rightli" key={index}*/}
                            {/*style={{backgroundImage: `url('../../static/aboutMe/chanpinkaifa.png')`}}/>)*/}
                            {/*})*/}
                            {/*}*/}
                            {/*</ul>*/}
                            {/*</div>*/}
                            {/*</div>*/}
                            {/*</li>*/}
                            {/*<li className={`catItem  ${router.pathname === '/' ? 'active' : ''}`}>*/}
                            {/*<a><span>品牌站</span></a></li>*/}
                            {
                                cat1Data.map((item, index) => {
                                    return (
                                        index < 7 &&
                                        <li
                                            onMouseOver={this._handleMouseOver.bind(this, item.list, index)}
                                            onClick={this._handleCat1.bind(this, index, item)}
                                            className='catItem'
                                            key={item.cat1_id}>
                                            <Link href={{
                                                pathname: `/dig-products`,
                                                query: {
                                                    catName: catNameData[index].name,
                                                    cat_id: item.cat1_id
                                                }
                                            }} as={`/dig-products/${catNameData[index].name}`}>
                                                <a className={` ${hoverCat1 === index ? 'hover' : ''} ${(item.cat1_id === breadCrumb[0].id) ? 'active' : ''}`}>
                                                    <span> {item.cat1_name_cn}</span>
                                                </a>
                                            </Link>
                                        </li>
                                    )
                                })
                            }
                        </ul>
                        {/*搜索框*/}
                        <div className="listSearch">
                            <i onClick={this.showSearchDrawer}
                               className="iconfont iconsetch searchIcon"
                            />
                            <div className="currencyWrap">
                                <Popover placement="bottom"
                                         trigger="hover"
                                    // visible={true}
                                         content={(
                                             <div onClick={this._handleCurrency}
                                                  className="currencyItem">{rate === 'CNY' ? '($)美元' : '(CNY)人民币'}</div>
                                         )}
                                >
                                    <a className="ant-dropdown-link active" href="#">
                                        {rate === 'CNY' ? '(CNY)人民币' : '($)美元'}<Icon type="down"/>
                                    </a>
                                </Popover>
                            </div>
                            <i className="iconfont iconht-cha deleteIcon" onClick={this.closeSecondLevelNav}/>
                        </div>
                        {/*栏目分类*/}
                        <div className={`dropDownNav ${closeDropdown ? 'active' : ''}`}>
                            <div className="innerBox"
                                 onMouseLeave={this._handleMouseLeave}
                            >
                                {/*二级分类*/}
                                <ul className="cat2">
                                    {
                                        cat2Data.map((item, index) => {
                                            return (
                                                <li
                                                    onMouseOver={this._handleMouseOverCat2.bind(this, item.list, index)}
                                                    // ${(item.cat2_id === breadCrumb[1].id) ? 'active' : ''}
                                                    className={`cat2Item ${hoverCat2 === index ? 'hover' : ''}`}
                                                    onClick={this._handleCat2.bind(this, item.cat2_id)}
                                                    key={item.cat2_id}>{item.cat2_name_cn}</li>)
                                        })
                                    }
                                </ul>
                                {/*三级分类*/}
                                <ul className="cat3">
                                    {
                                        cat3Data.length > 0 && cat3Data.map((item, index) => {
                                            return (
                                                <li className={`cat3Item ${item.cat3_id === breadCrumb[2].id ? 'active' : ''}`}
                                                    onClick={this._handleCat3.bind(this, item.cat3_id)}
                                                    key={item.cat3_id}>{item.cat3_name_cn}</li>)
                                        })
                                    }
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>
                {/*搜索框*/}
                <section className={`searchDrawer ${isSearchDrawer ? 'open' : ''}`}>
                    <div className="content">
                        <div className="search">
                            <i className="iconfont iconsetch searchIcon" onClick={this.handleKeywordSearch}/>
                            <div className="searchBox">
                                <Select value={defaultValue} style={{width: 'auto'}} onChange={this.handleChange}
                                        dropdownMatchSelectWidth={false}>
                                    <Option value={0}>全部</Option>
                                    {
                                        breadNum >= 1 ?
                                            <Option value={breadCrumb[0].id}>{breadCrumb[0].name}</Option> : null
                                    }
                                    {
                                        breadNum > 0 ? cmi_cat[breadCrumb[0].index].list.map((item, index) => {
                                            return (
                                                <Option key={index} value={item.cat2_id}>{item.cat2_name_cn}</Option>)
                                        }) : catData.map((item, index) => {
                                            return (<Option key={index} value={item.data}>{item.name}</Option>)
                                        })
                                    }
                                </Select>
                                <Input placeholder="请输入关键词" onChange={this.handleKeywordChange}
                                       onPressEnter={this.handlePressEnter}/>
                            </div>

                            <i className="iconfont iconht-cha deleteIcon" onClick={this.showSearchDrawer}/>
                        </div>
                        <div className="hotSearch">
                            <h4>热门搜索</h4>
                            <ul className="hotSearchUl">
                                {
                                    labelMark.map((item, index) => {
                                        return (
                                            <li className="hotSearchLi" key={index}
                                                onClick={this.handleHotSearch.bind(this, item)}>{item}</li>
                                        )
                                    })
                                }
                            </ul>
                        </div>
                    </div>
                </section>
                {
                    // isLoginFlag 是否登录 true打开  false 关闭
                    (loginFlag || isLoginFlag) &&
                    <LoginModal flag={loginFlag || isLoginFlag} onCancelPopup={this.cancelPopup}
                                onShowRegister={this.onShowRegister}
                                onFindPwd={this.onShowFindWpd} onShowWeChat={this.onShowWeChat}/>
                }
                {
                    (registerFlag || isRegisterFlag) &&
                    <RegisterCpn flag={registerFlag || isRegisterFlag} onCancelPopup={this.cancelPopup}
                                 onShowLogin={this.onShowLogin}
                                 onShowWeChat={this.onShowWeChat}/>
                }
                {
                    findPwdFlag &&
                    <FindPwdCPn flag={findPwdFlag} onCancelPopup={this.cancelPopup} onShowLogin={this.onShowLogin}/>
                }
                {
                    weChatSuccessFlag && <Modal className="modalBox" visible centered footer={null} width={660}
                                                bodyStyle={style.modal} maskClosable={false}
                                                iconType='error' onCancel={this.cancelPopup}>
                        <WeChatLogin weChatData={weChatData} onShowLogin={this.onShowLogin}
                                     onshowRegister={this.onShowRegister}
                                     onCancelPopup={this.cancelPopup}
                                     onShowWeChat={this.onShowWeChat}/>
                    </Modal>
                }
                {
                    weChatFlag && <Modal className="modalBox" visible centered footer={null} width={420}
                                         bodyStyle={style.modal} maskClosable={false}
                                         iconType='error' onCancel={this.cancelPopup}>

                        <div className="weChat">
                            {retryFlag ? <Fragment>
                                <h3 className="subheading">注册登录ffdig平台</h3>
                                <Button type="primary" onClick={this._handleRetryWeChatLogin}>重试</Button>
                            </Fragment> : <div id="login_container"/>
                            }
                            <div className="wxBtnGroup">
                                <div className="btn" onClick={this.onShowLogin}>账号登录</div>
                                <div className="dividingLine"/>
                                <div className="btn" onClick={this.onShowRegister}>账号注册</div>
                            </div>
                        </div>

                    </Modal>
                }
            </header>
        )
    }
}

const getUserInfo = ({account, headerReducer, listPageReducer}) => {
    return {
        userInfo: account.userInfo,
        headInfo: headerReducer,
        cmi_cat: listPageReducer.cmi_cat,
        breadCrumb: headerReducer.breadCrumb,
        isLoginFlag: headerReducer.isLoginFlag,
        isRegisterFlag: headerReducer.isRegisterFlag,
        globalSearch: listPageReducer.globalSearch,
        selectStyle: listPageReducer.selectStyle,
        selectColor: listPageReducer.selectColor,
        selectTexture: listPageReducer.selectTexture,
    }
};
export default connect(getUserInfo)(withRouter(Header));