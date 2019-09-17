import React, {Component} from 'react';
import {Select} from "antd";
import './index.less'

const Option = Select.Option;

class SelectPullDown extends Component {
    state = {
        navIndex: 0,
        title: "全部",
        showSelectFlag: false
    };

    _handleNavList = (index) => {
        this.setState({
            navIndex: index
        })
    };
    handleOptionClick = (value, type) => {
        this.setState({
            title: value,
            showSelectFlag: false
        });
        this.props.onKeyWord(value, type);
    };
    _handleProductLabel = () => {
        const {showSelectFlag} = this.state;
        this.setState({
            showSelectFlag: !showSelectFlag
        });
    };
    cancelPopup = () => {
        this.setState({
            showSelectFlag: false
        });
    };

    render() {
        const {navIndex, title, showSelectFlag} = this.state;
        const {tagList, catList} = this.props;
        const style = {
            width_236: {width: '100%'}
        };
        let concat = tagList.concat(catList);
        const dataList = navIndex === 0 ? Array.from(new Set(concat)) : navIndex === 1 ? tagList : catList;
        return (
            <div className="productLabel pc">
                <span onClick={this._handleProductLabel}>{title}</span>
                {
                    showSelectFlag && <div className="selectPullDownCpn">
                        <em className="iconfont iconht-cha
 iconDelete"
                            onClick={this.cancelPopup}/>
                        <div className="nav">
                            {
                                ["全部", "我的标签", "产品分类"].map((item, index) => {
                                    return (
                                        <span key={index} onClick={this._handleNavList.bind(this, index)}
                                              className={navIndex === index ? "active" : ""}>{item}</span>
                                    )
                                })
                            }
                        </div>
                        {/*{index < 2 && <em className="dividingLine"/>}*/}
                        <div className="searchBox">
                            <Select
                                showSearch
                                open={true}
                                style={style.width_236}
                                // placeholder=""
                                optionFilterProp="children"
                                // onChange={this.handleChange}
                                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                <Option value=''>全部</Option>
                                {
                                    dataList.map((item, index) => {
                                        let type = navIndex <= 1 && dataList.length >= tagList.length && index < tagList.length ? 'marklabel' : 'cat';
                                        return (
                                            <Option onClick={this.handleOptionClick.bind(this, item, type)} key={index}
                                                    value={item}>{item}</Option>
                                        )
                                    })
                                }
                            </Select>
                            {/*<ul className="labelUl">*/}
                            {/*{*/}
                            {/*dataList.map((item, index) => {*/}
                            {/*return (*/}
                            {/*<li key={index} className="labelLi"*/}
                            {/*onClick={this.onLabelChange.bind(this, item)}>{item}</li>*/}
                            {/*)*/}
                            {/*})*/}
                            {/*}*/}
                            {/*</ul>*/}
                        </div>
                    </div>
                }
            </div>
        );
    }
}

export default SelectPullDown;