import React, {Component, Fragment} from 'react';
import {Form, Input, Button, message} from "antd";
import {axiosCookieHttp} from "../../utils/ajax";
import commonFun from "../../utils/commonFun";
import moment from "moment";
import {connect} from "react-redux";
import {getProductDetail} from "../../actions/detailPageAcrion";
import {getUserCollectCountAction} from "../../actions";
import {getHomePageSearch} from "../../actions/listPageAction";
import './index.less'

const FormItem = Form.Item;

class NewLabelCpn extends Component {
    state = {
        isLoading: false
    };
    _handleSubmit = (e) => {
        e.stopPropagation();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const {flag} = this.props;
                if (flag === 'detailPage' || flag === 'quickView') {
                    this.productCollectAboutDetail(values.markLable);
                } else if (flag === 'collectAll') {
                    this.productCollectAllProduct(values.markLable);
                } else {
                    this.props.onNewLable(values.markLable);
                }
            }
        });
    };

    productCollectAllProduct = (markLabel = '') => { //新增或更新商品收藏
        const {data, count, currentPage} = this.props.searchData;
        if (data.length === 0) {
            return;
        }
        let collectArr = [];
        this.setState({
            isLoading: true
        });
        data.forEach(item => {
            collectArr.push({
                "spuId": item.spu_id || '',
                "currency": item.currency || '',
                "att": '',
                "skus": '',
                "productId": item.object_id || '',
                "listPrice": item.list_price - 0 || 0,
                "name": item.lang === 'cn' ? item.title_cn : item.title_en,
                "countSku": 0,
                "img": data.icon || '',
                "markLable": markLabel,
                "saleCount": item.saleCount || 0,
                "canBookCount": item.canBookCount || 0,
                "cmtStar": item.cmtStar ? item.cmtStar + '' : '0',
                "cmtStars": isNaN(item.cmtStars) ? 0 : item.cmtStars || 0,
                "cmtCount": item.cmtCount || 0,
                "ondateOnline": moment(item.ondateOnline ? item.ondateOnline * 1000 : new Date()).format('YYYY-MM-DD h:mm:ss'),
                "updateTime": moment(item.update_time ? item.update_time * 1000 : new Date()).format('YYYY-MM-DD h:mm:ss'),
                "site": item.site || '',
                "cat": (item.cmiCatBottom && item.cmiCatBottom.cat_name_cn) || '',
                "height": item._350.height || 418,
                "width": item._350.width || 350,
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
                    count, currentPage
                }));
                this.props.onCancelPopup();
            } else if (res.code === 2000) {
                message.error(res.msg);
            } else if (res.code === 6000) {
                message.success(res.msg);
                this.props.onCancelPopup();
            }

        }).catch((e) => {
            this.setState({
                isLoading: false
            });
        })
    };
    productCollectAboutDetail = (markLable = "") => { //新增或更新商品收藏
        const {productDetail} = this.props;
        const {cmiCat1 = {}, cmiCat2 = {}, cmiCat3 = {}, product} = productDetail;
        let cat = cmiCat3 === null ? (cmiCat2 === null ? (cmiCat1 && cmiCat1.cat1_name_cn) || '' : cmiCat2.cat2_name_cn) : cmiCat3.cat3_name_cn;
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
                this.props.onCancelPopup();
                this.props.dispatch(getUserCollectCountAction());
                this.props.dispatch(getProductDetail(productDetail));
            }
        }).catch((e) => {
            console.log(e);
        })
    };

    render() {
        const {getFieldDecorator} = this.props.form;
        const {flag} = this.props;
        const {isLoading} = this.state;
        return (
            <div className={`${flag === 'quickView' || flag === 'detailPage' ? 'newContentBox' : 'newBox'}`}>
                <h5 className="newTitle">创建标签</h5>
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
                <div className="newBtnGround">
                    <Button className="cancelBtn" onClick={this.props.onCancelPopup}>取消</Button>
                    <Button loading={isLoading} type="primary" onClick={this._handleSubmit}>确认</Button>
                </div>
            </div>
        );
    }
}

const getUserInfo = ({listPageReducer, detailPage}) => {
    return {
        productDetail: detailPage.productDetail,
        searchData: listPageReducer.searchData
    }
};
export default connect(getUserInfo)(Form.create({})(NewLabelCpn));