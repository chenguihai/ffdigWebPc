import React, {Component, Fragment} from 'react'
import RecommendGoods from "./subPage/recommendGoods";
import DetailView from "./subPage/detailView";
import JWPFooter from '../../components/Footer'
import {withRouter} from 'next/router'
import {connect} from 'react-redux'
import {axiosCookieHttp, axiosHttp} from "../../utils/ajax";
import {getProductDetail, getSimilarProducts} from "../../actions/detailPageAcrion";
import Header from "../../components/Header";
import {getHomePageData} from "../../actions/listPageAction";
import Head from "../../components/head";
import {getClassifyMsgHttp} from "../../utils/exportFun";
import "./index.less"

class DetailPage extends Component {
    static async getInitialProps({query: {product}, reduxStore}) {
        let cmi_cat = [], detailRes = null;
        try {
            const resp = await axiosHttp("api/WebSite/Classify/GetClassifyMsg", '', "GET");
            cmi_cat = resp.data
        } catch (e) {
            console.error(e)
        }
        let cmi_catData = getClassifyMsgHttp(cmi_cat);
        await reduxStore.dispatch(getHomePageData(cmi_catData));
        try {
            detailRes = await axiosHttp(`api/WebSite/Product/GetProductDetail?productId=${product}`, '', "GET");
            await reduxStore.dispatch(getProductDetail(detailRes.data));
        } catch (e) {

        }
        return {cmi_cat: cmi_catData, productDetail: detailRes ? detailRes.data : {}}
    }

    state = {
        isSendFlag: true
    };
    productId = this.props.router.query.product;

    componentDidMount() {
        const {router} = this.props;
        this.checkIsCollectHttp(router.query.product);
        this.getSimilarProductsHttp();
        // window.scrollTo(0, 0); //滚动到顶部
    }

    checkIsCollectHttp = (params) => { //检查商品是否已收藏
        if (!window.sessionStorage.getItem('nickName')) {
            return;
        }
        axiosCookieHttp('api/WebSite/HomePage/CheckIsCollect', {products: params.toString()}).then((res) => {
            if (res.code === 200) {

                let {productDetail} = this.props,
                    data = res.data[0],
                    newData = JSON.parse(JSON.stringify(productDetail));
                if (newData.product._id === data.id) {
                    newData.product.isCollect = data.isCollect;
                    newData.product.lable = data.lable;
                }
                this.props.dispatch(getProductDetail(newData));
            }
        }).catch((e) => {
            console.log(e);
        })
    };
    getProductDetailHttp = () => {  //获取产品详情
        axiosHttp('api/WebSite/Product/GetProductDetail?productId=' + this.productId, "", "GET").then((res) => {
            if (res.code === 200) {
                this.props.dispatch(getProductDetail(res.data));
            }
            this.setState({
                isSendFlag: true
            })
        }).catch((e) => {
            console.log(e);
        })
    };
    getSimilarProductsHttp = () => {  //获取类似产品
        axiosHttp(`api/WebSite/Product/GetSimilarProducts?productId=${this.productId}&count=12`, "", "GET").then((res) => {
            let data = [];
            if (res.code === 200) {
                data = res.data;
            }
            this.props.dispatch(getSimilarProducts(data));
            this.setState({
                isSendFlag: true
            })
        }).catch((e) => {
            console.log(e);
        })
    };

    _handleSendNewHttp = (productId) => {
        this.productId = productId;
        this.setState({isSendFlag: false});
        this.getProductDetailHttp();
        this.getSimilarProductsHttp();
    };
    _handleBreadcrumb = (item, index, breadNum) => { //点击面包屑
        const {breadCrumb} = this.props, obj = {id: '', name: '', index: 0};
        if (index < breadNum - 1) {
            if (index === 0) {
                breadCrumb[1] = obj;
                breadCrumb[2] = obj;
            } else if (index === 1) {
                breadCrumb[2] = obj;
            }
        }
        window.sessionStorage.setItem('breadCrumbs', JSON.stringify(breadCrumb));
        this.props.router.push({
            pathname: '/dig-products',
            query: {cat_id: item.id}
        });
    };

    render() {
        const {productDetail, similarData, breadCrumb} = this.props;
        const [item1, item2, item3] = breadCrumb;
        let breadNum = item3.id ? 3 : item2.id ? 2 : item1.id ? 1 : 0;
        // const {cmiCat1, cmiCat2, cmiCat3, product = {}} = productDetail;
        const {product = {}} = productDetail;
        // let cmiCat = cmiCat3 ? [cmiCat1, cmiCat2, cmiCat3] : cmiCat2 ? [cmiCat1, cmiCat2] : [cmiCat1];
        const {isSendFlag} = this.state;
        return (
            <Fragment>
                <Head title={`${product.name}-商品详情-火联FFDIG`}/>
                <div id="headerId" className="detail-header">
                    <Header/>
                </div>
                <div className="hp_container detail-content">
                    <div className="detailPage" onScroll={this.handleScroll}>
                        <div id="detailFormId" className="detailForm">
                            {
                                // cmiCat.map((item, index) => {
                                //     console.log(item, item[`cat${index + 1}_name_cn`]);
                                //     if (index < cmiCat.length - 1) {
                                //         return (
                                //             <div className="labelItem"
                                //                  key={index}>{item[`cat${index + 1}_name_cn`] && index !== 0 ?
                                //                 <span>&nbsp;&gt;&nbsp;</span> : ''}
                                //                 <span
                                //                     onClick={this._handleBreadcrumb.bind(this, item[`cat${index + 1}_id`], index, breadNum)}
                                //                     className={`active pointer`}>{item[`cat${index + 1}_name_cn`]}</span>
                                //             </div>
                                //         )
                                //     } else {
                                //         return (
                                //             <div className="labelItem"
                                //                  key={index}>
                                //                 <span>&nbsp;&gt;&nbsp;</span>
                                //                 <span className="catName">{item[`cat${index + 1}_name_cn`]}</span>
                                //             </div>
                                //         )
                                //     }
                                // })
                            }
                            {
                                breadCrumb.map((item, index) => {
                                    if (index <= 1) {
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
                        {/*详情内容*/}
                        {
                            isSendFlag === true && productDetail && <DetailView productDetail={productDetail}/>
                        }
                        {
                            isSendFlag === true && similarData.length > 0 &&
                            <RecommendGoods similarProduct={similarData} onSendHttp={this._handleSendNewHttp}/>
                        }

                    </div>
                </div>
                <JWPFooter/>
            </Fragment>
        )
    }
}

const getUserInfo = ({detailPage, headerReducer}) => {
    return {
        productDetail: detailPage.productDetail,
        similarData: detailPage.similarData,
        breadCrumb: headerReducer.breadCrumb,
    }
};
export default connect(getUserInfo)(withRouter(DetailPage));
