import React, {Component} from 'react';
import {Modal} from "antd";
import Link from "next/link";
import './index.less'

class BgQuickView extends Component {
    cancelQuickViewPopup = () => {
        this.props.onCancelPopup();
    };

    render() {
        const style = {
            modal: {
                top: 0, margin: 0, padding: '54px 10px 40px 38px'
            }
        };
        const {productItem, currencyType} = this.props;
        return (
            <Modal visible centered footer={null} width={718} bodyStyle={style.modal}
                   maskClosable={false}
                   onCancel={this.cancelQuickViewPopup}>
                <div className="bgQuickView">
                    <div className='quickLeft'>
                        {/*<img className="quickImg"*/}
                        {/*src={JSON.parse(productItem.img)[0].url}*/}
                        {/*alt=""/>*/}
                        <div className="quickImg"
                             style={{background: `url(${JSON.parse(productItem.img)[0].url}) no-repeat center / cover`}}/>
                        <Link prefetch href={{pathname: '/detailPage', query: {product: productItem.productId}}}><a>
                            <div className="quickName pointer">
                                <i className="iconfont iconht-cxq jumpIcon"/>
                                <span className="jumpText">{productItem.name}</span>
                            </div>
                        </a></Link>
                    </div>
                    <div className="quickRight">
                        <h4 className="title">产品详情</h4>
                        <ul className="quickUl">
                            <li className="quickItem">
                                <span className="name">产品ID</span>
                                <span className="value">{productItem.productId}</span>
                            </li>
                            <li className="quickItem">
                                <span className="name">售价</span>
                                {/*listPriceUsd*/}
                                <span
                                    className="value">{currencyType === 'USD' ? "$" + Math.round(productItem.listPriceUsd * 100) / 100 : "¥" + Math.round(productItem.listPriceCny * 100) / 100}</span>
                            </li>
                            <li className="quickItem">
                                <span className="name">sku数</span>
                                <span className="value">{productItem.countSku}</span>
                            </li>
                            <li className="quickItem">
                                <span className="name">产品分类</span>
                                <span className="value">{productItem.cat || productItem.markLable}</span>
                            </li>
                        </ul>
                        <h4 className="title">产品更新</h4>
                        <ul className="quickUl">
                            <li className="quickItem">
                                <span className="name">上架时间</span>
                                <span className="value">{productItem.ondateOnline}</span>
                            </li>
                            <li className="quickItem">
                                <span className="name">更新时间</span>
                                <span className="value">{productItem.updateTime}</span>
                            </li>
                            <li className="quickItem">
                                <span className="name">收藏时间</span>
                                <span className="value">{productItem.colUpdateTime}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </Modal>
        );
    }
}

export default BgQuickView;