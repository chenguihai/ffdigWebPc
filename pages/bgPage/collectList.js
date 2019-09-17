import React, {Component, Fragment} from 'react'
import {Popover, Tooltip} from "antd";
import {connect} from 'react-redux';
import BgQuickView from "./bgQuickView";
import EditLabelCpn from "../../components/EditLabelCpn";
import {withRouter} from "next/router";
import Link from "next/link";
import moment from "moment";
import EditSVg from "../../static/edit.svg";

class collectList extends Component {
    state = {
        quickViewFlag: false,
        editLabelFlag: false,
        productItem: "",
        isShowFlag: false
    };

    _handleShowQuickView = (e, item) => {
        e.stopPropagation();
        this.setState({
            quickViewFlag: true,
            productItem: item
        })
    };

    handleCollectVisible = (visible) => {
        this.setState({
            editLabelFlag: visible,
            isShowFlag: visible
        });
    };
    cancelPopup = () => {
        let editLabel = document.querySelector('.editLabel .active');
        editLabel && (editLabel.className = 'editLabel');
        this.setState({
            quickViewFlag: false,
            editLabelFlag: false,
            isShowFlag: false
        })
    };
    stopPropagationFun = (e) => {
        e.stopPropagation();
    };

    render() {
        const {dataList, itemIndex, currencyType, selectFlag} = this.props;
        const {quickViewFlag, productItem, editLabelFlag, isShowFlag} = this.state;
        let icon = JSON.parse(dataList.img),
            imgSrc = (icon[0].scaled_paths && icon[0].scaled_paths._350.path) || icon[0].url;
        return (<Fragment>
                {/*<Link prefetch scroll={false} href={{pathname: '/detailPage', query: {product: dataList.productId}}}>*/}
                {/*<a>*/}
                <div id="listImgWrapId" className="pr listImgWrap">
                    {
                        !selectFlag && <Link prefetch
                                             href={{pathname: '/detailPage', query: {product: dataList.productId}}}>
                            <a target="_blank"><span className="markImg"/></a>
                        </Link>
                    }
                    <div ref="imgBoxRefs" className="listImgBox">
                        <img className="img" src={imgSrc} alt="列表图片"/>
                        {/*快速预览*/}
                        {
                            !selectFlag && <Fragment>
                                {/*价格*/}
                                <div className="absBox">
                                    {
                                        dataList.listPriceUsd ? <div className="priceBox">
                                <span
                                    className="price">{currencyType === 'USD' ? "$" + Math.round(dataList.listPriceUsd * 100) / 100 : "¥" + Math.round(dataList.listPriceCny * 100) / 100}</span>
                                        </div> : null
                                    }
                                    <span className="quickView pointer"
                                          onClick={(e) => this._handleShowQuickView(e, dataList)}><i
                                        className="iconfont iconsetch searchIcon"/>Quick View</span>
                                </div>
                                {/*<span className="markImg"/>*/}
                                {/*爱心*/}
                                {/*{*/}
                                {/*dataList.markLable && <em className="love"*/}
                                {/*style={{backgroundImage: `url('../../../static/list/liebiao-iconyishoucangxin@2x.png')`}}/>*/}
                                {/*}*/}
                                {/*是否已收藏*/}
                                <div className={`editLabel ${isShowFlag ? 'active' : ''}`}>
                                    <Popover placement="bottom"
                                             trigger="click"
                                             visible={editLabelFlag}
                                             onVisibleChange={(e) => this.handleCollectVisible(e)}
                                             content={(
                                                 <EditLabelCpn flag="collectPage"
                                                               data={dataList}
                                                               itemIndex={itemIndex}
                                                               onCancelPopup={this.cancelPopup}/>
                                             )}
                                    >
                                        <div className="collectBox pointer"
                                             onClick={(e) => this.stopPropagationFun(e)}>
                                            {/*已收藏*/}
                                            <EditSVg className="editIcon"/>
                                            <span
                                                className="text ellipsis">{dataList.markLable || dataList.cat}</span>
                                            <em className="iconfont iconxin-black iconLove"/>
                                        </div>
                                    </Popover>
                                </div>
                            </Fragment>
                        }
                    </div>
                    <Tooltip placement="top" title={dataList.name}>
                        <div className="name ellipsis active">{dataList.name}</div>
                    </Tooltip>
                    {
                        (dataList.cmtStar > 0 || dataList.cmtCount > 0) && <div className="starWrap">
                            {
                                dataList.cmtStar > 0 && <i className="starIcon"
                                                           style={{background: `url('../../../static/xiangpingYellow.png') no-repeat ${Math.round((dataList.cmtStars - dataList.cmtStar) / (dataList.cmtStars === 10 ? 2 : 1) || 0) * -25}px center`}}/>
                            }
                            {
                                dataList.cmtCount > 0 && <div>
                                    <i className={`iconfont iconchat infoIcon ${dataList.cmtStar > 0 ? 'active' : ''}`}/>
                                    <span className="infoText">{dataList.cmtCount}</span>
                                </div>
                            }
                        </div>
                    }
                    <div className="siteWrap">
                        <span>{dataList.site}</span>
                        <span className="line"/>
                        <span
                            className="update">{moment(new Date(dataList.colUpdateTime).getTime()).format('YYYY.MM.DD')} 更新</span>
                    </div>
                    <div onClick={(e) => this.stopPropagationFun(e)}>
                        {
                            quickViewFlag &&
                            <BgQuickView productItem={productItem} currencyType={currencyType}
                                         onCancelPopup={this.cancelPopup}/>
                        }
                    </div>
                </div>
                {/*</a>*/}
                {/*</Link>*/}

            </Fragment>
        )
    }
}

const getUserInfo = ({listPageReducer, headerReducer}) => {
    return {
        searchData: listPageReducer.searchData,
        currencyType: headerReducer.rate,
    }
};
export default connect(getUserInfo)(withRouter(collectList));