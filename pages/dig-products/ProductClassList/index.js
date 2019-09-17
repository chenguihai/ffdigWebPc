import React, {Component, Fragment} from 'react'
import {Button, Drawer, Pagination, Spin} from "antd";
import ProductList from "./productList";
import AutoResponsive from "autoresponsive-react";
import {connect} from "react-redux";
import NewLabelCpn from "../../../components/NewLabelCpn";
import DataEmptyCpn from "../../../components/DataEmptyCpn";
import EditLabelCpn from "../../../components/EditLabelCpn";
import SearchLabelCpn from "../../../components/SearchLabelCpn";

import {isLoginFlagActive, isRegisterFlagActive} from "../../../actions";

const PAGE_NUM = 100, MAX_PRODUCT_NUM = 10000;

class ProductClassList extends Component {
    state = {
        drawerFlag: false,
        newFlag: false,
    };

    getAutoResponsiveProps = () => {
        return {
            itemMargin: 10,
            containerWidth: this.props.containerWidth,
            itemClassName: 'productListItem',
            gridWidth: 20,
            transitionDuration: '.5'
        };
    };

    _handleCloseDrawer = () => {
        this.setState({
            drawerFlag: false
        })
    };
    _handleShowNewLabel = () => {
        this.setState({
            newFlag: true
        })
    };
    cancelPopup = () => {
        this.setState({
            drawerFlag: false,
            newFlag: false,
        })
    };

    onShowLogin = () => {
        this.props.dispatch(isLoginFlagActive(true));
    };
    onShowRegister = () => {
        this.props.dispatch(isRegisterFlagActive(true));
    };
    onChangePagination = (page, pageSize) => {
        let nickName = window.sessionStorage.getItem('nickName');
        if (nickName) {
            this.props.onChangePag(page);
        } else {
            this.props.dispatch(isLoginFlagActive(true));
        }
    };

    render() {
        const {searchData: {data = [], count = 0, currentPage = 1}, nickName, isLoading,containerWidth} = this.props;
        const {drawerFlag, newFlag} = this.state;
        return (
            <Fragment>
                <div id="productListWrapId" ref="container" className="productListWrap listActive pr"
                     style={{width: containerWidth}}>
                    {data.length > 0 ? <AutoResponsive {...this.getAutoResponsiveProps()}>
                        {
                            data.map((item, index) => {
                                const {height, width} = item._350;
                                let heights = (item.cmtStar > 0 || item.cmtCount > 0) ? 120 : 88;
                                return (
                                    // 270*height/width+200 56 32 16 20
                                    <div key={item.object_id}
                                         style={{width: 270, height: ((270 * height / width) || 418) + heights}}
                                         className="productListItem pr">
                                        <ProductList dataList={item} itemIndex={index}/>
                                    </div>)
                            })
                        }
                    </AutoResponsive> : isLoading === false && <DataEmptyCpn/>
                    }
                    <div className="spinLoading">
                        <Spin spinning={isLoading} tip="Loading..."/>
                    </div>
                    {
                        nickName && (count <= currentPage * PAGE_NUM || data.length === PAGE_NUM) &&
                        <div className="paginationWrap">
                            <Pagination current={currentPage} pageSize={PAGE_NUM} hideOnSinglePage={true}
                                        total={count > MAX_PRODUCT_NUM ? MAX_PRODUCT_NUM : count}
                                        onChange={this.onChangePagination}/>
                        </div>
                    }

                    {/*提示用户登录*/}
                    {
                        data.length === PAGE_NUM && !nickName &&
                        <div className="notifyWrap">
                            <p className="text"> 尊敬的用户，为更好地搜罗发现的产品，请先登录/注册</p>
                            <div className="notifyBox">
                                <Button type="primary" className="loginBtn"
                                        onClick={this.onShowLogin}>登录</Button>
                                <Button className="loginBtn" onClick={this.onShowRegister}>注册</Button>
                            </div>
                        </div>
                    }
                </div>
                <Drawer className="drawerWrap"
                        title=""
                        placement="right"
                        closable={false}
                        width={350}
                        bodyStyle={{padding: 0}}
                        destroyOnClose={true}
                    // onClose={this.onClose}
                    //     maskClosable
                        visible={drawerFlag}
                >
                    <h3 className="drawerTitle">收藏产品</h3>
                    {newFlag ? <NewLabelCpn flag='collectAll' onCancelPopup={this.cancelPopup}
                                            onNewLable={this.productCollectAboutList}/> :
                        data && data.isCollect ?
                            <EditLabelCpn flag='collectAll' onCancelPopup={this.cancelPopup}/> :
                            <SearchLabelCpn flag='collectAll' onCancelPopup={this.cancelPopup}
                                            onShowNew={this._handleShowNewLabel}/>
                    }
                    <i className="iconfont iconht-cha  drawerDeleteIcon" onClick={this._handleCloseDrawer}/>
                </Drawer>
                <style jsx>{`
                .notifyWrap{
                  background: url("../../../static/backbod.png") no-repeat center /100%;
                }
                `}</style>
            </Fragment>
        )
    }
}

const getUserInfo = ({account, listPageReducer}) => {
    return {
        nickName: account.userInfo.nickName,
        isLoading: listPageReducer.isLoading,
        searchData: listPageReducer.searchData,
    }
};
export default connect(getUserInfo)(ProductClassList);
