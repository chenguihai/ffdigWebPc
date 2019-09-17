import React, {Component, Fragment} from 'react'
import {axiosCookieHttp} from "../../../utils/ajax";
import {Popover, Tooltip} from "antd";
import moment from "moment";
import Link from "next/link";
import Router, {withRouter} from "next/router";
import {connect} from 'react-redux';

import EditLabelCpn from "../../../components/EditLabelCpn";
import SearchLabelCpn from "../../../components/SearchLabelCpn";
import {getHomePageSearch} from "../../../actions/listPageAction";

import QuickViewCpn from "../../../components/QuickViewCpn";
import {getUserCollectCountAction, isLoginFlagActive} from "../../../actions";
import commonFun from "../../../utils/commonFun";
import EditSVg from '../../../static/edit.svg'

class ProductList extends Component {
    state = {
        editLabelFlag: false,
        searchFlag: false,
        quickViewFlag: false,
        productId: "",
        isCollect: false,
        isShowCollectBox: false, //是否
    };

    componentDidMount() {
        // this.props.router.prefetch('/detailPage');
        Router.events.on('routeChangeComplete', url => {
            this.cancelPopup();
        });
    }

    _handleShowQuickView = (e, id, isCollect) => {
        e.stopPropagation();
        this.setState({
            quickViewFlag: true,
            productId: id,
            isCollect
        })
    };

    cancelPopup = () => {
        let editLabel = document.querySelector('.editLabel .active');
        editLabel && (editLabel.className = 'editLabel');
        this.setState({
            searchFlag: false,
            editLabelFlag: false,
            quickViewFlag: false,
            isShowCollectBox: false,
        })
    };
    cancelQuickViewPopup = () => {
        this.setState({
            quickViewFlag: false
        });
    };
    _handleNewCollection = (e, item) => {
        e.stopPropagation();
        let nickName = window.sessionStorage.getItem('nickName') || '';
        if (nickName) {
            this.insertOrUpdateProductCollect(item);
        } else {
            this.props.dispatch(isLoginFlagActive(true));
        }
    };
    insertOrUpdateProductCollect = (item = {}) => { //新增或更新商品收藏
        let label = (item.cmiCatBottom && item.cmiCatBottom.cat_name_cn) || '';
        let params = {
            "spuId": item.spu_id || '',
            "currency": item.currency || '',
            "att": '',
            "skus": '',
            "productId": item.object_id || '',
            "listPrice": item.list_price - 0 || 0,
            "name": item.title_cn || '',
            "countSku": 0,
            "img": '',
            "markLable": label,
            "saleCount": item.saleCount || 0,
            "canBookCount": item.canBookCount || 0,
            "cmtStar": item.cmtStar ? item.cmtStar + '' : '0',
            "cmtStars": isNaN(item.cmtStars) ? 0 : item.cmtStars || 0,
            "cmtCount": item.cmtCount || 0,
            "ondateOnline": moment(item.ondateOnline ? item.ondateOnline * 1000 : new Date()).format('YYYY-MM-DD h:mm:ss'),
            "updateTime": moment(item.update_time ? item.update_time * 1000 : new Date()).format('YYYY-MM-DD h:mm:ss'),
            "site": item.site || '',
            "cat": label,
            "width": item._350.width || 350,
            "height": item._350.height || 418
        };
        axiosCookieHttp("api/WebSite/ProductCollect/InsertOrUpdateProductCollect", params).then((res) => {
            if (res.code === 200) {
                const {data, count, currentPage} = this.props.searchData;
                let searchData = JSON.parse(JSON.stringify(data));
                for (let i = 0; i < searchData.length; i++) {
                    if (searchData[i].object_id === item.object_id) {
                        searchData[i].isCollect = true;
                        searchData[i].lable = label;
                        break;
                    }
                }
                this.props.dispatch(getUserCollectCountAction());
                this.props.dispatch(getHomePageSearch({
                    data: searchData,
                    count,
                    currentPage
                }));
                commonFun.getMarkLabelHttp(this);
            }
        }).catch((e) => {
            console.log(e);
        })
    };
    handleCollectVisible = (visible) => {
        this.setState({
            editLabelFlag: visible,
            isShowCollectBox: visible
        });
    };
    handleNoCollectVisible = (visible) => {
        let nickName = window.sessionStorage.getItem('nickName') || '';
        if (nickName) {
            this.setState({
                searchFlag: visible,
                isShowCollectBox: visible
            });
        } else {
            this.props.dispatch(isLoginFlagActive(true));
        }
    };

    stopPropagationFun = (e) => {
        e.stopPropagation();
    };

    render() {
        const {dataList, itemIndex, currencyType} = this.props;
        const {editLabelFlag, searchFlag, quickViewFlag, productId, isCollect, isShowCollectBox} = this.state;
        let title = dataList.lang === 'cn' ? dataList.title_cn : dataList.title_en,
            cat = (dataList.cmiCatBottom && dataList.cmiCatBottom.cat_name_cn) || '';
        let imgPath = dataList._350.location_id === 0 ? dataList.icon_350 : dataList._350.path;
        return (<Fragment>
                {/*<Link prefetch scroll={false} href={{pathname: '/detailPage', query: {product: dataList.object_id}}}>*/}
                <div className="pr pointer listImgWrap">
                    <div ref="imgBoxRefs" className="listImgBox">

                        <img className="img" src={imgPath} alt="列表图片"/>
                        {/*价格*/}
                        <div className="absBox">
                            {
                                dataList.list_price_usd ? <div className="priceBox">
                                <span
                                    className="price">{currencyType === 'USD' ? "$" + Math.round(dataList.list_price_usd * 100) / 100 : "¥" + Math.round(dataList.list_price_cny * 100) / 100}</span>
                                </div> : null
                            }

                            {/*快速预览*/}
                            <span className="quickView pointer"
                                  onClick={(e) => this._handleShowQuickView(e, dataList.object_id, dataList.isCollect)}><i
                                className="iconfont iconsetch searchIcon"
                            />Quick View</span>
                        </div>

                        <Link prefetch
                              href={{pathname: '/detailPage', query: {product: dataList.object_id}}}>
                            <a target="_blank">
                                <span className="markImg"/></a>
                        </Link>
                        {/*爱心*/}
                        {
                            dataList.isCollect && <em className="iconfont iconxin-black love"/>
                        }
                        {/*是否已收藏*/}
                        <div className={`editLabel ${isShowCollectBox ? 'active' : ''}`}>
                            {
                                dataList.isCollect ? <Popover placement="bottom"
                                                              trigger="click"
                                                              visible={editLabelFlag}
                                                              onVisibleChange={(e) => this.handleCollectVisible(e)}
                                                              content={(
                                                                  <EditLabelCpn data={dataList}
                                                                                itemIndex={itemIndex}
                                                                                onCancelPopup={this.cancelPopup}/>
                                                              )}
                                >
                                    <div className="collectBox pointer" onClick={(e) => this.stopPropagationFun(e)}>
                                        {/*已收藏*/}
                                        <EditSVg className="editIcon"/>
                                        {/*<i className="iconfont iconlb-bjbq editIcon"/>*/}
                                        <span className="text ellipsis">{dataList.lable}</span>
                                        <em className="iconfont iconxin-black iconLove"/>
                                    </div>
                                </Popover> : <div className="selectBox">
                                    {/*还没有收藏*/}
                                    <Popover placement="bottom"
                                             trigger="click"
                                        // visible={true}
                                             visible={searchFlag}
                                             onVisibleChange={(e) => this.handleNoCollectVisible(e)}
                                             content={(
                                                 <SearchLabelCpn flag="listPage" data={dataList}
                                                                 itemIndex={itemIndex}
                                                                 onCancelPopup={this.cancelPopup}
                                                 />
                                             )}
                                    >
                                        <div className="content pr ellipsis"
                                             onClick={(e) => this.stopPropagationFun(e)}>{cat}
                                            <i className="downIcon"
                                               style={{backgroundImage: `url('../../../static/list/liebiao-shoucang-xialabianji@2x.png')`}}/>
                                        </div>
                                    </Popover>
                                    <div className="noCollectWrap"
                                         onClick={(e) => this._handleNewCollection(e, dataList)}>
                                        <em className="iconfont iconxiangqing-kong
 noCollect pointer"/>
                                    </div>
                                </div>
                            }

                        </div>
                    </div>
                    <Tooltip placement="top" title={title}>
                        <div className="name ellipsis active">{title}</div>
                    </Tooltip>
                    {
                        (dataList.cmtStar > 0 || dataList.cmtCount > 0) && <div className="starWrap">
                            {
                                dataList.cmtStar > 0 && <i className="starIcon"
                                                           style={{background: `url('../../../static/xiangpingYellow.png') no-repeat ${Math.round((dataList.cmtStars - dataList.cmtStar) / (dataList.cmtStars === 10 ? 2 : 1) || 0) * -25}px center`}}/>
                            }
                            {
                                dataList.cmtCount > 0 && <div className="infoIconWrap">
                                    <i className={`iconfont iconchat infoIcon ${dataList.cmtStar > 0 ? 'active' : ''}`}/>
                                    <span className="infoText"
                                    >{dataList.cmtCount}</span>
                                </div>
                            }
                        </div>
                    }

                    <div className="siteWrap">
                        <span>{dataList.site}</span>
                        <span className="line"/>
                        <span
                            className="update">{moment(dataList.update_time * 1000).format('YYYY.MM.DD')} 更新</span>
                    </div>
                </div>
                {
                    quickViewFlag &&
                    <QuickViewCpn productId={productId} isCollect={isCollect}
                                  onCancelPopup={this.cancelQuickViewPopup}/>
                }
            </Fragment>
        )
    }
}

const getUserInfo = ({account, listPageReducer, headerReducer}) => {
    return {
        nickName: account.userInfo.nickName,
        searchData: listPageReducer.searchData,
        currencyType: headerReducer.rate,
    }
};
export default connect(getUserInfo)(withRouter(ProductList));