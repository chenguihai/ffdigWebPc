import React, {Component} from 'react';
import {Input, message, Spin} from "antd";
import {axiosCookieHttp} from "../../utils/ajax";
import commonFun from "../../utils/commonFun";
import moment from "moment";
import {connect} from "react-redux";
import NewLabelCpn from "../NewLabelCpn";
import {getHomePageSearch, getUserMarkLabel} from "../../actions/listPageAction";
import {getProductDetail} from "../../actions/detailPageAcrion";
import {getUserCollectCountAction} from "../../actions";
import './index.less'

const Search = Input.Search;
const labelMark = ["连衣裙", "上衣", "牛仔裤", "毛衣", "裤子", "套衫", "夹克", "紧身服", "衬衫", "牛仔服"];

class SearchLabelCpn extends Component {
    state = {
        showMarkLabel: [],
        recommendList: [],
        newLabelFlag: false,
        isLoading: false
    };

    componentDidMount() {
        const {markLabel} = this.props;
        this.setState({
            showMarkLabel: this.filterCommonFun(markLabel),
            recommendList: this.filterCommonFun(labelMark)
        })
    }

    _handlePressEnter = (e) => { //回车
        e.stopPropagation();
        let value = e.target.value;
        this.filterListCommonFun(value);
    };
    _handleFilterLabel = (value) => {  //点击按钮
        this.filterListCommonFun(value);
    };
    filterListCommonFun = (value) => { //通过关键字过滤标签
        if (!value) {
            this.setState({
                showMarkLabel: this.filterCommonFun(this.props.markLabel),
                recommendList: this.filterCommonFun(labelMark)
            });
            return;
        }
        const {markLabel} = this.props;
        let reg = new RegExp(value), recommend = [], mark = [];
        for (let i = 0; i < labelMark.length; i++) {
            if (reg.test(labelMark[i]) === true) {
                recommend.push(labelMark[i]);
            }
        }
        for (let i = 0; i < markLabel.length; i++) {
            if (reg.test(markLabel[i]) === true) {
                mark.push(markLabel[i]);
            }
        }
        this.setState({
            showMarkLabel: this.filterCommonFun(mark),
            recommendList: recommend
        })

    };
    filterCommonFun = (list = []) => { //过滤标签
        return list.filter((item, index) => index < 5)
    };
    // getMarkLabelHttp = (keyWord = "") => { //获取用户打标数据
    //     axiosCookieHttp(`api/WebSite/ProductCollect/GetUserMarkLabel${keyWord ? '?keyWord=' + keyWord : ''}`, '', "GET").then((res) => {
    //         if (res.code === 200) {
    //             this.props.dispatch(getUserMarkLabel(res.data ? res.data.split(',') : []));
    //         }
    //     }).catch((e) => {
    //         console.log(e);
    //     })
    // };
    onLabelChange = (label) => {
        const {flag = ''} = this.props;
        if (flag === 'detailPage' || flag === 'quickView') {
            this.productCollectAboutDetail(label);
        } else if (flag === 'collectAll') {
            this.productCollectAllProduct(label);
        } else {
            this.productCollectAboutList(label);
        }
    };

    productCollectAboutDetail = (markLable = "") => { //新增或更新商品收藏 详情页面
        const {productDetail} = this.props;
        const {cmiCat1 = {}, cmiCat2 = {}, cmiCat3 = {}, product} = productDetail;
        let cat = cmiCat3 === null ? (cmiCat2 === null ? cmiCat1[`cat1_name_${product.lang}`] : cmiCat2[`cat2_name_${product.lang}`]) : cmiCat3[`cat3_name_${product.lang}`];
        let {_350 = {}} = product.detail.images[0].scaled_paths;
        let params = {
            "spuId": product.spu_id,
            "currency": product.currency,
            "att": JSON.stringify(product.att),
            "skus": JSON.stringify(product.skus),

            "productId": product._id || 0,
            "listPrice": product.list_price - 0 || 0,
            "name": product.name || '',
            "countSku": product.count_sku || 0,
            "img": JSON.stringify(product.detail.images),
            "markLable": markLable,
            "saleCount": product.saleCount || 0,
            "canBookCount": product.canBookCount || 0,
            "cmtStar": product.cmtStar ? product.cmtStar + '' : '0',
            "cmtStars": isNaN(product.cmtStars) ? 0 : product.cmtStars || 0,
            "cmtCount": product.cmtCount || 0,
            "ondateOnline": moment(product.ondateOnline ? product.ondateOnline * 1000 : new Date()).format('YYYY-MM-DD h:mm:ss'),
            "updateTime": moment(product.updateDateTime ? product.updateDateTime * 1000 : new Date()).format('YYYY-MM-DD h:mm:ss'),
            "site": product.site || '',
            "cat": cat,
            "height": _350.height,
            "width": _350.width,
        };
        axiosCookieHttp("api/WebSite/ProductCollect/InsertOrUpdateProductCollect", params).then((res) => {
            if (res.code === 200) {
                commonFun.getMarkLabelHttp(this);
                product.isCollect = true;
                product.lable = markLable;
                this.props.dispatch(getUserCollectCountAction());
                this.props.onCancelPopup();
                this.props.dispatch(getProductDetail(productDetail));
            }
        }).catch((e) => {
            console.log(e);
        })
    };
    productCollectAboutList = (markLable = "") => { //新增或更新商品收藏    列表收藏
        const {data, itemIndex} = this.props;
        let {object_id} = data;
        let params = {
            "spuId": data.spu_id || '',
            "currency": data.currency || '',
            "att": '',
            "skus": '',
            "productId": object_id || '',
            "listPrice": data.list_price - 0 || 0,
            "name": data.lang === 'cn' ? data.title_cn : data.title_en,
            "countSku": 0,
            "img": data.icon || '',
            "markLable": markLable,
            "saleCount": data.sale_count || 0,
            "canBookCount": data.canBookCount || 0,
            "cmtStar": data.cmtStar ? data.cmtStar + '' : '0',
            "cmtStars": isNaN(data.cmtStars) ? 0 : data.cmtStars || 0,
            "cmtCount": data.cmtCount || 0,
            "ondateOnline": moment(data.ondateOnline ? data.ondateOnline * 1000 : new Date()).format('YYYY-MM-DD HH:mm:ss'),
            "updateTime": moment(data.update_time ? data.update_time * 1000 : new Date()).format('YYYY-MM-DD HH:mm:ss'),
            "site": data.site || '',
            "cat": (data.cmiCatBottom && data.cmiCatBottom.cat_name_cn) || '',
            "height": data._350.height,
            "width": data._350.width,
        };
        axiosCookieHttp("api/WebSite/ProductCollect/InsertOrUpdateProductCollect", params).then((res) => {
            if (res.code === 200) {
                commonFun.getMarkLabelHttp(this);
                const {data, count,currentPage} = this.props.searchData;
                data[itemIndex].isCollect = true;
                data[itemIndex].lable = markLable;
                this.props.onCancelPopup();
                this.props.dispatch(getUserCollectCountAction());
                this.props.dispatch(getHomePageSearch({
                    data: data,
                    count,currentPage
                }));
            }
        }).catch((e) => {
            console.log(e);
        })
    };
    productCollectAllProduct = (markLabel = '') => { //新增或更新商品收藏
        const {searchData} = this.props;
        const {data, count,currentPage} = searchData;
        if (data.length === 0) {
            return;
        }
        let collectArr = [];
        this.setState({
            isLoading: true
        });
        data.forEach((item, index) => {
            collectArr.push({
                "spuId": item.spu_id || '',
                "currency": item.currency || '',
                "att": '',
                "skus": '',
                "productId": item.object_id || '',
                "listPrice": item.list_price - 0 || 0,
                "name": (item.lang === 'cn' ? item.title_cn : item.title_en) || '',
                "countSku": 0,
                "img": data.icon || '',
                "markLable": markLabel,
                "saleCount": item.saleCount || 0,
                "canBookCount": item.canBookCount || 0,
                "cmtStar": item.cmtStar ? item.cmtStar + '' : '0',
                "cmtStars": isNaN(item.cmtStars) ? 0 : item.cmtStars || 0,
                "cmtCount": item.cmtCount || 0,
                "ondateOnline": moment(item.ondateOnline ? item.ondateOnline * 1000 : new Date()).format('YYYY-MM-DD HH:mm:ss'),
                "updateTime": moment(item.update_time ? item.update_time * 1000 : new Date()).format('YYYY-MM-DD HH:mm:ss'),
                "site": item.site || '',
                "cat": (item.cmiCatBottom && item.cmiCatBottom.cat_name_cn) || '',
                "height": item._350.height || 418,
                "width": item._350.width || 350,
                "pkey": item.pkey
            });
            item.isCollect = true;
            item.lable = markLabel;
        });
        axiosCookieHttp("api/WebSite/ProductCollect/BatchInsertProductCollect", collectArr).then((res) => {
            this.setState({
                isLoading: false
            });
            if (res.code === 200) {
                commonFun.getMarkLabelHttp(this);
                this.props.dispatch(getUserCollectCountAction());
                this.props.dispatch(getHomePageSearch({
                    data: data,
                    count,currentPage
                }));
                this.props.onCancelPopup();
            } else if (res.code === 2000) {
                message.error(res.msg);
            } else if (res.code === 6000) {
                this.props.dispatch(getHomePageSearch({
                    data: data,
                    count,currentPage
                }));
                message.success(res.msg);
                this.props.onCancelPopup();
            }

        }).catch((e) => {
            this.setState({
                isLoading: false
            });
        })
    };
    _handleShowNewLable = () => {
        const {flag} = this.props;
        if (flag === 'detailPage') {
            this.props.onShowNew();
        } else {
            this.setState({
                newLabelFlag: true
            })
        }

    };
    cancelPopup = () => {
        this.setState({
            newLabelFlag: false
        });
        this.props.onCancelPopup();
    };
    stopPropagationFun = (e) => {
        e.stopPropagation();
    };

    render() {
        const {showMarkLabel, recommendList, newLabelFlag, isLoading} = this.state;
        const {flag} = this.props;
        return (
            <div className="searchCpn pr" onClick={this.stopPropagationFun}>
                <Spin spinning={isLoading}>
                    <div className="searchBox">
                        <Search
                            placeholder="搜索内容"
                            onSearch={this._handleFilterLabel}
                            onPressEnter={this._handlePressEnter}
                            style={{width: 200}}
                        />
                    </div>
                    <div className="searchList">
                        {
                            recommendList.length > 0 && <div className="labelListWrap">
                                <h4 className="title">推荐标签</h4>
                                <ul className="labelUl">
                                    {
                                        recommendList.map((item, index) => {
                                            return (
                                                <li className="labelLi" onClick={this.onLabelChange.bind(this, item)}
                                                    key={index}>{item}</li>
                                            )
                                        })
                                    }
                                </ul>
                            </div>
                        }
                        {
                            showMarkLabel.length > 0 && <div className="labelListWrap">
                                <h4 className="title">已有标签</h4>
                                <ul className="labelUl">
                                    {
                                        showMarkLabel.map((item, index) => {
                                            return (
                                                <li className="labelLi" onClick={this.onLabelChange.bind(this, item)}
                                                    key={index}>{item}</li>
                                            )
                                        })
                                    }
                                </ul>
                            </div>
                        }
                    </div>
                    <div className="addLabelBtn" onClick={this._handleShowNewLable}>
                        <i className="iconfont iconlb-cjbq addIcon"/>
                        <span className="text">创建标签</span>
                    </div>
                    {
                        newLabelFlag &&
                        <div className="newMask">
                            <NewLabelCpn flag={flag} onCancelPopup={this.cancelPopup}
                                         onNewLable={this.productCollectAboutList}/>
                        </div>
                    }
                </Spin>
            </div>
        );
    }
}

const getUserInfo = ({listPageReducer, detailPage}) => {
    return {
        markLabel: listPageReducer.markLabel,
        searchData: listPageReducer.searchData,
        productDetail: detailPage.productDetail
    }
};
export default connect(getUserInfo)(SearchLabelCpn);