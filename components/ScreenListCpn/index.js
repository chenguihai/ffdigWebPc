import React, {Component, Fragment} from 'react';
import {
    otherScreeningActive,
    setSelectColorActive,
    setSelectDesignerActive,
    setSelectDesignerByActive, setSelectionLabelActive,
    setSelectStyleActive, setSelectTextureActive
} from "../../actions/listPageAction";
import {Checkbox, Collapse, Form, InputNumber, message, Tooltip} from "antd";
import RangePickerNew from "../RangePickerNew";
import {connect} from "react-redux";
import {getCatRelationActive} from "../../actions";
import moment from "moment";
import './index.less'

const Panel = Collapse.Panel;
const CheckboxGroup = Checkbox.Group;

const FormItem = Form.Item;

class ScreenListCpn extends Component {
    state = {
        isSelectFlag: false,
    };
    pageInfo = {};
    handleSubmitFun = (startTime, endTime) => { //时间组件返回
        let start = moment(startTime).valueOf(),
            end = moment(endTime).valueOf();
        this.props.onHeadSearch({start_time: Math.round(start / 1000), end_time: Math.round(end / 1000)});
    };
    _handleResetTimer = () => {
        this.props.onHeadSearch({start_time: 0, end_time: 0});
    };
    onDesignerChange = (checkedValues) => { //品牌
        this.props.onHeadSearch({source_brand: checkedValues.toString()});
        this.props.dispatch(setSelectDesignerActive(checkedValues));
    };
    onDesignerByChange = (checkedValues) => { //设计师
        this.props.onHeadSearch({designer: checkedValues.toString()});
        this.props.dispatch(setSelectDesignerByActive(checkedValues));
    };
    onStyleChange = (checkedValues) => { //款式
        const {selectColor, selectTexture, onHeadSearch, dispatch} = this.props;
        onHeadSearch({keyword: checkedValues.concat(selectColor, selectTexture).toString()});
        dispatch(setSelectStyleActive(checkedValues));
    };
    onColorChange = (checkedValues) => { //颜色
        const {selectStyle, selectTexture, onHeadSearch, dispatch} = this.props;
        onHeadSearch({keyword: checkedValues.concat(selectStyle, selectTexture).toString()});
        dispatch(setSelectColorActive(checkedValues));
    };
    onTextureChange = (checkedValues) => { //材质
        const {selectColor, selectStyle, onHeadSearch, dispatch} = this.props;
        onHeadSearch({keyword: checkedValues.concat(selectColor, selectStyle).toString()});
        dispatch(setSelectTextureActive(checkedValues));
    };
    _handleSearchStart = (star) => { //评论星级搜索
        const {selectStarNum = 0, selectTime = -1} = this.props.otherScreening;
        if (selectStarNum === star) {
            this.props.onHeadSearch({cmtStar: 0});
            this.props.dispatch(otherScreeningActive({selectStarNum: 0, selectTime}));
        } else {
            this.props.onHeadSearch({cmtStar: star});
            this.props.dispatch(otherScreeningActive({selectStarNum: star, selectTime}));
        }
    };
    checkUsername = (rule, value, callback) => {
        this.pageInfo[rule.field] = value;
        const {price_max, price_min} = this.pageInfo;
        if (price_max < price_min) {
            message.error('最低价格不能大于最高价格')
        }
        callback();
    };
    _handlePriceSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                // console.log(values);
                if (values.price_min <= values.price_max) {
                    this.props.onHeadSearch(values);
                }
            }
        });
    };
    _handleClearValue = () => { //清除价格输入框中的值
        this.pageInfo.price_max = null;
        this.pageInfo.price_min = 0;
        this.pageInfo.keyword = '';
        this.props.form.setFieldsValue({
            price_min: '',
            price_max: '',
        });
        this.props.onClearPriceSearch();
    };
    otherSearch = () => {
        const {form: {getFieldDecorator}, otherScreening} = this.props;
        const {selectStarNum = 0, selectTime = -1} = otherScreening;
        return (<Fragment>
                <h3>其他筛选</h3>
                <Collapse key="100" accordion bordered={false}>
                    <Panel header="价格" key="价格">
                        <Form layout="inline" className="rangeBox"
                              onSubmit={this._handlePriceSubmit}>
                            <FormItem>
                                {getFieldDecorator('price_min', {
                                    initialValue: '',
                                    rules: [
                                        {validator: this.checkUsername}
                                    ],
                                    validateTrigger: 'onBlur'
                                })(
                                    <InputNumber min={0} className="number"
                                                 placeholder="最低价格"/>
                                )}
                            </FormItem>
                            <span/>
                            <FormItem>
                                {getFieldDecorator('price_max', {
                                    initialValue: '',
                                    rules: [
                                        {validator: this.checkUsername}
                                    ],
                                    validateTrigger: 'onBlur'
                                })(
                                    <InputNumber min={0} className="number"
                                                 placeholder="最高价格"/>
                                )}
                            </FormItem>
                            <em/>
                            <i className="iconSearch"
                               onClick={this._handlePriceSubmit}>查询</i>
                            <Tooltip placement="top" title="清除"><i
                                className="iconfont iconlb-cle clearPriceIcon"
                                onClick={this._handleClearValue}/></Tooltip>
                        </Form>
                    </Panel>
                    <Panel header="上架时间" key="上架时间">
                        <RangePickerNew interval={1} data={otherScreening} type='start'
                                        resetTime={this._handleResetTimer}
                                        handleSubmit={this.handleSubmitFun}/>
                    </Panel>
                    <Panel header="评论星级" key="评论星级">
                        <ul className="collapseUl">
                            {[5, 4, 3, 2, 1].map((subItem, index) => {
                                return (

                                    <li key={index}
                                        onClick={this._handleSearchStart.bind(this, subItem)}>
                                        <i className="starIcon"
                                           style={{background: `url('../../../static/${selectStarNum === subItem ? 'xiangpingYellow' : 'xiangpingGray'}.png') no-repeat ${(5 - subItem) * -25}px center`}}/>
                                        {
                                            selectStarNum === subItem &&
                                            <i className="iconfont iconht-gou correctIcon"/>
                                        }
                                    </li>
                                )
                            })}
                        </ul>
                    </Panel>
                </Collapse>
            </Fragment>
        )
    };
    moreFun = (arr, flag, type) => { //更多
        return (arr.length > 5 &&
            <div className="listMoreWrap" onClick={this._handleStyleCollapse.bind(this, type)}>
                {
                    !flag && <span>更多</span>
                }
                <i className={`iconfont iconlb-more underCircleIcon ${flag ? 'active' : ''}`}/>
            </div>
        )
    };
    _handleStyleCollapse = (flag) => {
        const {catRelation} = this.props;
        let selectItem = ['isStyleFlag', 'isColorFlag', 'isTextureFlag', 'isDesignerFlag', 'isDesignerByFlag'],
            length = selectItem.length, item = '';
        for (let i = 0; i < length; i++) {
            item = selectItem[i];
            if (selectItem[i] === flag) {
                catRelation[item] = !catRelation[flag];
            } else {
                catRelation[item] = false;
            }
        }

        this.props.dispatch(getCatRelationActive(catRelation));
        this.setState({
            isSelectFlag: this.state.isSelectFlag
        })
    };
    onChange = (checkedValues) => { //平台
        const {site} = this.props.catRelation;
        let siteArr = [];
        for (let j = 0; j < checkedValues.length; j++) {
            for (let i = 0; i < site.length; i++) {
                if (site[i].adminSite === checkedValues[j]) {
                    siteArr = siteArr.concat(site[i].pdtSite)
                }
            }
        }
        this.props.dispatch(setSelectionLabelActive(checkedValues));
        this.props.onHeadSearch({site: siteArr.toString()});
    };
    stopPropagationFun = (e) => {
        e.stopPropagation();
    };

    render() {
        const {selectLabel = [], catRelation, selectDesignerBy = [], selectDesigner = [], selectStyle, selectColor, selectTexture, visible} = this.props;
        const {designer = [], designerBy = [], site = [], style = [], texture = [], color = [], isStyleFlag = false, isColorFlag = false, isTextureFlag = false, isDesignerFlag = false, isDesignerByFlag = false} = catRelation;
        const plainOptions = site.map((item) => item.adminSite);
        const designerOptions = designer.filter((item, index) => {
            let num = isDesignerFlag ? 20 : 5;
            return (index < num)
        });
        const designerByOptions = designerBy.filter((item, index) => {
            let num = isDesignerByFlag ? 20 : 5;
            return (index < num)
        });
        const styleOptions = style.filter((item, index) => index < 5);
        const textureOptions = texture.filter((item, index) => index < 5);
        const colorOptions = color.filter((item, index) => index < 5);
        return (
            <div className={`collapseBox ${visible ? 'active' : ''}`} onClick={this.stopPropagationFun}>
                {
                    style.length > 0 && <Fragment>
                        <h3 className="noBorder">款式</h3>
                        <ul className="collapseUl pr">
                            <CheckboxGroup
                                options={isStyleFlag ? style : styleOptions}
                                value={selectStyle}
                                onChange={this.onStyleChange}
                            />
                            {/*更多*/}
                            {
                                this.moreFun(style, isStyleFlag, 'isStyleFlag')
                            }
                        </ul>
                    </Fragment>
                }
                {
                    color.length > 0 && <Fragment>
                        <h3 className="noBorder">颜色</h3>
                        <ul className="collapseUl pr">
                            <CheckboxGroup
                                options={isColorFlag ? color : colorOptions}
                                value={selectColor}
                                onChange={this.onColorChange}
                            />
                            {/*更多*/}

                            {
                                this.moreFun(color, isColorFlag, 'isColorFlag')
                            }
                        </ul>
                    </Fragment>
                }
                {
                    texture.length > 0 && <Fragment>
                        <h3 className="noBorder">材质</h3>
                        <ul className="collapseUl pr">
                            <CheckboxGroup
                                options={isTextureFlag ? texture : textureOptions}
                                value={selectTexture}
                                onChange={this.onTextureChange}
                            />
                            {/*更多*/}
                            {
                                this.moreFun(texture, isTextureFlag, 'isTextureFlag')
                            }
                        </ul>
                    </Fragment>
                }
                {
                    designer.length > 0 && <Fragment>
                        <h3 className="noBorder">品牌</h3>
                        <ul className="collapseUl pr">
                            <CheckboxGroup
                                options={designerOptions}
                                value={selectDesigner}
                                onChange={this.onDesignerChange}
                            />
                            {/*更多*/}
                            {
                                this.moreFun(designer, isDesignerFlag, 'isDesignerFlag')
                            }
                        </ul>
                    </Fragment>
                }
                {
                    designerBy.length > 0 && <Fragment>
                        <h3 className="noBorder">设计师</h3>
                        <ul className="collapseUl pr">
                            <CheckboxGroup
                                options={designerByOptions}
                                value={selectDesignerBy}
                                onChange={this.onDesignerByChange}
                            />
                            {/*更多*/}
                            {
                                this.moreFun(designerBy, isDesignerByFlag, 'isDesignerByFlag')
                            }
                        </ul>
                    </Fragment>
                }
                {
                    site.length > 0 && <Fragment>
                        <h3 className="noBorder">平台</h3>
                        <ul className="collapseUl">
                            <CheckboxGroup
                                options={plainOptions}
                                value={selectLabel}
                                onChange={this.onChange}
                            />
                        </ul>
                    </Fragment>
                }
                {
                    this.otherSearch()
                }
            </div>
        );
    }
}

const getUserInfo = ({listPageReducer, headerReducer}) => {
    return {
        searchData: listPageReducer.searchData,
        selectLabel: listPageReducer.selectLabel,
        selectDesignerBy: listPageReducer.selectDesignerBy,
        selectDesigner: listPageReducer.selectDesigner,
        selectStyle: listPageReducer.selectStyle,
        selectColor: listPageReducer.selectColor,
        selectTexture: listPageReducer.selectTexture,
        otherScreening: listPageReducer.otherScreening,
        catRelation: headerReducer.catRelation,
    }
};
export default connect(getUserInfo)(Form.create({})(ScreenListCpn));