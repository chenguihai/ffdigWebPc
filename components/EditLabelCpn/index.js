import React, {Component} from 'react';
import {Button, Form, Input, message} from "antd";
import {axiosCookieHttp} from "../../utils/ajax";
import commonFun from "../../utils/commonFun";
import moment from "moment";
import {connect} from "react-redux";
import {getHomePageSearch} from "../../actions/listPageAction";
import {getProductDetail} from "../../actions/detailPageAcrion";
import {getProductCollectActive, getUserCollectCountAction} from "../../actions";
import './index.less'

const FormItem = Form.Item;

class EditLabelCpn extends Component {
    componentDidMount() {
        const {cmiCatBottom, lable, markLable} = this.props.data;
        this.props.form.setFieldsValue({
            markLable: lable || (cmiCatBottom && cmiCatBottom.cat_name_cn) || markLable || ''
        })
    }

    _handleSubmit = (e) => {
        e.stopPropagation();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const {flag = ''} = this.props;
                if (flag === 'collectPage') {
                    this.productCollectAboutCollect(values.markLable);
                } else if (flag) {
                    this.productCollectAboutDetail(values.markLable);
                } else {
                    this.productCollectAboutList(values.markLable);
                }
            }
        });
    };
    _handleCancelCollect = () => { //取消收藏
        const {flag, data} = this.props;
        if (flag === 'collectPage') {
            this.deleteProductAboutCollectPage(data.productId);
        } else if (flag === 'detailPage' || flag === 'quickView') {
            this.deleteProductCollectAboutDetail(data._id);
        } else if (flag === 'collectAll') {

        } else {
            this.deleteProductCollectHttp(data.object_id);
        }
    };
    deleteProductCollectAboutDetail = (productId) => { //删除商品收藏
        axiosCookieHttp("api/WebSite/ProductCollect/DeleteProductCollect?productId=" + productId, '', 'delete').then((res) => {
            if (res.code === 200) {
                const {productDetail, dispatch, onCancelPopup, flag, searchData = {}} = this.props;
                productDetail.product.isCollect = false;
                onCancelPopup();
                commonFun.getMarkLabelHttp(this);
                dispatch(getUserCollectCountAction());
                dispatch(getProductDetail(productDetail));
                if (flag === 'quickView') {
                    const {data, count, currentPage} = searchData;
                    let newData = JSON.parse(JSON.stringify(data));
                    for (let i = 0; i < newData.length; i++) {
                        if (newData[i].object_id === productId) {
                            newData[i].isCollect = false;
                            this.props.dispatch(getHomePageSearch({
                                data: newData,
                                count: count,
                                currentPage: currentPage
                            }));
                            break;
                        }
                    }

                }
            }
        }).catch((e) => {
            console.log(e);
        })
    };
    deleteProductAboutCollectPage = (productId) => { //删除商品收藏页面的收藏
        axiosCookieHttp("api/WebSite/ProductCollect/DeleteProductCollect?productId=" + productId, '', 'delete').then((res) => {
            if (res.code === 200) {
                const {collectData, itemIndex, dispatch, onCancelPopup} = this.props;
                const {list, totalCount, totalPages} = collectData;
                list.splice(itemIndex, 1);
                onCancelPopup();
                commonFun.getProductCollectSiteAndCatHttp(this);
                commonFun.getMarkLabelHttp(this);
                dispatch(getUserCollectCountAction());
                dispatch(getProductCollectActive({
                    list: list,
                    totalCount,
                    totalPages,
                }));
            }
        }).catch((e) => {
            console.log(e);
        })
    };
    deleteProductCollectHttp = (productId) => { //删除商品收藏 列表页面
        axiosCookieHttp("api/WebSite/ProductCollect/DeleteProductCollect?productId=" + productId, '', 'delete').then((res) => {
            if (res.code === 200) {
                const {searchData, itemIndex, dispatch, onCancelPopup} = this.props;
                const {data, count, currentPage} = searchData;
                data[itemIndex].isCollect = false;
                onCancelPopup();
                commonFun.getMarkLabelHttp(this);
                dispatch(getUserCollectCountAction());
                dispatch(getHomePageSearch({
                    data: data,
                    count, currentPage
                }));
            } else {
                message.error(res.msg);
            }
        }).catch((e) => {
            console.log(e);
        })
    };
    productCollectAboutCollect = (markLable = "") => { //新增或更新商品收藏   收藏页面
        const {collectData, data, itemIndex} = this.props;
        const {list, totalCount, totalPages} = collectData;
        let params = {
            "spuId": data.spuId,
            "currency": data.currency,
            "att": data.att,
            "skus": data.skus,

            "productId": data.productId,
            "listPrice": data.listPrice - 0,
            "name": data.name,
            "countSku": data.countSku,
            "img": data.img,
            "markLable": markLable,
            "saleCount": data.saleCount,
            "canBookCount": data.canBookCount,
            "cmtStar": data.cmtStar ? data.cmtStar + '' : '0',
            "cmtStars": isNaN(data.cmtStars) ? 0 : data.cmtStars || 0,
            "cmtCount": data.cmtCount || 0,
            "ondateOnline": data.ondateOnline,
            "updateTime": data.updateTime,
            "site": data.site,
            "cat": data.cat,
            "height": data.height,
            "width": data.width,
        };
        axiosCookieHttp("api/WebSite/ProductCollect/InsertOrUpdateProductCollect", params).then((res) => {
            if (res.code === 200) {
                list[itemIndex].markLable = markLable;
                this.props.onCancelPopup();
                commonFun.getProductCollectSiteAndCatHttp(this);
                commonFun.getMarkLabelHttp(this);
                this.props.dispatch(getProductCollectActive({
                    list: list,
                    totalCount,
                    totalPages,
                }));
            }
        }).catch((e) => {
            console.log(e);
        })
    };
    productCollectAboutDetail = (markLable = "") => { //新增或更新商品收藏  详情页面
        const {productDetail} = this.props;
        const {cmiCat1 = {}, cmiCat2 = {}, cmiCat3 = {}, product} = productDetail;
        let cat = cmiCat3 === null ? (cmiCat2 === null ? (cmiCat1 && cmiCat1.cat1_name_cn) || '' : cmiCat2.cat2_name_cn) : cmiCat3.cat3_name_cn;
        let {_350 = {}} = product.detail.images[0].scaled_paths;
        let params = {
            "spuId": product.spu_id || '',
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
                product.lable = markLable;
                this.props.onCancelPopup();
                commonFun.getMarkLabelHttp(this);
                this.props.dispatch(getProductDetail(productDetail));
            }
        }).catch((e) => {
            console.log(e);
        })
    };
    productCollectAboutList = (markLable = "") => { //新增或更新商品收藏  //新增 列表页面的收藏
        const {data, itemIndex} = this.props;
        let {object_id, lable, cmiCatBottom = {}, lang, title_cn, title_en} = data;
        let params = {
            "spuId": data.spu_id || '',
            "currency": data.currency,
            "att": '',
            "skus": '',
            "productId": object_id,
            "listPrice": data.list_price,
            "name": lang === 'cn' ? title_cn : title_en,
            "countSku": 0,
            "img": '',
            "markLable": markLable,
            "saleCount": data.saleCount,
            "canBookCount": data.canBookCount,
            "cmtStar": data.cmtStar ? data.cmtStar + '' : '0',
            "cmtStars": isNaN(data.cmtStars) ? 0 : data.cmtStars || 0,
            "cmtCount": data.cmtCount || 0,
            "ondateOnline": moment(data.ondateOnline ? data.ondateOnline * 1000 : new Date()).format('YYYY-MM-DD h:mm:ss'),
            "updateTime": moment(data.update_time ? data.update_time * 1000 : new Date()).format('YYYY-MM-DD h:mm:ss'),
            "site": data.site,
            "cat": (cmiCatBottom && cmiCatBottom.cat_name_cn) || '',
            "height": data._350.height,
            "width": data._350.width,
        };
        axiosCookieHttp("api/WebSite/ProductCollect/InsertOrUpdateProductCollect", params).then((res) => {
            if (res.code === 200) {
                this.props.onCancelPopup();
                commonFun.getMarkLabelHttp(this);
                let {data, count, currentPage} = this.props.searchData;
                data[itemIndex].isCollect = true;
                data[itemIndex].lable = markLable;
                this.props.dispatch(getHomePageSearch({
                    data: data,
                    count, currentPage
                }));
            }
        }).catch((e) => {
            console.log(e);
        })
    };

    stopPropagationFun = (e) => {
        e.stopPropagation();
    };

    render() {
        const {getFieldDecorator} = this.props.form;
        // const {cmiCatBottom, lable, markLable} = this.props.data;
        const {flag} = this.props;
        return (
            <div className={`editWrap ${flag === 'detailPage' ? 'detailEditWrap' : ''}`}
                 onClick={this.stopPropagationFun}>
                <h4 className="editTitle">编辑标签</h4>
                <Form className="login-form" onSubmit={this._handleSubmit}>
                    <FormItem>
                        {getFieldDecorator('markLable', {
                            initialValue: '',
                        })(
                            <Input className="inputCpn" type="text"
                                   placeholder="20字以内"/>
                        )}
                    </FormItem>
                </Form>
                <div className="btnGroup">
                    <span className="text" onClick={this._handleCancelCollect}>取消收藏</span>
                    <Button className="cancelBtn" onClick={this.props.onCancelPopup}>取消</Button>
                    <Button type="primary" onClick={this._handleSubmit}>确认</Button>
                </div>
            </div>
        );
    }
}

const getUserInfo = ({listPageReducer, detailPage, bgPage}) => {
    return {
        searchData: listPageReducer.searchData,
        productDetail: detailPage.productDetail,
        collectData: bgPage.collectData,
    }
};
export default connect(getUserInfo)(Form.create({})(EditLabelCpn));