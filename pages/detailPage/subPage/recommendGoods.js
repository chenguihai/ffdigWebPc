import React, {Component} from 'react'
import {Tooltip} from "antd";
import {connect} from "react-redux";
import commonFun from "../../../utils/commonFun";

class RecommendGoods extends Component {
    state = {
        pageIndex: 0,
        imgList: []
    };

    componentDidMount() {
        this.setState({
            imgList: this.props.similarProduct
        })
    }

    _handlePreviousNext = (type) => {
        const {pageIndex, imgList} = this.state;
        let num = 0, total = Math.ceil(imgList.length / 4) - 1;
        if (type > 0) {
            num = pageIndex >= total ? total : pageIndex + 1
        } else {
            num = pageIndex === 0 ? 0 : pageIndex - 1
        }
        this.setState({
            pageIndex: num,
        }, () => {
            commonFun.lazyLoadBgImgFun();
        });
    };
    _handleSendNewHttp = (productId) => {
        this.props.onSendHttp(productId);
    };

    render() {
        const {pageIndex, imgList} = this.state;
        const {similarProduct} = this.props;
        const imagesShow = similarProduct.filter((mainItem, index) => index >= pageIndex * 4 && index < (pageIndex + 1) * 4);
        return (
            <div className="pr recommendGoodsWrap">
                <h3 className="title">更多相关产品</h3>
                {/*<i className="iconfont iconfanhui previous" onClick={this._handlePreviousNext.bind(this, -1)}/>*/}
                <div className="recommendGoodsBox">
                    {/*style={{left: -1128 * pageIndex}}/*/}
                    <ul className="recommendGoodsUl pr">
                        <li className={`previous ${pageIndex === 0 ? 'active' : ''}`}
                            style={{backgroundImage: `url('../../../static/list/liebiaonu-banerlunbozuo@2x.png')`}}
                            onClick={this._handlePreviousNext.bind(this, -1)}/>
                        <li className={`next ${(pageIndex + 1) * 4 >= imgList.length ? 'active' : ''}`}
                            style={{backgroundImage: `url('../../../static/list/liebiaonu-banerlunboyou@2x.png')`}}
                            onClick={this._handlePreviousNext.bind(this, 1)}/>
                        {
                            imagesShow.map((item, index) => {
                                let {_350 = {}} = item.detail.images[0].scaled_paths;
                                return (
                                    <li key={item._id} className="pointer pr"
                                        onClick={this._handleSendNewHttp.bind(this, item._id)}>
                                        {/*<Link href={{pathname: '/detailPage', query: {product: item._id}}}> </Link>*/}

                                        <div className="product_link tc">
                                            {/*<img className="img" src={_350.path || item.icon} alt="推荐图片"/>*/}
                                            <div className="img lazyLoadBg" data-src={_350.path || item.icon}
                                                 style={{backgroundImage: `url('../../../static/loading.gif')`}}/>
                                            <Tooltip placement="top" title={item.name}>
                                                <div className="name ellipsis">{item.name}</div>
                                            </Tooltip>
                                            <div className="site">{item.site}</div>
                                            {/*<div className="priceBox"><span*/}
                                            {/*className="price">{exchangeRate == 1 ? "$" : "¥"}{Math.round(exchangeRate * item.list_price * 100) / 100 || 0}</span>*/}
                                            {/*{*/}
                                            {/*item.sale_count > 0 && <Fragment><i>|</i>销量<span*/}
                                            {/*className="num">{item.sale_count}</span></Fragment>*/}
                                            {/*}*/}
                                            {/*</div>*/}
                                        </div>
                                    </li>
                                )
                            })
                        }
                    </ul>
                </div>
                {/*<i className="iconfont iconfanhui next" onClick={this._handlePreviousNext.bind(this, 1)}/>*/}
            </div>
        )
    }
}

const getUserInfo = ({detailPage}) => {
    return {
        similarData: detailPage.similarData,
    }
};
export default connect(getUserInfo)(RecommendGoods);
