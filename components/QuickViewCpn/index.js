import React, {Component, Fragment} from 'react'
import Link from 'next/link'
import moment from 'moment'
import {Modal, Popover} from "antd";
import {connect} from "react-redux";
import {axiosCookieHttp} from "../../utils/ajax";
import commonFun from "../../utils/commonFun";
import EditLabelCpn from "../EditLabelCpn";
import SearchLabelCpn from "../SearchLabelCpn";
import CarouselCpn from "../../components/CarouselCpn";
import {getUserCollectCountAction, isLoginFlagActive} from "../../actions";
import {getProductDetail} from "../../actions/detailPageAcrion";
import EditSVg from "../../static/edit.svg";

class QuickViewCpn extends Component {
    state = {
        pageIndex: 0, //页数的下标
        clickIndex: 0,//点击的下标
        bigImg: "",
        detailData: {}, //详情的数据
        attList: [],
        skuList: [],
        images: [],
        collectData: [],
        listPrice: 0,
        productId: "",
        searchFlag: false, //搜索标签
        editFlag: false, //编辑标签
        clientWidthFlag: false,
        isShowFlag: false,//
    };

    componentDidMount() {
        let clientWidth = document.body.clientWidth;
        this.setState({
            clientWidthFlag: clientWidth > 768
        });
        this.getProductDetailHttp();
    }

    getProductDetailHttp = () => {  //获取产品详情
        const {productId} = this.props;
        axiosCookieHttp('api/WebSite/Product/GetProductDetail?productId=' + productId, "", "GET").then((res) => {
            if (res.code === 200) {
                const {isCollect} = this.props;
                let {product, ...props} = res.data;
                let attArr = product.att, value = [];
                for (let i = 0; i < attArr.length; i++) {
                    value = attArr[i].value;
                    for (let j = 0; j < value.length; j++) {
                        value[j].selectFlag = j === 0
                    }
                }
                this.props.dispatch(getProductDetail({...props, product}));
                const {skus = [], detail = {}} = product;
                const {images = []} = detail;
                this.setState({
                    detailData: product,
                    attList: attArr,
                    skuList: skus,
                    listPrice: skus.length && (skus[0].order_last.list_price - 0 || 0),
                    images: images,
                    bigImg: images.length && (images[0].scaled_paths._790.path || images[0].url)
                });
                this.checkIsCollectHttp(productId);
            }
        }).catch((e) => {
            console.log(e);
        })
    };

    checkIsCollectHttp = (params) => { //检查商品是否已收藏
        let nickName = window.sessionStorage.getItem('nickName');
        if (!nickName) {
            return;
        }
        axiosCookieHttp('api/WebSite/HomePage/CheckIsCollect', {products: params.toString()}).then((res) => {
            if (res.code === 200) {
                const {productDetail} = this.props;
                const dataObj = res.data;
                let {product, ...props} = productDetail;
                product = {...product, isCollect: dataObj[0].isCollect, lable: dataObj[0].lable};
                this.props.dispatch(getUserCollectCountAction());
                this.props.dispatch(getProductDetail({...props, product}));
            }
        }).catch((e) => {
            console.log(e);
        })
    };
    _handleSelectAtt = (index, subIndex) => {
        const {attList = [], skuList = []} = this.state;
        let colorAtt = "", sizeAtt = "", value = [];
        for (let i = 0; i < attList.length; i++) {
            value = attList[i].value;
            if (i === index) {
                colorAtt = value[subIndex].name;
                for (let j = 0; j < value.length; j++) {
                    value[j].selectFlag = j === subIndex;
                }
            } else {
                for (let j = 0; j < value.length; j++) {
                    if (value[j].selectFlag === true) {
                        sizeAtt = value[j].name;
                    }
                }
            }
        }
        if (colorAtt && sizeAtt) {
            let item = "";
            for (let i = 0; i < skuList.length; i++) {
                item = skuList[i];
                if (item.name.indexOf(colorAtt) >= 0 && item.name.indexOf(sizeAtt) >= 0) {
                    this.setState({
                        listPrice: item.order_last.list_price
                    })
                }
            }
        } else if (colorAtt || sizeAtt) {
            let item = "", attName = colorAtt ? colorAtt : sizeAtt;
            for (let i = 0; i < skuList.length; i++) {
                item = skuList[i];
                if (item.name.indexOf(attName) >= 0) {
                    this.setState({
                        listPrice: item.order_last.list_price
                    })
                }
            }
        }
        this.setState({
            attList
        });
    };
    _handlePreviousNext = (type) => {
        const {pageIndex, images} = this.state;
        let num = 0, total = Math.ceil(images.length / 4) - 1;
        if (type > 0) {
            num = pageIndex >= total ? total : pageIndex + 1
        } else {
            num = pageIndex === 0 ? 0 : pageIndex - 1
        }
        this.setState({
            pageIndex: num,
        })
    };
    _handlePreviousNextImg = (type) => {
        const {images, clickIndex} = this.state;
        let clickItem = clickIndex;
        if (type > 0) {
            clickItem = clickItem + 1 < images.length ? clickItem + 1 : images.length - 1;
        } else {
            clickItem = clickItem - 1 >= 0 ? clickItem - 1 : 0;
        }
        this.setState({
            pageIndex: Math.floor(clickItem / 4),
            clickIndex: clickItem,
            bigImg: images[clickItem].scaled_paths._790.path || images[clickItem].url
        })
    };
    _handleSwitchImg = (index) => {
        const {images} = this.state;
        this.setState({
            clickIndex: index,
            bigImg: images[index].scaled_paths._790.path || images[index].url
        })
    };

    _handleNewCollection = (e, cat = '') => {
        e.stopPropagation();
        let nickName = window.sessionStorage.getItem('nickName') || '';
        if (nickName) {
            this.insertOrUpdateProductCollectHttp(cat);
        } else {
            this.props.dispatch(isLoginFlagActive(true));
        }
    };
    insertOrUpdateProductCollectHttp = (cat = '') => { //新增或更新商品收藏
        // const {detailData} = this.state;
        const {product} = this.props.productDetail;
        let {_350 = {}} = product.detail.images[0].scaled_paths;
        let params = {
            "spuId": product.spu_id || '',
            "currency": product.currency || '',
            "att": JSON.stringify(product.att),
            "skus": JSON.stringify(product.skus),

            "productId": product._id || 0,
            "listPrice": product.list_price - 0 || 0,
            "name": product.name || '',
            "countSku": product.count_sku || 0,
            "img": JSON.stringify(product.detail.images),
            "markLable": cat,
            "saleCount": product.saleCount || 0,
            "canBookCount": product.canBookCount || 0,
            "cmtStar": product.cmtStar ? product.cmtStar + '' : '0',
            "cmtStars": isNaN(product.cmtStars) ? 0 : product.cmtStars || 0,
            "cmtCount": product.cmtCount || 0,
            "ondateOnline": moment(product.ondateOnline ? product.ondateOnline * 1000 : new Date()).format('YYYY-MM-DD HH:mm:ss'),
            "updateTime": moment(product.updateDateTime ? product.updateDateTime * 1000 : new Date()).format('YYYY-MM-DD HH:mm:ss'),
            "site": product.site || '',
            "cat": cat,
            "height": _350.height,
            "width": _350.width,
        };
        axiosCookieHttp("api/WebSite/ProductCollect/InsertOrUpdateProductCollect", params).then((res) => {
            if (res.code === 200) {
                this.checkIsCollectHttp(product._id);
                commonFun.getMarkLabelHttp(this);
            }
        }).catch((e) => {
            console.log(e);
        })
    };

    cancelPopup = () => {
        let editLabel = document.querySelector('.editLabel .active');
        editLabel && (editLabel.className = 'editLabel');
        this.setState({
            searchFlag: false,
            editFlag: false,
            isShowFlag: false
        })
    };
    handleCollectVisible = (visible) => {
        this.setState({
            editFlag: visible,
            isShowFlag: visible
        });
    };
    handleNoCollectVisible = (visible) => {
        let nickName = window.sessionStorage.getItem('nickName') || '';
        if (nickName) {
            this.setState({
                searchFlag: visible,
                isShowFlag: visible
            });
        } else {
            this.props.dispatch(isLoginFlagActive(true));
        }
    };

    stopPropagationFun = (e) => {
        e.stopPropagation();
    };
    cancelQuickViewPopup = (productId, lable) => {
        this.props.onCancelPopup(productId, lable);
    };

    render() {
        const style = {
            modal: {
                top: 0, margin: 0, paddingBottom: 0, padding: '64px 20px'
            },
            maxWith_1080: {
                width: 1080
            }
        };
        const {productDetail, currencyType} = this.props;
        const {product = {}, ...props} = productDetail;
        const {bigImg, pageIndex, clickIndex, detailData = {}, attList = [], listPrice = 0, images = [], searchFlag, editFlag, clientWidthFlag, isShowFlag} = this.state;
        const {cmiCat1 = {}, cmiCat2 = {}, cmiCat3 = {}} = props;
        let cat = cmiCat3 === null ? (cmiCat2 === null ? (cmiCat1 && cmiCat1.cat1_name_cn) || '' : cmiCat2.cat2_name_cn) : cmiCat3.cat3_name_cn;
        return (
            <Modal visible centered footer={null} width={1090} bodyStyle={style.modal}
                   maskClosable={false}
                   iconType='error' onCancel={this.cancelQuickViewPopup.bind(this, product._id, product.lable || cat)}>
                <div className="detailView">
                    {clientWidthFlag ? <Fragment>
                        <div className="leftBox">
                            <div className="left pr">
                                <i className={`iconfont iconlb-xilaxioa previous ${pageIndex === 0 ? 'active' : ''}`}
                                   onClick={this._handlePreviousNext.bind(this, -1)}/>
                                <div className="of_hidden pr">
                                    <ul className="leftUl" style={{top: -428 * pageIndex}}>
                                        {
                                            images.map((item, index) => {
                                                return (
                                                    <li key={index}>
                                                        <img onClick={this._handleSwitchImg.bind(this, index)}
                                                             className={`pointer ${clickIndex === index ? "active" : ''}`}
                                                             src={item.scaled_paths._100.path || item.url}
                                                             alt="图片"/>
                                                    </li>
                                                )
                                            })
                                        }
                                    </ul>
                                </div>
                                <i className={`iconfont iconlb-xilaxioa next ${pageIndex + 1 >= Math.ceil(images.length / 4) ? 'active' : ''}`}
                                   onClick={this._handlePreviousNext.bind(this, 1)}/>
                            </div>
                        </div>
                        <div className="middle pr active">
                            <div className="singleImg pr">
                                {/*iconfont iconlb-xilaxioa*/}
                                <div className={`
 previousImg ${clickIndex === 0 ? 'active' : ''}`}
                                     style={{backgroundImage: `url('../../static/list/liebiaonu-banerlunbozuo@2x.png')`}}
                                     onClick={this._handlePreviousNextImg.bind(this, -1)}/>
                                {/*iconfont iconlb-xilaxioa*/}
                                <div className={` nextImg ${clickIndex === images.length - 1 ? 'active' : ''}`}
                                     onClick={this._handlePreviousNextImg.bind(this, 1)}
                                     style={{backgroundImage: `url('../../static/list/liebiaonu-banerlunboyou@2x.png')`}}/>
                                <img className="img" src={bigImg} alt="图片"/>
                                {/*爱心*/}
                                {
                                    product.isCollect && <em className="iconfont iconxin-yy love"/>
                                }
                                {/*是否已收藏*/}
                                <div className={`editLabel ${isShowFlag ? 'active' : ''}`}>
                                    {
                                        product.isCollect ? <Popover placement="bottom"
                                                                     trigger="click"
                                                                     visible={editFlag}
                                                                     onVisibleChange={(e) => this.handleCollectVisible(e)}
                                                                     content={(
                                                                         <EditLabelCpn flag="quickView"
                                                                                       data={product}
                                                                                       onCancelPopup={this.cancelPopup}/>
                                                                     )}
                                        >
                                            <div className="collectBox pointer"
                                                 onClick={(e) => this.stopPropagationFun(e)}>
                                                {/*已收藏*/}
                                                {/*<i className="iconfont iconlb-bjbq  editIcon"/>*/}
                                                <EditSVg className="editIcon"/>

                                                <span className="text">{product.lable}</span>
                                                <em className="iconfont iconxin-yy iconLove  pointer"/>
                                            </div>
                                        </Popover> : <div className="selectBox">
                                            {/*还没有收藏*/}
                                            <Popover placement="bottom"
                                                     trigger="click"
                                                // visible={true}
                                                     visible={searchFlag}
                                                     onVisibleChange={(e) => this.handleNoCollectVisible(e)}
                                                     content={(
                                                         <SearchLabelCpn flag="quickView" data={detailData}
                                                                         onCancelPopup={this.cancelPopup}
                                                         />
                                                     )}
                                            >
                                                <div className="content pr"
                                                     onClick={(e) => this.stopPropagationFun(e)}>{cat}
                                                    {/*iconfont iconxiala-black*/}
                                                    <i className=" downIcon"
                                                       style={{backgroundImage: `url('../../static/list/liebiao-shoucang-xialabianji@2x.png')`}}
                                                    />
                                                </div>
                                            </Popover>
                                            <div className="noCollectWrap">
                                                <em className="iconfont iconxiangqing-kong noCollect pointer"
                                                    onClick={(e) => this._handleNewCollection(e, cat)}/>
                                            </div>
                                        </div>
                                    }
                                </div>
                            </div>

                        </div>
                    </Fragment> : <CarouselCpn data={images}/>
                    }
                    <div className="right quickView popup pr">
                        {/*链接*/}
                        <div className="rightTitleWrap">
                            <h4 className="title">{detailData.name}</h4>
                            <a className="iconfont icondaochu linkIcon pointer" href={detailData.detailUrl}
                               target="_blank"/>
                        </div>
                        {
                            product.list_price_usd ?
                                <div className="rightPrice">
                                    <span
                                        className="price">{currencyType === 'USD' ? "$" + Math.round(product.list_price_usd * 100) / 100 : "¥" + Math.round(product.list_price_cny * 100) / 100}</span>
                                    <span
                                        className="updateTime">{moment(product.updateDateTime * 1000).format('YYYY.MM.DD')} 更新</span>
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
                                    <div key={index} className={`attBox ${index === 0 && "mb24"}`}>
                                        <label>{name}</label>
                                        <ul>
                                            {item.value.map((subItem, subIndex) => {
                                                return (
                                                    <li key={subIndex}
                                                        // className={`pointer ${subItem.selectFlag === true && "active"}`}
                                                        // onClick={this._handleSelectAtt.bind(this, index, subIndex)}
                                                    >{subItem.name}</li>
                                                )
                                            })}
                                        </ul>
                                    </div>
                                )
                            })
                        }
                        {
                            (detailData.cmtStar > 0 || detailData.cmtCount > 0) ?
                                <div className="fromBox"><label>评价</label>
                                    <div className="text starWrap">
                                        {
                                            detailData.cmtStar > 0 ? <i className="starIcon"
                                                                        style={{background: `url('../../../static/xiangpingYellow.png') no-repeat ${Math.round((detailData.cmtStars - detailData.cmtStar) / (detailData.cmtStars === 10 ? 2 : 1) || 0) * -25}px center`}}/> : null
                                        }
                                        {
                                            detailData.cmtCount > 0 ? <div className="infoIconWrap">
                                                <i className={`iconfont iconchat infoIcon ${detailData.cmtStar > 0 ? 'active' : ''}`}/>
                                                <span className="infoText">{detailData.cmtCount}</span></div> : null

                                        }
                                    </div>
                                </div> : null
                        }
                        <div className="fromBox"><label>来源</label>
                            <Link prefetch href={{
                                pathname: '/searchPage',
                                query: {site: detailData.site}
                            }}>
                                <a>
                                    <span className="text active">{detailData.site}</span>
                                </a>
                            </Link>
                        </div>
                        {
                            detailData.designer ?
                                <div className="fromBox"><label>品牌</label>
                                    <Link prefetch
                                          href={{
                                              pathname: '/searchPage',
                                              query: {source_brand: detailData.designer}
                                          }}>
                                        <a>
                                            <span className="text active">{detailData.designer}</span>
                                        </a>
                                    </Link>
                                </div> : null
                        }
                        {
                            detailData.designer_by ?
                                <div className="fromBox"><label>设计师</label>
                                    <Link prefetch href={{
                                        pathname: '/searchPage',
                                        query: {designer: detailData.designer_by}
                                    }}>
                                        <a>
                                            <span className="text active">{detailData.designer_by}</span>
                                        </a>
                                    </Link>
                                </div> : null
                        }
                        <div className="detail mt8"><Link prefetch
                                                          href={{
                                                              pathname: '/detailPage',
                                                              query: {product: this.props.productId}
                                                          }}><a target="_blank">查看详情</a></Link></div>
                    </div>
                </div>
            </Modal>
        )
    }
}

const getUserInfo = ({detailPage, headerReducer}) => {
    return {
        productDetail: detailPage.productDetail,
        isLoginFlag: headerReducer.isLoginFlag,
        currencyType: headerReducer.rate,
    }
};
export default connect(getUserInfo)(QuickViewCpn);