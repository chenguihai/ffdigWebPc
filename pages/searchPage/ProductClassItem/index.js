import React, {Component, Fragment} from 'react'
import {connect} from "react-redux";
import {
    getNameCatActive,
    globalBreadCrumbActive,
    globalCat1FlagActive
} from "../../../actions/searchPageAction";
import {withRouter} from 'next/router'

class ProductClassItem extends Component {
    state = {
        isSelectFlag: false,
        cat2Data: [],
    };

    _handleItemCat2 = (catItem, cat2Index) => {
        this.props.onHeadSearch({cat_id: catItem.cat2_id});
        const {globalBreadCrumb} = this.props;
        globalBreadCrumb[1] = {id: catItem.cat2_id, name: catItem.cat2_name_cn, index: cat2Index};
        globalBreadCrumb[2] = {id: '', name: '', index: 0};
        this.props.dispatch(globalBreadCrumbActive(globalBreadCrumb));
    };
    handleItemCat3 = (catItem, cat2Index, index) => {
        let cat3_id = catItem.list[index].cat3_id;
        this.props.onHeadSearch({cat_id: cat3_id});
        const {globalBreadCrumb} = this.props;
        globalBreadCrumb[1] = {id: catItem.cat2_id, name: catItem.cat2_name_cn, index: cat2Index};
        globalBreadCrumb[2] = {id: catItem.list[index].cat3_id, name: catItem.list[index].cat3_name_cn, index: index};
        this.props.dispatch(globalBreadCrumbActive(globalBreadCrumb));
    };

    _handleCollapse = (cat2Index, flag, e) => {
        e.stopPropagation();
        const {nameCat, globalBreadCrumb} = this.props;
        let indexIn = globalBreadCrumb[0].index;
        nameCat.value[indexIn].list = nameCat.value[indexIn].list.map((item, index) => {
            if (cat2Index === index) {
                item.isCloseFlag = flag;
            } else {
                item.isCloseFlag = false;
            }
            return item;
        });

        this.props.dispatch(getNameCatActive(nameCat));
        this.setState({
            isSelectFlag: this.state.isSelectFlag
        })
    };

    _handleSwitchCategory = (index, item) => { //选择一级类名
        this.props.onHeadSearch({cat_id: item.cat1_id});
        let bread = {id: item.cat1_id, name: item.cat1_name_cn, index}, obj = {id: '', name: '', index: 0};
        const {globalBreadCrumb} = this.props;
        this.setState({
            cat2Data: item,
        });
        this.props.dispatch(globalCat1FlagActive(false));
        globalBreadCrumb[0] = bread;
        globalBreadCrumb[1] = obj;
        globalBreadCrumb[2] = obj;
        this.props.dispatch(globalBreadCrumbActive(globalBreadCrumb));
    };
    stopPropagationFun = (e) => {
        e.stopPropagation();
    };

    render() {
        const {globalBreadCrumb, nameCat = {}, globalCat1Flag = true, visible} = this.props;
        const {cat2Data} = this.state;
        return (
            <div className={`collapseBox ${visible ? 'active' : ''}`} onClick={this.stopPropagationFun}>
                {
                    globalCat1Flag && nameCat.value ? <ul className="productItemUl">
                            {
                                nameCat.value && nameCat.value.map((item, index) => {
                                    return (
                                        <li key={item.cat1_id}
                                            className={`pointer ${globalBreadCrumb[0].name === item.cat1_name_cn ? 'active' : ''} ${index % 2 ? '' : "borderR"} ${index + 2 >= nameCat.value.length ? "borderBottom" : ''}`}
                                            onClick={this._handleSwitchCategory.bind(this, index, item)}
                                        >{item.cat1_name_cn}</li>
                                    )
                                })
                            }
                        </ul> : nameCat.value && cat2Data.list.map((cat2Item, cat2Index) => {
                            let num = cat2Item.isCloseFlag ? cat2Item.list.length : 5,
                                data = cat2Item.list.filter((em, index) => index < num);
                            return (
                                <Fragment key={cat2Item.cat2_id}>
                                    <h3 onClick={this._handleItemCat2.bind(this, cat2Item, cat2Index)}
                                        className={`catActive ${cat2Item.cat2_id === globalBreadCrumb[1].id ? 'active' : ''}`}>{cat2Item.cat2_name_cn}</h3>
                                    <ul className="collapseUl pr">
                                        {
                                            data.map((item, index) => {
                                                return (
                                                    <li
                                                        key={item.cat3_id}><span
                                                        onClick={this.handleItemCat3.bind(this, cat2Item, cat2Index, index)}
                                                        className={`content ${item.cat3_id === globalBreadCrumb[2].id ? 'active' : ''}`}>{item.cat3_name_cn}</span>
                                                    </li>
                                                )
                                            })
                                        }
                                        {/*更多*/}
                                        {
                                            cat2Item.list.length > 5 &&
                                            <div className="listMoreWrap"
                                                 onClick={this._handleCollapse.bind(this, cat2Index, !cat2Item.isCloseFlag)}
                                            >
                                                {
                                                    !cat2Item.isCloseFlag && <span>更多</span>
                                                }
                                                <i className={`iconfont iconlb-more underCircleIcon ${cat2Item.isCloseFlag ? 'active' : ''}`}/>
                                            </div>
                                        }
                                    </ul>
                                </Fragment>
                            )
                        })

                }
            </div>
        )
    }
}

const getUserInfo = ({searchPage}) => {
    return {
        nameCat: searchPage.nameCat,
        globalBreadCrumb: searchPage.globalBreadCrumb,
        globalCat1Flag: searchPage.globalCat1Flag,
    }
};
export default connect(getUserInfo)(withRouter(ProductClassItem));