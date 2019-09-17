import React, {Component, Fragment} from 'react'
import {withRouter} from 'next/router'
import Head from '../components/head'
import JWPFooter from "../components/Footer";
import {catData, siteData, catNameData, homePageHead} from '../config/labelData'
import {breadCrumbActive} from '../actions'
import {connect} from 'react-redux'
import Header from "../components/Header";
import {axiosHttp} from "../utils/ajax";
import {getClassifyMsgHttp} from "../utils/exportFun";
import {
    getHomePageData,
    getHomePageSearch,
    globalSearchActive,
    getHomePageTypeConfigActive
} from "../actions/listPageAction";
import commonFun from "../utils/commonFun";
import Link from "next/link";

let defaultImg = "url('../static/loading.gif')";

class Home extends Component {
    static async getInitialProps({reduxStore}) {
        let cmi_cat = [], newDate = [[], [], [], []];
        try {
            const resp = await axiosHttp("api/WebSite/Classify/GetClassifyMsg", '', "GET");
            cmi_cat = resp.data
        } catch (e) {
            console.error(e)
        }
        let cmi_catData = getClassifyMsgHttp(cmi_cat);
        await reduxStore.dispatch(getHomePageData(cmi_catData));
        try {
            const homePageRes = await axiosHttp(`api/WebSite/HomePage/GetHomePageData`, '', 'GET');
            if (homePageRes.code === 200) {
                // 栏目关联的前台区域块标记id(1.时尚服饰 2.包包鞋子 3.珠宝配饰 4.家具生活)
                const FASHION_CLOTHING = 1, BAG_SHOES = 2, JEWELRY_ACCESSORIES = 3, FURNITURE_LIFE = 4;
                let item = {};
                for (let i = 0; i < homePageRes.data.length; i++) {
                    item = homePageRes.data[i];
                    if (item.relatedId === FASHION_CLOTHING) {
                        newDate[0].push(item);
                    } else if (item.relatedId === BAG_SHOES) {
                        newDate[1].push(item);
                    } else if (item.relatedId === JEWELRY_ACCESSORIES) {
                        newDate[2].push(item);
                    } else if (item.relatedId === FURNITURE_LIFE) {
                        newDate[3].push(item);
                    }
                }
            }
        } catch (e) {

        }
        await reduxStore.dispatch(getHomePageTypeConfigActive(newDate));
        return {cmi_cat: cmi_catData, homeList: newDate}
    }

    state = {
        homeList: [[], [], [], []]
    };

    componentDidMount() {
        const obj = {id: '', name: '', index: 0};
        this.props.dispatch(breadCrumbActive([obj, obj, obj]));
        window.scroll(0, 0);
    }

//添加事件监听
    infoCommonFragment = (item = {}) => {
        return (
            <Link prefetch href={{
                pathname: '/detailPage',
                query: {product: encodeURIComponent(item._id)}
            }}>
                <a>
                    <div className="productInfo">
                        <p className="infoTitle">{item.name}</p>
                        {
                            item.cmtStar > 0 ? <div className="content">
                                <i className="starIcon"
                                   style={{background: `url('../static/xiangping-xuebitu.png') no-repeat ${Math.round((item.cmtStars - item.cmtStar) / (item.cmtStars === 10 ? 2 : 1) || 0) * -25}px center`}}/>
                                {item.cmtCount ? <Fragment>
                                    <i className="line"/>
                                    <span className="iconfont iconchat infoIcon"/>
                                    <span>{item.cmtCount || 0}</span>
                                </Fragment> : null}
                            </div> : null
                        }
                        <p>{item.site}</p>
                    </div>
                </a>
            </Link>
        )
    };
    _handleCat = (item, index) => {
        const {breadCrumb, dispatch} = this.props;
        let itemBread = {id: '', name: '', index: 0};
        breadCrumb[0] = {id: item.data, name: item.name, index: index};
        breadCrumb[1] = itemBread;
        breadCrumb[2] = itemBread;
        commonFun.setMetaAboutSeoFun(catNameData[index]);
        dispatch(globalSearchActive(''));
        this.clearListPageCommon();
        dispatch(breadCrumbActive(breadCrumb));
        // this.props.router.push({
        //     pathname: '/dig-products',
        //     query: {cat_id: item.data}
        // });
    };

    clearListPageCommon = () => { //去除列表页面的数据
        this.props.dispatch(getHomePageSearch({
            data: [],
            count: 0,
            currentPage: 1
        }));
    };

    render() {
        const {homeList = []} = this.props;
        const MoreWrap = (name, catId) => {
            return (

                <Link prefetch href={{
                    pathname: '/searchPage',
                    query: {cat_id: catId, name}
                }}>
                    <a>
                        <div className="moreWrap">
                            <span className="moreText">更多</span> <i className="iconfont iconindex-more rightIcon"/>
                        </div>
                    </a>
                </Link>
            )
        };
        return (
            <div className="pc homeWrap">
                <Head title="火联-网罗全球优品-洞察产品趋势"/>
                <Header/>
                <header id="homePageId" className="header"
                        style={{backgroundImage: 'url("../../static/home/banner.jpg")'}}>
                    <div className="navTitle">
                        <h2 className="headTitle">网罗全球优品 洞察产品市场趋势</h2>
                        <h3 className="headSubTitle">当季新品、热评产品、知名流量大站</h3>
                    </div>
                    <ul className="hotReview">
                        {
                            homePageHead.map((item, index) => {
                                return (<li key={index} className="hotReviewLi"
                                            style={{backgroundImage: `url('../../static/home/${index+1}.jpg')`}}>
                                    <Link prefetch href={{
                                        pathname: '/searchPage',
                                        query: {cat_id: item.catId, name: item.name}
                                    }}>
                                        <a>
                                            <div className="content">
                                                <h4 className="nameH4">{item.name}</h4>
                                                <h3 className="titleH3">热评排行TOP100</h3>
                                            </div>
                                        </a>
                                    </Link>
                                </li>)
                            })
                        }
                    </ul>
                </header>
                {/*<JWPHeader/>*/}

                {/*分类
                <ul className="catWrap">
                    <li className="catItem"><span className="text active">首页</span></li>
                    {
                        catData.map((item, index) => {
                            return (
                                <li className="catItem pointer" key={index}
                                    onClick={this._handleCat.bind(this, item, index)}>
                                    <Link prefetch
                                          href={{
                                              pathname: '/dig-products',
                                              query: {
                                                  catName: catNameData[index].name,
                                                  cat_id: item.data
                                              }
                                          }}
                                        // cat_id: item.data, rate: 'CNY'
                                          as={`/dig-products/${catNameData[index].name}`}
                                    >
                                        <a>
                                            <img className="img"
                                                 src={item.icon}
                                                 alt="图片"/>
                                            <span className="catName active"/>
                                            <span className="text">{item.name}</span>
                                        </a>
                                    </Link>
                                </li>
                            )
                        })
                    }
                </ul>
                */}
                {
                    homeList.length > 0 ? <Fragment>
                        {/*时尚服饰*/}
                        {
                            homeList[0].map((item, index) => {
                                return (
                                    <section key={index} className="floorOne">
                                        <div className="titleBox">
                                            <Link prefetch href={{
                                                pathname: '/searchPage',
                                                query: {cat_id: '10000019,10000018', name: item.title}
                                            }}>
                                                <a className="titleLink">
                                                    <div className="subTitle">{item.title}</div>
                                                    <h2 className="title">
                                                        FASHION<br/>
                                                        CLOTHING TOP100</h2>
                                                </a>
                                            </Link>
                                        </div>
                                        <div className="floorOneWrap clearfix">
                                            {
                                                item.homePagePdtMsg.map((item, index) => {
                                                    if (index > 3) {
                                                        return null
                                                    }
                                                    let {scaled_paths = {}, url} = item.images;
                                                    let {_350 = {}} = scaled_paths;
                                                    return (
                                                        <div className="left" key={item._id}
                                                        >
                                                            <div className="leftImgBox  pr pointer lazyLoadBg"
                                                                 data-src={_350.img || url}
                                                                 style={{backgroundImage: defaultImg}}
                                                            >
                                                                {/*hover状态*/}
                                                                {
                                                                    this.infoCommonFragment(item)
                                                                }
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            }
                                            <div className="right">
                                                <div className="rightImgWrap clearfix">
                                                    <div className="imgBox pr pointer lazyLoadBg"
                                                         data-src={item.homePagePdtMsg[4].images.scaled_paths._350.path}
                                                         style={{backgroundImage: defaultImg}}>
                                                        {
                                                            this.infoCommonFragment(item.homePagePdtMsg[4])
                                                        }
                                                    </div>
                                                    <div className="oneMoreBox pointer">
                                                        {MoreWrap(item.title, '10000019,10000018')}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <i className="floorOneBgImg lazyLoadBg"
                                           data-src="../../static/home/index-zhaungshi1@2x.png"
                                           style={{backgroundImage: defaultImg}}/>
                                    </section>
                                )
                            })
                        }
                        {/*包包鞋子*/}
                        {
                            homeList[1].map((item, index) => {
                                return (
                                    <section key={index} className="floorTwo pr clearfix">
                                        {/*框1/2*/}
                                        <div className="floorTwoLeft"/>
                                        <div className="floorTwoMiddle"/>
                                        <div className="floorTwoRight">
                                            {/*上部*/}
                                            <div className="itemOne clearfix">
                                                <div className="itemOneLeft">
                                                    <Link prefetch href={{
                                                        pathname: '/searchPage',
                                                        query: {cat_id: '10000001', name: item.title}
                                                    }}>
                                                        <a className="titleLink">
                                                            <div className="subTitle">{item.title}</div>
                                                            <h2 className="title">BABY<br/>SHOES TOP100</h2>
                                                        </a>
                                                    </Link>
                                                </div>
                                                <div className="itemOneRight pr pointer lazyLoadBg"
                                                     data-src={item.homePagePdtMsg[0].images.scaled_paths._350.path}
                                                     style={{backgroundImage: defaultImg}}>
                                                    {
                                                        this.infoCommonFragment(item.homePagePdtMsg[0])
                                                    }
                                                </div>
                                            </div>
                                            {/*下部*/}
                                            <div className="itemTwo clearfix">
                                                <div className="oneBox pr pointer lazyLoadBg"
                                                     data-src={item.homePagePdtMsg[1].images.scaled_paths._350.path}
                                                     style={{backgroundImage: defaultImg}}>
                                                    {
                                                        this.infoCommonFragment(item.homePagePdtMsg[1])
                                                    }
                                                </div>
                                                <div className="twoBox">
                                                    <div className="twoTop pr pointer lazyLoadBg"
                                                         data-src={item.homePagePdtMsg[2].images.scaled_paths._350.path}
                                                         style={{backgroundImage: defaultImg}}>
                                                        {
                                                            this.infoCommonFragment(item.homePagePdtMsg[2])
                                                        }
                                                    </div>
                                                    <div className="twoBottom pr pointer lazyLoadBg"
                                                         data-src={item.homePagePdtMsg[3].images.scaled_paths._350.path}
                                                         style={{backgroundImage: defaultImg}}>
                                                        {
                                                            this.infoCommonFragment(item.homePagePdtMsg[3])
                                                        }
                                                    </div>
                                                </div>
                                                <div className="treeBox pr pointer lazyLoadBg"
                                                     data-src={item.homePagePdtMsg[4].images.scaled_paths._350.path}
                                                     style={{backgroundImage: defaultImg}}>
                                                    {
                                                        this.infoCommonFragment(item.homePagePdtMsg[4])
                                                    }
                                                </div>
                                                <div className="fourBox pointer">
                                                    {MoreWrap(item.title, '10000001')}
                                                </div>
                                            </div>
                                        </div>
                                        <i className="floorTwoBgImg lazyLoadBg"
                                           data-src="../../static/home/index-zhaungshitwo@2x.png"
                                           style={{backgroundImage: defaultImg}}/>
                                    </section>
                                )
                            })
                        }

                        {/*珠宝首饰*/}
                        {
                            homeList[2].map((item, index) => {
                                return (
                                    <section key={index} className="floorThree clearfix">
                                        {/*left*/}
                                        <div className="floorThreeLeft">
                                            {/*上*/}
                                            <div className="threeTop clearfix">
                                                {
                                                    item.homePagePdtMsg.map((item, index) => {
                                                        if (index > 2) {
                                                            return null;
                                                        }
                                                        let {scaled_paths = {}, url} = item.images;
                                                        let {_350 = {}} = scaled_paths;
                                                        return (<div key={item._id}
                                                                     data-src={_350.path || url}
                                                                     style={{backgroundImage: defaultImg}}
                                                                     className="threeTopItem pr pointer lazyLoadBg">
                                                            {
                                                                this.infoCommonFragment(item)
                                                            }
                                                        </div>)
                                                    })
                                                }
                                            </div>
                                            {/*下*/}
                                            <div className="threeBottom">
                                                <div className="threeBottomLeft pointer pr lazyLoadBg"
                                                     data-src={item.homePagePdtMsg[3].images.scaled_paths._350.path}
                                                     style={{backgroundImage: defaultImg}}>
                                                    {
                                                        this.infoCommonFragment(item.homePagePdtMsg[3])
                                                    }
                                                </div>
                                                <div className="threeBottomMiddle">
                                                    <div className="bottomRightTop pointer pr lazyLoadBg"
                                                         data-src={item.homePagePdtMsg[4].images.scaled_paths._350.path}
                                                         style={{backgroundImage: defaultImg}}>
                                                        {
                                                            this.infoCommonFragment(item.homePagePdtMsg[4])
                                                        }
                                                    </div>
                                                    <div className="bottomRightBottom"/>
                                                </div>
                                                <div className="threeBottomRight pointer pr">
                                                    {MoreWrap(item.title, '10000025')}
                                                </div>
                                            </div>

                                        </div>
                                        <div className="floorThreeRight">
                                            <div className="itemOneLeft">
                                                <Link prefetch href={{
                                                    pathname: '/searchPage',
                                                    query: {cat_id: '10000025', name: item.title}
                                                }}>
                                                    <a className="titleLink">
                                                        <div className="subTitle">{item.title}</div>
                                                        <h2 className="title">JEWELRY<br/>ACCESSORIES</h2>
                                                    </a>
                                                </Link>
                                            </div>
                                        </div>
                                        <i className="floorThreeBgImg lazyLoadBg"
                                           data-src="../../static/home/index-zara@2x.png"
                                           style={{backgroundImage: defaultImg}}/>
                                    </section>
                                )
                            })
                        }

                        {/*家居生活*/}
                        {
                            homeList[3].map((item, index) => {
                                return (
                                    <section key={index} className="floorFour clearfix">
                                        <div className="floorFourText pr">
                                            <Link prefetch href={{
                                                pathname: '/searchPage',
                                                query: {cat_id: '10000010', name: item.title}
                                            }}>
                                                <a className="titleLink">
                                                    <div className="subTitle">{item.title}</div>
                                                    <h2 className="title">HOME<br/>LIFE TOP100</h2>
                                                </a>
                                            </Link>
                                        </div>
                                        <div className="fourWrap">
                                            <div className="fourTop clearfix">
                                                {
                                                    item.homePagePdtMsg.map((item, index) => {
                                                        if (index > 2) {
                                                            return null
                                                        }
                                                        let {scaled_paths = {}, url} = item.images;
                                                        let {_350 = {}} = scaled_paths;
                                                        return (<div key={item._id}
                                                                     data-src={_350.path || url}
                                                                     style={{backgroundImage: defaultImg}}
                                                                     className="fourTopItem pr pointer lazyLoadBg">
                                                            {
                                                                this.infoCommonFragment(item)
                                                            }
                                                        </div>)
                                                    })
                                                }
                                                <div className="more pointer">
                                                    {MoreWrap(item.title, '10000010')}
                                                </div>
                                            </div>
                                            <div className="fourBottom clearfix">
                                                <div style={{backgroundImage: defaultImg}}
                                                     data-src={item.homePagePdtMsg[3].images.scaled_paths._350.path}
                                                     className="fourBottomLeft pr pointer lazyLoadBg">
                                                    {
                                                        this.infoCommonFragment(item.homePagePdtMsg[3])
                                                    }
                                                </div>
                                                <div style={{backgroundImage: defaultImg}}
                                                     data-src={item.homePagePdtMsg[4].images.scaled_paths._350.path}
                                                     className="fourBottomMiddle pr pointer lazyLoadBg">
                                                    {
                                                        this.infoCommonFragment(item.homePagePdtMsg[4])
                                                    }
                                                </div>
                                                <div className="fourBottomRight">
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                )
                            })
                        }
                    </Fragment> : null
                }

                {/*人气品牌*/}
                <h5 className="brandTitle">人气品牌</h5>
                <p className="brandDes">popular brand</p>
                <ul className="brandWrap clearfix">
                    {
                        siteData.map((item, index) => {
                            return (
                                <Link key={index} prefetch href={{
                                    pathname: '/searchPage',
                                    query: {site: item.name}
                                }}>
                                    <a>
                                        <li className="brandItem pointer">
                                            <img alt="品牌logo"
                                                 data-src={item.icon}
                                                 src="../static/placeholder.jpg"
                                                 className="brandSite lazyLoad"/>
                                        </li>
                                    </a>
                                </Link>
                            )
                        })
                    }
                </ul>
                <JWPFooter/>
            </div>
        )
    }
}

const mapStateToProps = ({account, headerReducer, listPageReducer}) => {
    return {
        userInfo: account.userInfo,
        headInfo: headerReducer,
        homeList: listPageReducer.homeList,
        breadCrumb: headerReducer.breadCrumb,
    }
};
export default connect(mapStateToProps)(withRouter(Home));
