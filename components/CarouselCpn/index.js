import React, {Component} from 'react';
import {Carousel} from 'antd';
import {withRouter} from 'next/router';
import Link from "next/link";
import './index.less'

function group(array, subGroupLength) {
    let index = 0, newArray = [];
    while (index < array.length && index + subGroupLength < array.length) {
        newArray.push(array.slice(index, index += subGroupLength));
    }
    return newArray;
}

const CONTAINER_ITEM_WIDTH_297 = 297, CONTAINER_WIDTH_1718 = 1670, BANNER_MAX_NUM = 6, BANNER_MARGIN_RIGHT = 55;

class CarouseCpn extends Component {
    state = {
        containerWidth: document.body.clientWidth || document.documentElement.clientWidth,
    };

    componentDidMount() {
        const {containerWidth} = this.state;
        this.state.itemLength = containerWidth > CONTAINER_WIDTH_1718 ? BANNER_MAX_NUM : Math.floor((containerWidth + BANNER_MARGIN_RIGHT) / CONTAINER_ITEM_WIDTH_297);
    }

    _handlePrevious = () => {
        this.refs.carouselRef.prev();
    };
    _handleNext = () => {
        this.refs.carouselRef.next();
    };

    render() {
        const {banner} = this.props;
        const {itemLength} = this.state;
        const bannerData = group(banner, itemLength);
        return (
            <div className="carouseWrap">
                <h5 className="title">新品</h5>
                <p className="subTitle">New Arrival</p>
                {/*autoplay*/}
                <Carousel ref='carouselRef'>
                    {
                        bannerData.map((item, index) => {
                            return (
                                <div key={index} className="carousePage pr">
                                    {
                                        item.map((subItem) => {
                                            return (
                                                <Link key={subItem.object_id} prefetch href={{
                                                    pathname: '/detailPage',
                                                    query: {product: subItem.object_id}
                                                }}>
                                                    <a target="_blank">
                                                        <div className="bgImgItem"
                                                             style={{backgroundImage: `url(${subItem.icon_350})`}}/>
                                                    </a>
                                                </Link>
                                            )
                                        })
                                    }
                                    <i className="previous" onClick={this._handlePrevious}
                                       style={{backgroundImage: `url('../../static/list/liebiaonu-banerlunbozuo@2x.png')`}}/>
                                    <i className="next" onClick={this._handleNext}
                                       style={{backgroundImage: `url('../../static/list/liebiaonu-banerlunboyou@2x.png')`}}/>
                                </div>
                            )
                        })
                    }
                </Carousel>
            </div>
        );
    }
}

export default withRouter(CarouseCpn);