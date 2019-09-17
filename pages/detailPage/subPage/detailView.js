import React, {Component, Fragment} from 'react'
import {Col, Row, Drawer} from "antd";
import Link from "next/link";
import SearchLabelCpn from "../../../components/SearchLabelCpn";
import EditLabelCpn from "../../../components/EditLabelCpn";
import NewLabelCpn from "../../../components/NewLabelCpn";
import {connect} from "react-redux";
import moment from "moment";
import commonFun from "../../../utils/commonFun";
import {isLoginFlagActive} from "../../../actions";

const SHOW_NUM = 4;

class DetailView extends Component {
    state = {
        value: 1,
        pageIndex: 0,
        clickIndex: 0,
        attList: [],
        skuList: [],
        listPrice: 0,
        plainOptions: '',
        newFlag: false,//新增标签
        productData: {},
        clientWidthFlag: true,
        visible: false
    };
    canRun = true;
    timer = null;//函数节流
    detailImg = null;
    count = 0;
    scrollTop = 0;
    isClickFlag = false;

    componentDidMount() {
        const {productDetail} = this.props;
        let {product = {}, ...props} = productDetail, att = product.att || [], value = [];
        for (let i = 0; i < att.length; i++) {
            value = att[i].value;
            for (let j = 0; j < value.length; j++) {
                value[j].selectFlag = j === 0
            }
        }
        this.setState({
            catObj: props,
            productData: product,
            attList: product.att,
            skuList: product.skus,
            listPrice: product.skus && product.skus.length && product.skus[0].order_last.list_price
        });
        this.detailImg = document.getElementsByClassName("detailImg");
        // this.getNickNameFun();
        window.addEventListener('scroll', this.handleScroll);
    }

    getNickNameFun = () => {
        this.setState({
            clientWidthFlag: document.body.clientWidth > 768
        });
    };
    //函数节流
    handleScroll = () => {
        if (!this.canRun || this.detailImg.length === 0 || this.isClickFlag === true) {
            return;
        }
        const {leftId, rightId} = this.refs;
        if (!leftId || !rightId) {
            return;
        }
        this.canRun = false;
        this.timer = setTimeout(() => {
            var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
            var scrollHeight = document.body.scrollHeight || document.documentElement.scrollHeight;
            var clientHeight = rightId.clientHeight + 200;
            var height = scrollHeight - scrollTop - clientHeight;
            let detailFormId = document.getElementById('detailFormId');

            // if (this.state.clientWidthFlag) {
            // console.log(1462, scrollTop, height, scrollHeight, clientHeight);
            if (scrollTop < 120 || height > 1000) {
                // console.log(120, scrollTop, height);
                if (leftId.getAttribute('class').indexOf('fixed') === -1) {
                    leftId.className = "leftBox detailLeft fixed";
                    rightId.className = "right detailLeft fixed";
                    detailFormId.className = "detailForm fixed";
                }
            } else if (height <= 1000) { //1462
                if (leftId.getAttribute('class').indexOf('position') === -1) {
                    leftId.className = "leftBox  detailLeft position";
                    rightId.className = "right detailLeft position";
                    detailFormId.className = "detailForm";
                }
            }
            // } else {
            //     if (scrollTop <= 100) {
            //         if (leftId.getAttribute('class') !== "leftBox") {
            //             leftId.className = "leftBox detailLeft";
            //             // rightId.className = "right detailLeft";
            //         }
            //     } else if (height > 1120) {
            //         if (leftId.getAttribute('class').indexOf('fixed') === -1) {
            //             leftId.className = "leftBox detailLeft fixed";
            //             // rightId.className = "right detailLeft fixed";
            //         }
            //     } else if (height <= 1120) {
            //         if (leftId.getAttribute('class').indexOf('position') === -1) {
            //             leftId.className = "leftBox  detailLeft position";
            //             // rightId.className = "right detailLeft position";
            //         }
            //     }
            // }


            if (height > 1120) {
                if (this.count < this.detailImg.length) {
                    let middleHeight = this.detailImg[0].clientHeight;
                    if (this.count > 0) {
                        middleHeight = 0;
                        for (let i = 0; i < this.count; i++) {
                            middleHeight += this.detailImg[i].clientHeight
                        }
                    }
                    if (this.scrollTop < scrollTop) { //向下
                        if (scrollTop >= middleHeight) {
                            if (this.count < this.detailImg.length) {
                                this.setState({
                                    clickIndex: this.count,
                                    pageIndex: Math.floor(this.count / SHOW_NUM)
                                });
                                if (this.count + 1 < this.detailImg.length) {
                                    this.count += 1;
                                }
                            }
                        }
                    } else {//向上
                        if (scrollTop < middleHeight - 480) {
                            if (this.count > 0) {
                                this.count -= 1;
                                this.setState({
                                    clickIndex: this.count,
                                    pageIndex: Math.floor(this.count / SHOW_NUM)
                                });
                            }
                        }
                    }
                    this.scrollTop = scrollTop;
                }
            }
            this.canRun = true;
        }, 100);
    };

    _handlePreviousNext = (type) => {
        const {pageIndex, productData} = this.state;
        const {detail} = productData;
        let num = 0, total = Math.ceil(detail.images.length / SHOW_NUM) - 1;
        if (type > 0) {
            num = pageIndex >= total ? total : pageIndex + 1
        } else {
            num = pageIndex === 0 ? 0 : pageIndex - 1
        }
        this.setState({
            pageIndex: num,
        })
    };
    _handleSwitchImg = (index) => {
        const {leftId, rightId} = this.refs;
        const {clientWidthFlag} = this.state;
        if (index > 0) {
            if (leftId.getAttribute('class').indexOf('fixed') === -1) {
                leftId.className = "leftBox detailLeft fixed";
                if (clientWidthFlag) {
                    rightId.className = "right detailLeft fixed";
                }
            }
        } else {
            leftId.className = 'leftBox detailLeft';
            if (clientWidthFlag) {
                rightId.className = 'right detailLeft';
            }
        }

        this.count = index - 1;
        this.isClickFlag = true;
        this.setState({
            clickIndex: index
        }, () => {
            this.timer = setTimeout(() => {
                this.isClickFlag = false;
                clearTimeout(this.timer);
            }, 500);
        })
    };
    scrollTo = (id) => {
        var _id = document.getElementById(id);
        window.scrollTo(0, _id.offsetTop);
    };
    handleShowLove = () => {
        let nickName = window.sessionStorage.getItem("nickName");
        if (nickName) {
            this.setState({
                visible: true
            });
        } else {
            this.props.dispatch(isLoginFlagActive(true));
        }
    };

    cancelPopup = () => {
        this.setState({
            newFlag: false,
            visible: false
        })
    };
    _handleCloseDrawer = () => {
        this.setState({
            visible: false
        })
    };
    _handleShowNewLabel = () => {
        this.setState({
            newFlag: true
        })
    };

    componentWillUnmount() {
        clearTimeout(this.timer);
        window.removeEventListener('scroll', this.handleScroll);
    }

    render() {
        const {currencyType} = this.props;
        const {pageIndex, clickIndex, productData = {}, attList = [], newFlag, visible} = this.state;
        const {detail = {}} = productData;
        const {images = [], desc_att = []} = detail;
        const {product = {}, ...props} = this.props.productDetail;
        return (
            <Fragment>
                <Row className="detailView clearfix">
                    <Col md={2} sm={4}>
                        <div className="leftBox detailLeft" ref="leftId">
                            <div className="left pr">
                                <i className="iconfont iconfanhui previous pointer"
                                   onClick={this._handlePreviousNext.bind(this, -1)}/>
                                <div className="of_hidden pr">
                                    <ul className="leftUl" style={{top: -428 * pageIndex}}>
                                        {
                                            images.map((item, index) => {
                                                return (
                                                    <li key={index}>
                                                        <a href="javascript:;"
                                                           onClick={this.scrollTo.bind(this, 'anchorId' + index)}>
                                                            <img
                                                                onClick={this._handleSwitchImg.bind(this, index)}
                                                                className={`pointer ${clickIndex === index ? "active" : ''}`}
                                                                src={item.scaled_paths._100.path || item.url} alt="图片"/>
                                                        </a>
                                                    </li>
                                                )
                                            })
                                        }
                                    </ul>
                                </div>
                                <i className="iconfont iconfanhui next pointer"
                                   onClick={this._handlePreviousNext.bind(this, 1)}/>
                            </div>
                        </div>
                    </Col>
                    <Col md={13} sm={20}>
                        <div className="middle">
                            {
                                images.map((item, index) => {
                                    let {path} = item.scaled_paths._790 || "";
                                    return (
                                        <img key={index} id={"anchorId" + index} className="detailImg lazyLoad"
                                             data-src={path}
                                             src={index < 2 ? path : "../../../static/loading.gif"}
                                             alt="图片"/>
                                    )
                                })
                            }
                        </div>
                    </Col>
                    <Col md={9} sm={24}>
                        <div className="right pr" ref="rightId">
                            {/*爱心*/}
                            <div className="rightTitleWrap">
                                <h4 className="title">{product.name}</h4>
                                <a className="iconfont icondaochu linkIcon pointer" href={product.detailUrl}
                                   target="_blank"/>
                                <span
                                    className={`iconfont  detailLoveIcon pointer ${product.isCollect ? 'iconxq-shixin active' : 'iconxiangqing-kong'}`}
                                    onClick={this.handleShowLove}/>
                            </div>
                            {
                                product.list_price_usd ?
                                    <div className="rightPrice">
                                        <span
                                            className="price">{currencyType === 'USD' ? "$" + Math.round(product.list_price_usd * 100) / 100 : "¥" + Math.round(product.list_price_cny * 100) / 100}</span>
                                        <span
                                            className="updateTime">{moment(product.updateDateTime * 1000).format('YYYY.MM.DD')}更新</span>
                                        {
                                            product.ondateOnline ? <Fragment>
                                                {
                                                    product.list_price_usd ? <i className="line"/> : null
                                                }
                                                <span
                                                    className="onlineTime">{moment(product.ondateOnline * 1000).format('YYYY.MM.DD')}上架</span>
                                            </Fragment> : null
                                        }

                                    </div> : null
                            }
                            {
                                attList.map((item, index) => {
                                    let name = /Color/i.test(item.name) ? '颜色' : /Size/i.test(item.name) ? '尺寸' : item.name;
                                    return (
                                        item.value.length > 0 && item.value[0].name &&
                                        <div key={index} className={`attBox ${index === 0 ? "mb24" : ''}`}>
                                            <label>{name}</label>
                                            <ul>
                                                {item.value.map((subItem, subIndex) => {
                                                    return (
                                                        <li key={subIndex}>{subItem.name}</li>
                                                    )
                                                })}
                                            </ul>
                                        </div>
                                    )
                                })
                            }
                            {
                                (product.cmtStar > 0 || product.cmtCount > 0) ?
                                    <div className="fromBox"><label>评价</label>
                                        <div className="text starWrap">
                                            {
                                                product.cmtStar > 0 ? <i className="starIcon"
                                                                         style={{background: `url('../../../static/xiangpingYellow.png') no-repeat ${Math.round((product.cmtStars - product.cmtStar) / (product.cmtStars === 10 ? 2 : 1) || 0) * -25}px center`}}/> : null
                                            }
                                            {
                                                product.cmtCount > 0 ? <div className="infoIconWrap">
                                                        <i className={`iconfont iconchat infoIcon ${product.cmtStar > 0 ? 'active' : ''}`}/>
                                                        <span className="infoText">{product.cmtCount}</span></div>
                                                    : null
                                            }
                                        </div>
                                    </div> : null
                            }

                            <div className="fromBox"><label>来源</label>
                                <Link prefetch href={{
                                    pathname: '/searchPage',
                                    query: {site: product.site}
                                }}>
                                    <a>
                                        <span className="text active">{product.site}</span>
                                    </a>
                                </Link>
                            </div>
                            {
                                product.designer ? <div className="fromBox"><label>品牌</label>
                                    <Link prefetch href={{
                                        pathname: '/searchPage',
                                        query: {source_brand: product.designer}
                                    }}>
                                        <a>
                                            <span className="text active">{product.designer}</span>
                                        </a>
                                    </Link>
                                </div> : null
                            }
                            {
                                product.designer_by ? <div className="fromBox"><label>设计师</label>
                                    <Link prefetch href={{
                                        pathname: '/searchPage',
                                        query: {designer: product.designer_by}
                                    }}>
                                        <a>
                                            <span className="text active">{product.designer_by}</span>
                                        </a>
                                    </Link>
                                </div> : null
                            }
                            <div className="shopBox">
                                <h4>产品描述</h4>
                                <div className="text">
                                    {
                                        desc_att.map((item, index) => {
                                            return (
                                                <p key={index}>
                                                    <label>{item.name}：</label>
                                                    <span>{item.value}</span>
                                                </p>

                                            )
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
                <Drawer className="drawerWrap"
                        title=""
                        placement="right"
                        closable={false}
                        width={350}
                        bodyStyle={{padding: 0}}
                        maskClosable={true}
                        destroyOnClose={true}
                    // onClose={this.onClose}
                        visible={visible}
                >
                    <h3 className="drawerTitle">收藏产品</h3>
                    {newFlag ? <NewLabelCpn flag='detailPage' data={this.props.data} onCancelPopup={this.cancelPopup}
                                            onNewLable={this.productCollectAboutList}/> :
                        product.isCollect ?
                            <EditLabelCpn flag='detailPage' data={product} onCancelPopup={this.cancelPopup}/> :
                            <SearchLabelCpn flag='detailPage' data={product} onCancelPopup={this.cancelPopup}
                                            onShowNew={this._handleShowNewLabel}/>
                    }
                    <i className="iconfont iconht-cha drawerDeleteIcon" onClick={this._handleCloseDrawer}
                    />
                </Drawer>
            </Fragment>
        );
    }
}

const getUserInfo = ({detailPage, headerReducer}) => {
    return {
        productDetail: detailPage.productDetail,
        isLoginFlag: headerReducer.isLoginFlag,
        currencyType: headerReducer.rate,
    }
};
export default connect(getUserInfo)(DetailView);