import React, {Component, Fragment} from 'react'
import {Button, Form, Input, Select, Pagination, Checkbox, Spin} from 'antd'
import Util from '../../utils/utils'
import commonFun from '../../utils/commonFun'
import {withRouter} from 'next/router'
import RangePickerNew from "../../components/RangePickerNew";
import DeleteModal from "../../components/DeleteModal";
import SelectPullDown from "./selectPullDown";
import moment from "moment";
import {axiosCookieHttp, axiosHttp} from "../../utils/ajax";
import UpdateCollectLabelCpn from "../../components/UpdateCollectLabelCpn";
import {JWPLayoutSimple} from '../../components'
import NoCollectData from './noCollectData'
import AutoResponsive from "autoresponsive-react";
import CollectList from "./collectList";
import {connect} from "react-redux";
import {
    breadCrumbActive,
    getProductCollectActive,
    getUserCollectCountAction,
    getProductCollectActiveLoading
} from "../../actions";
import './index.less'
import {getClassifyMsgHttp} from "../../utils/exportFun";
import {getHomePageData} from "../../actions/listPageAction";

const FormItem = Form.Item;
const Option = Select.Option;

class GoodsCollection extends Component {
    static async getInitialProps({query, reduxStore}) {
        let cmi_cat = [];
        try {
            const resp = await axiosHttp("api/WebSite/Classify/GetClassifyMsg", '', "GET");
            cmi_cat = resp.data
        } catch (e) {
            console.error(e)
        }
        let cmi_catData = getClassifyMsgHttp(cmi_cat);
        await reduxStore.dispatch(getHomePageData(cmi_catData));
        return {cmi_cat: cmi_catData}
    }
    state = {
        allSelect: false,
        catLabel: "全部",
        catLabelFlag: false,
        cancelCollectFlag: false,
        updateCollectFlag: false,
        isSelectFlag: false,
        isShowBtnFlag: false,
    };
    paramObj = {
        page: 1,
        limit: 15,
        marklabel: '',
        startOnline: '',
        endOnline: '',
        // startOnline: Util.momentFormat(moment().subtract(1, "months")),
        // endOnline: Util.momentFormat(moment()),
        site: "",
        cat: "",
        keyword: ""
    };
    currentPage = 1;

    componentDidMount() {
        const obj = {id: '', name: '', index: 0};
        commonFun.getProductCollectSiteAndCatHttp(this);
        this.getProductCollectHttp();
        let productListId = document.getElementById('productListId');
        productListId.addEventListener('scroll', this.scrollEvent);
        this.props.dispatch(breadCrumbActive([obj, obj, obj]));
        this.setState({
            containerWidth: (document.body.clientWidth || document.documentElement.clientWidth) - 320
        });
    }

    scrollEvent = (evt) => {
        clearTimeout(this.timer);
        let scrollTop, clientHeight, scrollHeight, productListId = document.getElementById('productListId');
        this.timer = setTimeout(() => {
            scrollTop = productListId.scrollTop;
            clientHeight = productListId.clientHeight;
            scrollHeight = productListId.scrollHeight;
            if (scrollTop + clientHeight >= scrollHeight) {
                const {totalPages} = this.props.collectData;
                if (this.paramObj.page % 7 === 0) {
                    return
                }
                if (totalPages <= this.paramObj.page) {
                    return
                }
                ++this.paramObj.page;
                this.getProductCollectAboutScroll();
            }
            clearTimeout(this.timer)
        }, 100)
    };
    getProductCollectHttp = () => { //获取商品收藏
        this.props.dispatch(getProductCollectActive({
            list: [],
            totalCount: 0,
            totalPages: 0
        }));
        this.props.dispatch(getProductCollectActiveLoading());
        axiosCookieHttp("api/WebSite/ProductCollect/GetProductCollect", this.paramObj).then((res) => {
            if (res.code === 200) {
                const {totalCount = 0, list = [], totalPages = 0} = res.data;
                for (let i = 0; i < list.length; i++) {
                    list[i].select = false;
                }
                this.props.dispatch(getProductCollectActive({
                    list,
                    totalCount,
                    totalPages
                }));
            } else {
                let param = {
                    list: [],
                    totalCount: 0,
                    totalPages: 0,
                    // loading: false
                };
                this.props.dispatch(getProductCollectActive(param));
            }
        }).catch((e) => {
            this.props.dispatch(getProductCollectActiveLoading());
            this.props.dispatch(getProductCollectActive({
                list: [],
                totalCount: 0,
                totalPages: 0
            }));
        })
    };
    getProductCollectAboutScroll = (type = '') => { //获取商品收藏
        // this.setState({
        //     loading: true
        // });
        this.props.dispatch(getProductCollectActiveLoading());
        axiosCookieHttp("api/WebSite/ProductCollect/GetProductCollect", this.paramObj).then((res) => {
            if (res.code === 200) {
                const {totalCount = 0, list = [], totalPages = 0} = res.data;
                for (let i = 0; i < list.length; i++) {
                    list[i].select = false;
                }
                const {collectData} = this.props;
                this.props.dispatch(getProductCollectActive({
                    list: type ? list : collectData.list.concat(list),
                    totalCount,
                    totalPages
                }));

            } else {
                // let param = {
                //     list: [],
                //     totalCount: 0,
                //     totalPages: 0,
                //     // loading: false
                // };
                // this.props.dispatch(getProductCollectActive(param));
            }
        }).catch((e) => {
            this.props.dispatch(getProductCollectActiveLoading());
            this.props.dispatch(getProductCollectActive({
                list: [],
                totalCount: 0,
                totalPages: 0
            }));
        })
    };

    handleAllElection = (e) => {
        let checked = e.target.checked;
        const {list, totalCount, totalPages} = this.props.collectData;
        this.props.dispatch(getProductCollectActive({
            list,
            totalCount,
            totalPages
        }));
        list.map((item) => item.select = checked);
        this.setState({
            allSelect: checked,
            isSelectFlag: checked,
        })
    };
    handleSingleCheckbox = (productId) => {
        if (!this.state.isShowBtnFlag) {
            this.props.router.push({
                pathname: '/detailPage',
                query: {product: productId}
            });
            return
        }
        const {list, totalCount, totalPages} = this.props.collectData;
        list.map((item) => {
            if (item.productId === productId) {
                item.select = !item.select;
            }
        });
        let param = {
            list,
            totalCount,
            totalPages
        };
        this.props.dispatch(getProductCollectActive(param));
        this.setState({
            allSelect: list.every((item) => item.select === true),
            isSelectFlag: list.some((item) => item.select === true)
        });
    };

    _handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.paramObj = {...this.paramObj, ...values, page: 1};
                let productListId = document.getElementById('productListId');
                productListId.scrollTop = 0;
                this.getProductCollectHttp();
            }
        });
    };
    handleSubmitFun = (startTime, endTime) => {
        // console.log(Util.momentFormat(moment(startTime)), Util.momentFormat(moment(endTime)));
        this.paramObj.startOnline = Util.momentFormat(moment(startTime));
        this.paramObj.endOnline = Util.momentFormat(moment(endTime));
    };
    _handleResetTimer = () => {
        this.paramObj.startOnline = '';
        this.paramObj.endOnline = '';
    };
    _handleDeleteCollect = () => { //收藏页面  取消收藏
        const {list, totalCount, totalPages} = this.props.collectData;
        let productId = [],
            dataArr = list.filter((item, index) => {
                if (item.select === true) {
                    productId.push(item.productId);
                    return false;
                }
                return true;
            });
        this.deleteProductCollectHttp(dataArr, productId.toString());
    };
    deleteProductCollectHttp = (dataArr, productId) => { //删除商品收藏
        axiosCookieHttp("api/WebSite/ProductCollect/DeleteProductCollect?productId=" + productId, '', 'delete').then((res) => {
            if (res.code === 200) {
                const {list, totalCount, totalPages} = this.props.collectData;
                this.props.dispatch(getUserCollectCountAction());
                commonFun.getProductCollectSiteAndCatHttp(this);
                commonFun.getMarkLabelHttp(this);
                if (this.state.allSelect === true) {
                    this.paramObj.page = 1;
                    this.getProductCollectHttp();
                } else {
                    this.props.dispatch(getProductCollectActive({
                        list: dataArr,
                        totalCount,
                        totalPages,
                    }));
                }
                this.setState({
                    cancelCollectFlag: false,
                    isSelectFlag: false,
                    allSelect: false
                });
            }
        }).catch((e) => {
            console.log(e);
        })
    };
    _handleUpdateMarkLabel = (markLable) => {  //修改标签
        const {list} = this.props.collectData;
        let productId = [],
            dataArr = list.filter((item) => {
                if (item.select === true) {
                    productId.push(item.productId);
                    item.markLable = markLable;
                    item.select = false;
                }
                return true;
            });
        this.updateMarkLabelHttp(dataArr, productId.toString(), markLable);
    };
    updateMarkLabelHttp = (dataArr, productIds, markLable) => { //批量修改收藏标签
        let params = {
            productIds: productIds,
            markLabel: markLable
        };
        axiosCookieHttp("api/WebSite/ProductCollect/UpdateMarkLabel", params).then((res) => {
            if (res.code === 200) {
                const {totalCount, totalPages} = this.props.collectData;
                this.props.dispatch(getProductCollectActive({
                    list: dataArr,
                    totalCount,
                    totalPages,
                }));
                commonFun.getProductCollectSiteAndCatHttp(this);
                commonFun.getMarkLabelHttp(this);
                this.setState({
                    cancelCollectFlag: false,
                    isSelectFlag: false,
                    updateCollectFlag: false,
                    allSelect: false,
                    isShowBtnFlag: false
                });
            }
        }).catch((e) => {
            console.log(e);
        })
    };
    _handlePopoverItem = (item = '') => { //取消收藏
        if (!this.state.isSelectFlag) {
            return
        }
        if (item === "cancel") {
            this.setState({
                cancelCollectFlag: true
            })
        } else {
            this.setState({
                updateCollectFlag: true
            })
        }
    };
    _handleKeyword = (value, type) => {
        if (type === 'cat') {
            this.paramObj.cat = value;
            this.paramObj.marklabel = '';
        } else {
            this.paramObj.marklabel = value;
            this.paramObj.cat = '';
        }
    };
    cancelPopup = () => {
        this.setState({
            cancelCollectFlag: false,
            updateCollectFlag: false
        })
    };
    getAutoResponsiveProps = () => {
        return {
            itemMargin: 10,
            // containerWidth: this.state.containerWidth || document.body.clientWidth,
            containerWidth: this.state.containerWidth,
            itemClassName: 'productListItem',
            gridWidth: 20,
            transitionDuration: '.5'
        };
    };
    _handleCollect = () => {
        this.setState({
            isShowBtnFlag: !this.state.isShowBtnFlag
        })
    };
    onChangePagination = (page, pageSize) => {
        this.paramObj.page = (page - 1) * 7 + 1;
        this.currentPage = page;
        document.getElementById('productListId').scrollTop = 0;
        this.getProductCollectAboutScroll('pageChange');
    };
    componentWillUnmount() {
        let productListId = document.getElementById('productListId');
        productListId.removeEventListener('scroll', this.scrollEvent);
        clearTimeout(this.timer);
        this.props.dispatch(getProductCollectActiveLoading());
        this.props.dispatch(getProductCollectActive({
            list: [],
            totalCount: 0,
            totalPages: 0
        }));
    }

    render() {
        const {getFieldDecorator} = this.props.form;
        const {siteCatTag, router, collectData, isLoading, markLabel} = this.props;
        const {totalCount, totalPages, list} = collectData;
        const {cancelCollectFlag, updateCollectFlag, isSelectFlag, isShowBtnFlag, allSelect} = this.state;
        const style = {
            width_120: {width: 120},
        };
        const {limit, page} = this.paramObj;
        let pathname = router.pathname;
        return (
            <div className='h_percent100'>
                <JWPLayoutSimple {...{pathname, title: '我的收藏-火联FFDIG'}}>
                    <div className="goodsColForm bg_fff">
                        <Form layout="inline">
                            <FormItem label="收藏时间">
                                <RangePickerNew interval={1} type='start' handleSubmit={this.handleSubmitFun}
                                                resetTime={this._handleResetTimer}/>
                            </FormItem>
                            <FormItem label="平台">
                                {getFieldDecorator('site', {
                                    initialValue: '',
                                })(
                                    <Select style={style.width_120}>
                                        <Option key="-1" value="">全部</Option>
                                        {
                                            siteCatTag.SiteList.map((item, index) => {
                                                return (
                                                    <Option key={index} value={item}>{item}</Option>
                                                )
                                            })
                                        }
                                    </Select>
                                )}
                            </FormItem>
                            <FormItem label="产品标签">
                                <SelectPullDown tagList={siteCatTag.TagList} catList={siteCatTag.CatList}
                                                onKeyWord={this._handleKeyword}/>
                            </FormItem>
                            <FormItem label="">
                                {
                                    getFieldDecorator('keyword', {
                                        initialValue: '',
                                    })(
                                        <Input type="text" placeholder='产品名称关键词'/>
                                    )
                                }
                            </FormItem>
                            <FormItem>
                                <Button onClick={this._handleSubmit}>查询</Button>
                            </FormItem>
                            {/*<FormItem className="shareBtn">*/}
                            {/*<Button onClick={this.showNewLabelClassify}>分享转发</Button>*/}
                            {/*<i className="iconfont iconzhuanfa- shareIcon"/>*/}
                            {/*</FormItem>*/}
                            <FormItem className="shareBtn">
                                <Button type="primary" onClick={this._handleCollect}>批量操作</Button>
                            </FormItem>
                        </Form>
                    </div>
                    <div className={`collectWrap ${isShowBtnFlag ? 'active' : ''}`}>
                        <Checkbox checked={allSelect} onChange={this.handleAllElection}>全选</Checkbox>
                        <div className="cbWrap"/>
                        <Button size="large" type="primary" disabled={!isSelectFlag}
                                onClick={this._handlePopoverItem.bind(this, 'cancel')}>取消收藏</Button>
                        <Button size="large" type="primary" disabled={!isSelectFlag}
                                onClick={this._handlePopoverItem}>修改收藏标签</Button>
                    </div>
                    {/*ref="container"*/}
                    <div id="productListId" className="productListWrap bgActive pr">
                        {
                            list.length > 0 ? <AutoResponsive {...this.getAutoResponsiveProps()}>
                                {
                                    list.map((item, index) => {
                                        let heights = (item.cmtStar > 0 || item.cmtCount > 0) ? 120 : 88;
                                        return (
                                            <div key={item.productId}
                                                 style={{
                                                     width: 270,
                                                     height: ((270 * item.height / item.width) || 418) + heights
                                                 }}
                                                 onClick={this.handleSingleCheckbox.bind(this, item.productId)}
                                                 className={`productListItem pr ${isShowBtnFlag ? 'bgActive pointer' : ''} ${item.select ? 'select' : ''}`}>
                                                <CollectList selectFlag={isShowBtnFlag} dataList={item}
                                                             itemIndex={index}/>
                                                {/*对勾*/}
                                                <span className={`checkIcon ${item.select ? 'active' : ''}`}
                                                      style={{background: "url('../static/bgIcon/shoucang-iconpiliangxuanzhong@2x.png') no-repeat center / 100%"}}/>
                                            </div>)
                                    })
                                }
                            </AutoResponsive> : isLoading === false && <NoCollectData/>
                        }
                        <div className="spinLoading">
                            <Spin spinning={isLoading} tip="Loading..."> </Spin>
                        </div>
                        {
                            list.length > 0 && totalCount <= this.paramObj.page * 15 &&
                            <div className="noData">Ծ‸Ծ没有更多了~~</div>
                        }
                        {
                            list.length > 0 && page > 10 && (totalCount <= page * 15 || page % 7 === 0) &&
                            <div className="paginationBoX tr">
                                <Pagination current={this.currentPage} pageSize={limit * 7} total={totalCount}
                                            hideOnSinglePage={true}
                                            onChange={this.onChangePagination}/>
                            </div>
                        }
                    </div>
                    <DeleteModal visible={cancelCollectFlag} title="取消收藏" content="取消后，收藏列表将移除所选商品"
                                 hide={this.cancelPopup}
                                 sure={this._handleDeleteCollect}/>
                    <UpdateCollectLabelCpn visible={updateCollectFlag} hide={this.cancelPopup}
                                           sure={this._handleUpdateMarkLabel}/>
                </JWPLayoutSimple>
            </div>
        );
    }
}

const getUserInfo = ({account, bgPage, listPageReducer}) => {
    return {
        userInfo: account.userInfo,
        collectData: bgPage.collectData,
        siteCatTag: bgPage.siteCatTag,
        isLoading: bgPage.isLoading,
        markLabel: listPageReducer.markLabel,
    }
};
export default connect(getUserInfo)(withRouter(Form.create()(GoodsCollection)));
